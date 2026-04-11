import type { NextAuthConfig } from "next-auth";

/**
 * Configuration d'authentification compatible avec le runtime Edge.
 * Utilisée principalement par le middleware (proxy.ts).
 */
export const authConfig = {
  providers: [], // Les providers sont définis dans auth.ts pour le runtime Node.js
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "COACH";
        token.hasFinishedOnboarding = user.hasFinishedOnboarding || false;
        // @ts-ignore
        token.theme = user.theme || "saison3";
      }
      if (trigger === "update" && session) {
        if (session.hasFinishedOnboarding !== undefined) token.hasFinishedOnboarding = session.hasFinishedOnboarding;
        if (session.name) token.name = session.name;
        if (session.theme) token.theme = session.theme;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        // @ts-ignore
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.role = token.role as string;
        // @ts-ignore
        session.user.hasFinishedOnboarding = token.hasFinishedOnboarding as boolean;
        // @ts-ignore
        session.user.theme = token.theme as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const isLoggedIn = !!auth?.user;
      const isOnboardingPage = nextUrl.pathname.startsWith("/auth/onboarding");
      
      if (isLoggedIn) {
        const hasFinishedOnboarding = auth?.user?.hasFinishedOnboarding;
        const onboardingSync = request.cookies.get("onboarding_sync")?.value === "true";

        if (!hasFinishedOnboarding && !onboardingSync && !isOnboardingPage && !nextUrl.pathname.startsWith("/auth/login") && !nextUrl.pathname.startsWith("/api")) {
          return Response.redirect(new URL("/auth/onboarding", nextUrl));
        }
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
