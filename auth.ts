import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
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
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    hasFinishedOnboarding?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
  trustHost: true,
});
