import { auth } from "@/auth";
import AuthProvider from "@/common/components/AuthProvider/AuthProvider";
import BannedRedirect from "@/common/components/BannedRedirect/BannedRedirect";
import DebugAuthWidget from "@/common/components/DebugAuthWidget/DebugAuthWidget";
import { prisma } from "@/lib/prisma";
import { UserRole, isModerator, getRolePower, ROLE_POWER } from "@/lib/roles";
import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/common/components/ThemeProvider/ThemeProvider";
import Navbar from "@/common/components/Navbar/Navbar";
import "./globals.css";

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

  let userRole: UserRole = "COACH";
  let isBanned = false;
  let userTheme = "saison3";

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isBanned: true, theme: true }
    });
    if (user) {
      userRole = user.role as UserRole;
      isBanned = user.isBanned;
      userTheme = user.theme || "saison3";
    }
  }

  const isMod = isModerator(userRole);
  const isAdmin = getRolePower(userRole) >= ROLE_POWER.ADMIN;

  let unreadCount = 0;
  if (session?.user?.id) {
    try {
      unreadCount = await prisma.privateMessage.count({
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
      });
    } catch {}
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <ThemeProvider attribute="data-theme" defaultTheme={userTheme} enableSystem={false}>
        <AuthProvider session={session}>
          <DebugAuthWidget />
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
          />

          <main className="main-layout-wrapper">
            {children}
          </main>
          
          <footer style={{
            position: 'fixed',
            bottom: 0,
            width: '100%',
            padding: '0.6rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--header-foreground)',
            borderTop: '1px solid var(--accent)',
            background: 'var(--footer-bg)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000
          }}>
            <Link href="/mentions-legales" style={{ textDecoration: 'underline', color: 'var(--header-foreground)', opacity: 0.8, transition: 'opacity 0.2s' }} className="footer-link">
              Mentions légales
            </Link>
            {' • '}
            <span style={{ fontStyle: 'italic', opacity: 0.7 }}>
              Ce site a été entièrement conçu avec l'aide de l'intelligence artificielle
            </span>
          </footer>
        </AuthProvider>
      </ThemeProvider>
    </body>
  </html>
  );
}
