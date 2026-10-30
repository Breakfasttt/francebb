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
import { DEFAULT_SITE_THEME } from "@/lib/themes";
import { ThemeProvider } from "@/common/components/ThemeProvider/ThemeProvider";
import Navbar from "@/common/components/Navbar/Navbar";
import AppShell from "@/common/components/AppShell/AppShell";
import { getNavCounts } from "@/common/components/Navbar/navCounts";
import CookieBanner from "@/common/components/CookieBanner/CookieBanner";
import "./tailwind.css";
import "./globals-mobile.css";
import "@/common/styles/widgets.css";


// Police du site (ADR 0006, carte 079) : Inter, servie par le site lui-même (licence libre OFL, app/fonts/).
// Le build ne demande pas de réseau et aucune donnée de visiteur ne part chez Google. La variable CSS --font-bb
// est lue par le CSS historique (globals.css, thèmes) et par les variables v2 (--bb-font-sans).
const interFont = localFont({
  src: "./fonts/inter-latin-wght.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-bb",
});

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
  const userTheme = user?.theme || DEFAULT_SITE_THEME;

  const isMod = isModerator(userRole);
  const isAdmin = getRolePower(userRole) >= ROLE_POWER.ADMIN;
  // Compteurs de la barre de navigation : la promesse est transmise sans l'attendre, pour ne pas retarder la page
  const navCounts = user?.id ? getNavCounts(user.id, isMod) : undefined;
  // Nouvelle coquille de la refonte (ADR 0006, carte 081) ; REFONTE=0 rend l'ancienne barre et son menu latéral
  const refonte = process.env.REFONTE !== "0";

  return (
    <html lang="fr" data-theme={userTheme} className={interFont.variable} suppressHydrationWarning>
      <body suppressHydrationWarning className={refonte ? "refonte-shell" : undefined} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <ThemeProvider attribute="data-theme" defaultTheme={userTheme} preferStoredTheme={!session?.user?.id} enableSystem={false}>
        <AuthProvider session={session}>
          <DebugAuthWidget />
          <DebugThemeWidget />
        <BannedRedirect isBanned={isBanned} />
          <Toaster />
          
          {refonte ? (
            <AppShell
              user={user ? { id: user.id, name: user.name, image: user.image } : null}
              hubLogout={!!session?.hubLogout}
              isAdmin={isAdmin}
              isMod={isMod}
              counts={navCounts}
            />
          ) : (
            <Navbar session={session} isAdmin={isAdmin} isMod={isMod} counts={navCounts} />
          )}

          <main className="main-layout-wrapper">
            {children}
          </main>
          
          <footer className="global-footer desktop-only">
            <Link href="/mentions-legales" className="footer-link">
              Mentions légales
            </Link>
            <span className="footer-text">
              Conçu avec l'aide de l'IA
            </span>
            <a 
              href="https://github.com/Breakfasttt/francebb" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-link"
            >
              <Github size={14} /> GitHub
            </a>
            <Link href="/statistiques" className="footer-link">
              <BarChart3 size={14} /> Statistiques
            </Link>
            <Link href="/media" className="footer-link">
              <ImageIcon size={14} /> Médias
            </Link>
          </footer>

          <CookieBanner />
        </AuthProvider>
      </ThemeProvider>
    </body>
  </html>
  );
}
