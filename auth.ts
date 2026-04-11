import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { DefaultSession } from "next-auth";

/**
 * Extension des types de session pour inclure le rôle et l'ID.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Nodemailer({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    /**
     * Callback de connexion : 
     * - Gère les droits SuperAdmin via le .env
     * - Gère le mapping avec les anciens comptes Forumactif
     */
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // 1. Vérification SuperAdmin
      const superAdminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
      const isSuperAdmin = superAdminEmails.includes(user.email.toLowerCase());

      // 2. Recherche d'un mapping legacy (Forumactif)
      const legacyMember = await prisma.legacyMember.findUnique({
        where: { email: user.email.toLowerCase() }
      });

      // 3. Mise à jour de l'utilisateur s'il existe déjà ou va être créé
      // Note: Auth.js v5 gère la création automatique, mais on peut injecter des données ici via le DB Adapter.
      // Dans le cas du signin, l'utilisateur en base peut déjà exister.
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() }
      });

      if (dbUser) {
        const updates: any = {};
        
        // Appliquer le rôle SuperAdmin si configuré
        if (isSuperAdmin && dbUser.role !== "SUPERADMIN") {
          updates.role = "SUPERADMIN";
        }

        // Lier les infos legacy si non fait
        if (legacyMember && !dbUser.legacyId) {
          updates.legacyId = legacyMember.id;
          updates.forumactifName = legacyMember.forumactifName;
          if (legacyMember.nafNumber && !dbUser.nafNumber) {
            updates.nafNumber = legacyMember.nafNumber;
          }
        }

        if (Object.keys(updates).length > 0) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: updates
          });
        }
      }

      return true;
    },

    /**
     * Callback de session : transmet le rôle et l'ID au client.
     */
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role || "COACH";
      }
      return session;
    },
  },
  events: {
    /**
     * Au moment de la création du compte (premier login) :
     * - On vérifie si c'est un SuperAdmin par email.
     * - On vérifie s'il y a un mapping Legacy Forumactif.
     */
    async createUser({ user }) {
      if (!user.email) return;

      const updates: any = {};

      // 1. Check SuperAdmin
      const superAdminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
      if (superAdminEmails.includes(user.email.toLowerCase())) {
        updates.role = "SUPERADMIN";
      }

      // 2. Check Legacy Mapping
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
  },
  secret: process.env.AUTH_SECRET,
});
