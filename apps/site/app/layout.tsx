import { getSession } from "@/lib/authGuard";
import AuthProvider from "@/common/components/AuthProvider/AuthProvider";
import BannedRedirect from "@/common/components/BannedRedirect/BannedRedirect";
import DebugAuthWidget from "@/common/components/DebugAuthWidget/DebugAuthWidget";
import DebugThemeWidget from "@/common/components/DebugThemeWidget/DebugThemeWidget";
import { UserRole, isModerator, getRolePower, ROLE_POWER } from "@/lib/roles";
import { Github, BarChart3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "@bbfrance/ui";
import { ThemeProvider } from "@/common/components/ThemeProvider/ThemeProvider";
import Navbar from "@/common/components/Navbar/Navbar";
import { getNavCounts } from "@/common/components/Navbar/navCounts";
import CookieBanner from "@/common/components/CookieBanner/CookieBanner";
import "./tailwind.css";
import "./globals-mobile.css";
import "@/common/styles/widgets.css";


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
  // d'auth.ts les relit en base au plus toutes les 5 minutes.
  const user = session?.user;
  const userRole = (user?.role as UserRole | undefined) ?? "COACH";
  const isBanned = user?.isBanned ?? false;
  const userTheme = user?.theme || "saison3";

  const isMod = isModerator(userRole);
  const isAdmin = getRolePower(userRole) >= ROLE_POWER.ADMIN;
  // Compteurs de la barre de navigation : la promesse est transmise sans l'attendre, pour ne pas retarder la page
  const navCounts = user?.id ? getNavCounts(user.id, isMod) : undefined;

  return (
    <html lang="fr" data-theme={userTheme} suppressHydrationWarning>
      <body suppressHydrationWarning style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <ThemeProvider attribute="data-theme" defaultTheme={userTheme} preferStoredTheme={!session?.user?.id} enableSystem={false}>
        <AuthProvider session={session}>
          <DebugAuthWidget />
          <DebugThemeWidget />
        <BannedRedirect isBanned={isBanned} />
          <Toaster />
          
          <Navbar session={session} isAdmin={isAdmin} isMod={isMod} counts={navCounts} />

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
          </footer>

          <CookieBanner />
        </AuthProvider>
      </ThemeProvider>
    </body>
  </html>
  );
}
