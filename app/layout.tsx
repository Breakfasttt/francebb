import { auth } from "@/auth";
import AuthProvider from "@/common/components/AuthProvider/AuthProvider";
import BannedRedirect from "@/common/components/BannedRedirect/BannedRedirect";
import DebugAuthWidget from "@/common/components/DebugAuthWidget/DebugAuthWidget";
import { SignInButton } from "@/common/components/SignInButton/SignInButton";
import { prisma } from "@/lib/prisma";
import { UserRole, isModerator, getRolePower, ROLE_POWER } from "@/lib/roles";
import { Mail, ShieldAlert, Settings } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/common/components/ThemeProvider/ThemeProvider";
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
          <DebugAuthWidget />
        <BannedRedirect isBanned={isBanned} />
        <AuthProvider session={session}>
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: 'var(--card-bg)',
              color: 'var(--foreground)',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(10px)',
            },
          }} />
          <nav className="nav">
            <Link href="/" className="logo" style={{
              background: 'linear-gradient(135deg, #002395 0%, #ffffff 50%, #ED2939 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent'
            }}>France<span> Blood Bowl</span></Link>
            <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {isAdmin && (
                <Link
                  href="/administration"
                  title="Administration"
                  style={{ color: 'var(--foreground)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                >
                  <Settings size={22} />
                </Link>
              )}
              {isMod && (
                <Link
                  href="/moderation"
                  title="Modération"
                  style={{ color: 'var(--foreground)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                >
                  <ShieldAlert size={22} />
                </Link>
              )}
              {session?.user && (
                <a
                  href="/profile?tab=pm"
                  title={`${unreadCount} message(s) non lu(s)`}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--foreground)',
                    textDecoration: 'none'
                  }}
                >
                  <Mail size={22} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-10px',
                      background: 'var(--primary)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </a>
              )}
              <SignInButton user={session?.user} />
            </div>
          </nav>
          <main style={{ flex: 1, width: '100%', paddingBottom: '3rem' }}>
            {children}
          </main>
          <footer style={{
            position: 'fixed',
            bottom: 0,
            width: '100%',
            padding: '0.6rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            borderTop: '1px solid var(--glass-border)',
            background: 'var(--footer-bg)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000
          }}>
            <Link href="/mentions-legales" style={{ textDecoration: 'underline', color: 'var(--text-secondary)', transition: 'color 0.2s' }} className="footer-link">
              Mentions légales
            </Link>
            {' • '}
            <span style={{ fontStyle: 'italic' }}>
              Ce site a été entièrement conçu avec l'aide de l'intelligence artificielle
            </span>
          </footer>
        </AuthProvider>
      </ThemeProvider>
    </body>
  </html>
  );
}
