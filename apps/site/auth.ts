import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, prismaWithEmail } from "@/lib/prisma";
import { authConfig } from "./auth.config";
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
/**
 * Délai maximal entre deux relectures du profil en base par le callback jwt (carte 017) : 5 minutes.
 * C'est aussi le délai maximal pour qu'un bannissement, un changement de rôle ou un changement de pseudo
 * fait par quelqu'un d'autre prenne effet sur la session du membre concerné. Cinq minutes limitent ce
 * délai tout en supprimant une requête sur presque chaque page vue (un membre change de page bien plus souvent).
 */
const SESSION_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

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
      },
    ]
  : [];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prismaWithEmail as unknown as Parameters<typeof PrismaAdapter>[0]),
  session: { strategy: "jwt" },
  providers: [
    ...hubProviders,
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
          return null;
        }
      },
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
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      // Hub : refuser un compte dont l'email n'est pas certifié (sinon rattachement à un membre usurpable)
      if (account?.provider === "hub" && profile?.email_verified !== true) return false;
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

      // 2. Relecture du profil en base (rôle, bannissement, thème, pseudo), limitée dans le temps (carte 017).
      // À la connexion (user présent), les données viennent d'être lues : on note seulement l'heure.
      // Ensuite, on ne relit la base que si la dernière lecture date de plus de SESSION_REFRESH_INTERVAL_MS,
      // ou si le navigateur demande une mise à jour de la session (update()). Dans ce dernier cas, la base
      // écrase les valeurs envoyées par le navigateur : il ne peut donc pas s'attribuer un rôle lui-même.
      // Le jeton relu n'est enregistré dans le cookie que par proxy.ts (et par la route /api/auth) :
      // un composant serveur ne peut pas réécrire le cookie, il relit donc la base tant que le cookie est ancien.
      const now = Date.now();
      if (user) updatedToken.refreshedAt = now;
      const refreshedAt = typeof updatedToken.refreshedAt === "number" ? updatedToken.refreshedAt : 0;
      const isStale = now - refreshedAt > SESSION_REFRESH_INTERVAL_MS;
      if (updatedToken?.id && !user && (isStale || trigger === "update")) {
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
          
          if (dbUser) {
            updatedToken.role = dbUser.role;
            updatedToken.hasFinishedOnboarding = dbUser.hasFinishedOnboarding;
            updatedToken.theme = dbUser.theme || "saison3";
            updatedToken.name = dbUser.name;
            updatedToken.isBanned = dbUser.isBanned;
          }
          updatedToken.refreshedAt = now;
        } catch (error) {
          console.error("Auth: Error refreshing user data from DB in JWT callback", error);
        }
      }

      return updatedToken;
    },
  },
  events: {
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
