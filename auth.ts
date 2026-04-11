import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import Nodemailer from "next-auth/providers/nodemailer";
import type { DefaultSession } from "next-auth";

/**
 * Extension des types de session pour inclure le rôle et l'ID.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      hasFinishedOnboarding: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    hasFinishedOnboarding?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
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
    ...authConfig.callbacks,
    /**
     * Callback JWT : injecte les infos utilisateur dans le token.
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "COACH";
        token.hasFinishedOnboarding = user.hasFinishedOnboarding || false;
      }
      if (trigger === "update" && session) {
        token.hasFinishedOnboarding = session.hasFinishedOnboarding;
        token.name = session.name;
      }
      return token;
    },

    /**
     * Callback de session : transmet le rôle et l'ID au client.
     */
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.hasFinishedOnboarding = token.hasFinishedOnboarding as boolean;
      }
      return session;
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
  },
  secret: process.env.AUTH_SECRET,
});
