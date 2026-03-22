import { auth } from "@/auth";
import AuthProvider from "@/components/AuthProvider";
import BannedRedirect from "@/components/BannedRedirect";
import DebugAuthWidget from "@/components/DebugAuthWidget";
import { SignInButton } from "@/components/SignInButton";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/roles";
import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
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

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isBanned: true }
    });
    if (user) {
      userRole = user.role as UserRole;
      isBanned = user.isBanned;
    }
  }

  const isAdmin = false; // kept for future use

  return (
    <html lang="fr">
      <body suppressHydrationWarning style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <DebugAuthWidget />
        <BannedRedirect isBanned={isBanned} />
        <AuthProvider session={session}>
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: '#1a1a20',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
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
            color: '#666',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(10, 10, 12, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000
          }}>
            <Link href="/mentions-legales" style={{ textDecoration: 'underline', color: '#888', transition: 'color 0.2s' }} className="footer-link">
              Mentions légales
            </Link>
            {' • '}
            <span style={{ fontStyle: 'italic' }}>
              Ce site a été entièrement conçu avec l'aide de l'intelligence artificielle
            </span>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
