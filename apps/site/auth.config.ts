import type { NextAuthConfig } from "next-auth";

/**
 * Partie de la configuration d'authentification qui ne lit pas la base (rappels jwt, session et authorized).
 * Elle est complétée dans auth.ts, qu'utilisent à la fois les pages et le proxy (proxy.ts).
 */
export const authConfig = {
  providers: [], // Les providers sont définis dans auth.ts pour le runtime Node.js
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "COACH";
        token.hasFinishedOnboarding = user.hasFinishedOnboarding || false;
        token.isBanned = user.isBanned || false;
        // @ts-ignore
        token.theme = user.theme || "saison3";
      }
      if (trigger === "update" && session) {
        if (session.hasFinishedOnboarding !== undefined) token.hasFinishedOnboarding = session.hasFinishedOnboarding;
        if (session.name) token.name = session.name;
        if (session.theme) token.theme = session.theme;
        // Le rôle ne vient jamais du navigateur : il est relu en base par auth.ts (sécurité, carte 017)
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
        session.user.isBanned = (token.isBanned as boolean) || false;
        // @ts-ignore
        session.user.theme = token.theme as string;
      }
      // Le jeton du hub reste dans le cookie chiffré : le navigateur sait seulement qu'il faut passer par /auth/logout
      if (token && typeof token.hubIdToken === "string") session.hubLogout = true;
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
