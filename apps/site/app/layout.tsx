import { getSession } from "@/lib/authGuard";
import AuthProvider from "@/common/components/AuthProvider/AuthProvider";
import BannedRedirect from "@/common/components/BannedRedirect/BannedRedirect";
import DebugAuthWidget from "@/common/components/DebugAuthWidget/DebugAuthWidget";
import DebugThemeWidget from "@/common/components/DebugThemeWidget/DebugThemeWidget";
import { UserRole, isModerator, getRolePower, ROLE_POWER } from "@/lib/roles";
import { Github, BarChart3, Image as ImageIcon } from "lucide-react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { Toaster } from "@bbfrance/ui";
import { cookies } from "next/headers";
import { DEFAULT_SITE_THEME, THEME_COOKIE, isSiteTheme } from "@/lib/themes";
import { ThemeProvider } from "@/common/components/ThemeProvider/ThemeProvider";
import AppShell from "@/common/components/AppShell/AppShell";
import NewLookBanner from "@/common/components/AppShell/NewLookBanner";
import { getNavCounts } from "@/common/components/AppShell/navCounts";
import CookieBanner from "@/common/components/CookieBanner/CookieBanner";
import BBCodeInteractions from "@/common/components/BBCodeContent/BBCodeInteractions";
import NavigationProgress from "@/common/components/NavigationProgress/NavigationProgress";
import { Suspense } from "react";
import "./tailwind.css";


// Police du site (ADR 0006, carte 079) : Inter, servie par le site lui-même (licence libre OFL, app/fonts/).
// Le build ne demande pas de réseau et aucune donnée de visiteur ne part chez Google. La variable CSS --font-bb
// est lue par les variables v2 (--bb-font-sans, packages/ui/src/tokens.css).
const interFont = localFont({
  src: "./fonts/inter-latin-wght.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-bb",
});

/** Lien du pied de page : discret, souligné au survol. */
const footerLinkClass = "inline-flex items-center gap-1.5 py-1 text-bb-nav-text no-underline opacity-85 hover:text-bb-nav-active hover:underline hover:opacity-100";

export const metadata: Metadata = {
  title: "BBFrance - Tournois de Blood Bowl en France",
  description: "La plateforme de référence pour les tournois de Blood Bowl en France.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  // Rôle, bannissement et thème viennent de la session (cookie), sans requête en base : le callback jwt
  // d'auth.ts les relit en base à chaque lecture de la session (carte 069).
  const user = session?.user;
  const userRole = (user?.role as UserRole | undefined) ?? "COACH";
  const isBanned = user?.isBanned ?? false;
  // Visiteur non connecté : thème gardé dans le cookie `bbfrance_theme` (écrit par ThemeProvider), pour que la page
  // arrive déjà dans ce thème au lieu de passer un instant par le thème par défaut (carte 147, ADR 0005). La mise en
  // page lit déjà le cookie de session : lire ce cookie-là ne change rien à la façon dont les pages sont calculées.
  const visitorTheme = user ? undefined : (await cookies()).get(THEME_COOKIE)?.value;
  const userTheme = user?.theme || (visitorTheme && isSiteTheme(visitorTheme) ? visitorTheme : DEFAULT_SITE_THEME);

  const isMod = isModerator(userRole);
  const isAdmin = getRolePower(userRole) >= ROLE_POWER.ADMIN;
  // Compteurs de la barre de navigation : la promesse est transmise sans l'attendre, pour ne pas retarder la page
  const navCounts = user?.id ? getNavCounts(user.id, isMod) : undefined;

  return (
    <html lang="fr" data-theme={userTheme} className={interFont.variable} suppressHydrationWarning>
      <body suppressHydrationWarning className="flex min-h-screen flex-col">
        {/* Lien « Aller au contenu » (carte 189) : caché, il apparaît en haut à gauche dès qu'on arrive dessus avec la
            touche Tabulation (c'est le premier élément de la page), et permet de sauter la barre de navigation pour aller droit au contenu de la page. */}
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9000] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-bb-md focus:bg-bb-accent focus:px-4 focus:font-bb-sans focus:font-semibold focus:text-bb-on-accent focus:outline-2 focus:outline-offset-2 focus:outline-bb-focus"
        >
          Aller au contenu
        </a>

        <ThemeProvider attribute="data-theme" defaultTheme={userTheme} preferStoredTheme={!session?.user?.id} enableSystem={false}>
        <AuthProvider session={session}>
          <DebugAuthWidget />
          <DebugThemeWidget />
        <BannedRedirect isBanned={isBanned} />
          <Toaster />
          <BBCodeInteractions />
          {/* Barre de progression en haut de l'écran pendant une navigation (carte 188). Suspense : la barre lit
              l'adresse de la page (useSearchParams), ce que Next.js demande d'isoler ainsi. */}
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          
          <AppShell
            user={user ? { id: user.id, name: user.name, image: user.image } : null}
            hubLogout={!!session?.hubLogout}
            isAdmin={isAdmin}
            isMod={isMod}
            counts={navCounts}
          />

          <main id="contenu" tabIndex={-1} className="main-layout-wrapper outline-none">
            {user?.id ? <NewLookBanner isLoggedIn /> : null}
            {children}
          </main>
          
          {/* Pied de page, sur ordinateur seulement (sur téléphone, ces liens sont dans le panneau « Plus »).
              Fixé en bas de l'écran ; restylé avec les variables v2 par la carte 090. */}
          <footer className="fixed inset-x-0 bottom-0 z-[5000] hidden items-center justify-center gap-6 border-t border-bb-nav-border bg-bb-nav-bg px-4 py-1.5 font-bb-sans text-[0.8rem] text-bb-nav-text lg:flex">
            <Link href="/mentions-legales" className={footerLinkClass}>
              Mentions légales
            </Link>
            <span className="italic opacity-75">
              Conçu avec l’aide de l’IA
            </span>
            <a 
              href="https://github.com/Breakfasttt/francebb" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={footerLinkClass}
            >
              <Github size={14} aria-hidden="true" /> GitHub
            </a>
            <Link href="/statistiques" className={footerLinkClass}>
              <BarChart3 size={14} aria-hidden="true" /> Statistiques
            </Link>
            <Link href="/media" className={footerLinkClass}>
              <ImageIcon size={14} aria-hidden="true" /> Médias
            </Link>
          </footer>

          <CookieBanner />
        </AuthProvider>
      </ThemeProvider>
    </body>
  </html>
  );
}
