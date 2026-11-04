import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, prismaWithEmail } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { DEFAULT_SITE_THEME } from "@/lib/themes";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import Nodemailer from "next-auth/providers/nodemailer";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      hasFinishedOnboarding: boolean;
      isBanned: boolean;
      theme?: string;
    } & DefaultSession["user"];
    /** Membre connecté via le hub (AUTH_MODE=hub) : la déconnexion doit aussi fermer la session du hub. */
    hubLogout?: boolean;
  }

  interface User {
    role?: string;
    hasFinishedOnboarding?: boolean;
    isBanned?: boolean;
    nafNumber?: string | null;
  }
}

/**
 * Hub d'identité (P5, ADR-0003) : actif seulement si AUTH_MODE=hub. Sinon (défaut, "legacy") rien ne change.
 * Le hub ne transmet que des emails vérifiés (contrôle dans signIn) : on peut rattacher au membre existant
 * par email, sans re-onboarding. La table User du site reste la référence (projection locale du compte hub).
 */
export const isHubAuthMode = process.env.AUTH_MODE === "hub" && !!process.env.HUB_ISSUER;
const hubProviders = isHubAuthMode
  ? [
      {
        id: "hub",
        name: "Compte BBFrance",
        type: "oidc" as const,
        issuer: process.env.HUB_ISSUER,
        clientId: process.env.HUB_CLIENT_ID,
        clientSecret: process.env.HUB_CLIENT_SECRET,
        checks: ["pkce", "state"] as ("pkce" | "state")[],
        allowDangerousEmailAccountLinking: true,
        // Profil du passeport (lecture) et modification depuis le profil du site (ADR-0007, carte 122)
        authorization: { params: { scope: "openid profile email offline_access bbfrance:profile bbfrance:profile:write" } },
      },
    ]
  : [];

/**
 * Connexion directe du site (Discord, Google, lien par email), utilisée seulement hors mode hub.
 * En mode hub, ces moyens passent tous par le hub (carte 073) : les garder ici laisserait une seconde porte
 * d'entrée qui contourne le hub (bannissement global, déconnexion globale). Décision du responsable
 * (4 novembre 2026) : cette connexion directe disparaîtra dès que le hub sera en ligne (carte 161).
 *
 * allowDangerousEmailAccountLinking rattache un compte Discord ou Google à un membre existant qui a la même adresse.
 * Ce n'est sûr que si l'adresse est vérifiée chez Discord ou Google : le rappel signIn refuse sinon (carte 160).
 */
const directProviders = isHubAuthMode
  ? []
  : [
      Discord({
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
      Nodemailer({
        server: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        },
        from: process.env.EMAIL_FROM,
      }),
    ];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prismaWithEmail as unknown as Parameters<typeof PrismaAdapter>[0]),
  session: { strategy: "jwt" },
  providers: [
    ...hubProviders,
    ...directProviders,
    Credentials({
      id: "dev-login",
      name: "Dev Login",
      credentials: {
        userId: { label: "User ID", type: "text" },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV !== "development") return null;
        if (!credentials?.userId) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { id: credentials.userId as string },
          });

          if (!user) return null;
          return user;
        } catch (error) {
          // Connexion de développement seulement : sans ce journal, une panne de la base passait pour un simple refus
          console.error("Auth: dev-login database error", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      // Refuser un compte dont l'email n'est pas certifié : sinon, il serait rattaché à un membre existant qui a la
      // même adresse, et n'importe qui pourrait prendre son compte (hub, puis Discord et Google, carte 160).
      if (account?.provider === "hub" && profile?.email_verified !== true) return false;
      if (account?.provider === "discord" && (profile as { verified?: boolean } | undefined)?.verified !== true) {
        return "/auth/error?error=EmailNotVerified";
      }
      if (account?.provider === "google" && profile?.email_verified !== true) {
        return "/auth/error?error=EmailNotVerified";
      }
      if (!user?.email || !user?.id) return true;
      
      const superAdminEmails = (process.env.SUPERADMIN_EMAILS || "")
        .split(",")
        .map(e => e.trim().toLowerCase())
        .filter(e => e !== "");

      if (superAdminEmails.includes(user.email.toLowerCase())) {
        // Optionnel : ne faire l'update que si nécessaire pour économiser une requête
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        });

        if (dbUser && dbUser.role !== "SUPERADMIN") {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "SUPERADMIN" }
          });
          user.role = "SUPERADMIN"; // Mettre à jour l'objet user pour le JWT suivant
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      // 1. Appliquer la logique de base (config edge)
      // @ts-ignore
      const updatedToken = await authConfig.callbacks.jwt({ token, user, trigger, session });

      // Connexion via le hub : garder son jeton d'identité pour la déconnexion globale (route /auth/logout)
      if (account?.provider === "hub" && account.id_token) updatedToken.hubIdToken = account.id_token;

      // 2. Relecture du profil en base (rôle, bannissement, thème, pseudo) à chaque lecture de la session (carte 069).
      // Ainsi, un bannissement ou un changement de rôle prend effet dès la page suivante du membre concerné.
      // La lecture se fait par l'identifiant du membre (clé primaire de la table), elle reste donc très rapide.
      // À la connexion (user présent), les données viennent d'être lues : pas besoin de relire la base.
      // Quand le navigateur demande une mise à jour de la session (update()), la base écrase les valeurs qu'il
      // envoie : il ne peut donc pas s'attribuer un rôle lui-même (règle de la carte 017, voir auth.config.ts).
      if (updatedToken?.id && !user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: updatedToken.id as string },
            select: { 
              role: true, 
              hasFinishedOnboarding: true, 
              theme: true, 
              name: true,
              isBanned: true
            }
          });
          
          // Membre supprimé entre-temps : la session est fermée (carte 160). Avant, le jeton gardait son ancien rôle
          // jusqu'à son expiration (30 jours), et un administrateur supprimé gardait ses droits.
          if (!dbUser) return null;
          updatedToken.role = dbUser.role;
          updatedToken.hasFinishedOnboarding = dbUser.hasFinishedOnboarding;
          updatedToken.theme = dbUser.theme || DEFAULT_SITE_THEME;
          updatedToken.name = dbUser.name;
          updatedToken.isBanned = dbUser.isBanned;
        } catch (error) {
          // Base injoignable : dans le doute, pas de droits supérieurs à ceux d'un coach (carte 160). Le cookie peut
          // garder ce rôle réduit un instant ; dès que la base répond, le vrai rôle est relu à la lecture suivante.
          console.error("Auth: Error refreshing user data from DB in JWT callback", error);
          return { ...updatedToken, role: "COACH" };
        }
      }

      return updatedToken;
    },
  },
  events: {
    // Connexion par le hub (carte 122) : copie locale du passeport à jour, et jetons du hub gardés à jour pour
    // pouvoir lui envoyer les modifications du profil (Auth.js ne les enregistre qu'à la première connexion)
    async signIn({ user, account, profile }) {
      if (account?.provider !== "hub" || !user.id) return;
      const claims = (profile ?? {}) as { name?: string; picture?: string; naf?: string | null; region?: string | null };
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(claims.name ? { name: claims.name } : {}),
          ...(claims.picture !== undefined ? { image: claims.picture ?? null } : {}),
          ...("naf" in claims ? { nafNumber: claims.naf ?? null } : {}),
          ...("region" in claims ? { region: claims.region ?? null } : {}),
        },
      });
      await prisma.account.updateMany({
        where: { provider: "hub", providerAccountId: account.providerAccountId },
        data: {
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
          scope: account.scope,
          id_token: account.id_token,
        },
      });
    },
    async createUser({ user }) {
      if (!user.email) return;
      const updates: any = {};
      const superAdminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
      if (superAdminEmails.includes(user.email.toLowerCase())) {
        updates.role = "SUPERADMIN";
      }
      const legacyMember = await prisma.legacyMember.findUnique({
        where: { email: user.email.toLowerCase() }
      });
      if (legacyMember) {
        updates.legacyId = legacyMember.id;
        updates.forumactifName = legacyMember.forumactifName;
        if (legacyMember.nafNumber && !user.nafNumber) {
          updates.nafNumber = legacyMember.nafNumber;
        }
      }
      if (Object.keys(updates).length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: updates
        });
      }
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
