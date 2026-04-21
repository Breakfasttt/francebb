import { auth } from "@/auth";
import AuthProvider from "@/common/components/AuthProvider/AuthProvider";
import BannedRedirect from "@/common/components/BannedRedirect/BannedRedirect";
import DebugAuthWidget from "@/common/components/DebugAuthWidget/DebugAuthWidget";
import DebugThemeWidget from "@/common/components/DebugThemeWidget/DebugThemeWidget";
import { prisma } from "@/lib/prisma";
import { UserRole, isModerator, getRolePower, ROLE_POWER } from "@/lib/roles";
import { Github } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/common/components/ThemeProvider/ThemeProvider";
import Navbar from "@/common/components/Navbar/Navbar";
import CookieBanner from "@/common/components/CookieBanner/CookieBanner";
import "./globals.css";
import "./globals-mobile.css";
import "@/common/styles/widgets.css";


export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BBFrance - Tournois de Blood Bowl en France",
  description: "La plateforme de référence pour les tournois de Blood Bowl en France.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // 1. Initialisation des variables par défaut
  let userRole: UserRole = "COACH";
  let isBanned = false;
  let userTheme = "saison3";
  let pendingModCount = 0;
  let unreadCount = 0;

  // 2. Fetching asynchrone parallélisé des données globales
  if (session?.user?.id) {
    try {
      const [user, pmCount] = await Promise.all([
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: { role: true, isBanned: true, theme: true }
        }),
        prisma.privateMessage.count({
          where: {
            conversation: {
              OR: [
                { user1Id: session.user.id },
                { user2Id: session.user.id }
              ]
            },
            authorId: { not: session.user.id },
            readAt: null
          }
        })
      ]);

      if (user) {
        userRole = user.role as UserRole;
        isBanned = user.isBanned;
        userTheme = user.theme || "saison3";
        unreadCount = pmCount;

        // 3. Si modérateur, fetcher les compteurs de modération en parallèle
        if (isModerator(userRole)) {
          const [reports, resources] = await Promise.all([
            prisma.moderationReport.count({ where: { status: "PENDING" } }),
            prisma.resource.count({ where: { status: "PENDING" } })
          ]);
          pendingModCount = reports + resources;
        }
      }
    } catch (error) {
      console.error("Layout data fetching error:", error);
    }
  }

  const isMod = isModerator(userRole);
  const isAdmin = getRolePower(userRole) >= ROLE_POWER.ADMIN;

  return (
    <html lang="fr" data-theme={userTheme} suppressHydrationWarning>
      <body suppressHydrationWarning style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <ThemeProvider attribute="data-theme" defaultTheme={userTheme} enableSystem={false}>
        <AuthProvider session={session}>
          <DebugAuthWidget />
          <DebugThemeWidget />
        <BannedRedirect isBanned={isBanned} />
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: 'var(--card-bg)',
              color: 'var(--foreground)',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(10px)',
            },
          }} />
          
          <Navbar 
            session={session} 
            isAdmin={isAdmin} 
            isMod={isMod} 
            unreadCount={unreadCount} 
            pendingModCount={pendingModCount}
          />

          <main className="main-layout-wrapper">
            {children}
          </main>
          
          <footer className="global-footer desktop-only">
            <Link href="/mentions-legales" className="footer-link">
              Mentions légales
            </Link>
            {' • '}
            <span className="footer-text">
              Ce site a été entièrement conçu avec l'aide de l'intelligence artificielle
            </span>
            {' • '}
            <a 
              href="https://github.com/Breakfasttt/francebb" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-link github-link"
            >
              <Github size={14} /> GitHub
            </a>
          </footer>
          <CookieBanner />
        </AuthProvider>
      </ThemeProvider>
    </body>
  </html>
  );
}
