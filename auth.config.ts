import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

/**
 * Configuration d'authentification compatible avec le runtime Edge.
 * (Sans adaptateurs de base de données ni modules Node.js indisponibles)
 */
export const authConfig = {
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnboardingPage = nextUrl.pathname.startsWith("/auth/onboarding");
      
      // Logique de redirection pour l'onboarding
      if (isLoggedIn) {
        // @ts-ignore
        const hasFinishedOnboarding = auth.user.hasFinishedOnboarding;
        if (!hasFinishedOnboarding && !isOnboardingPage && !nextUrl.pathname.startsWith("/auth/login")) {
          return Response.redirect(new URL("/auth/onboarding", nextUrl));
        }
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
