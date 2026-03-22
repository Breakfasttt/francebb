import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { auth } from "@/auth";
import { Toaster } from "react-hot-toast";
import { SignInButton } from "@/components/SignInButton";
import Link from "next/link";
import { Settings, MessageSquare } from "lucide-react";
import { canManageRoles, UserRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

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
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    if (user) userRole = user.role as UserRole;
  }

  const isAdmin = canManageRoles(userRole);

  return (
    <html lang="fr">
      <body suppressHydrationWarning>
        <AuthProvider session={session}>
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: '#1a1a20',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }} />
          <nav className="nav">
            <Link href="/" className="logo">France<span>Blood Bowl</span></Link>
            <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Link href="/forum" className="nav-link" title="Forum">
                <MessageSquare size={20} />
                <span className="hide-mobile">Forum</span>
              </Link>
              {isAdmin && (
                <Link href="/admin/users" className="nav-link" title="Administration">
                  <Settings size={20} />
                  <span className="hide-mobile">Admin</span>
                </Link>
              )}
              <SignInButton />
            </div>
          </nav>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
