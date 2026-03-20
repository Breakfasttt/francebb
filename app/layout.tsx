import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { auth } from "@/auth";
import { SignInButton } from "@/components/SignInButton";
import Link from "next/link";

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

  return (
    <html lang="fr">
      <body suppressHydrationWarning>
        <AuthProvider session={session}>
          <nav className="nav">
            <Link href="/" className="logo">BB<span>France</span></Link>
            <div className="nav-links">
              <SignInButton />
            </div>
          </nav>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
