import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { SignInButton } from "@/components/SignInButton";

export const metadata: Metadata = {
  title: "BBFrance - Tournois de Blood Bowl en France",
  description: "La plateforme de référence pour les tournois de Blood Bowl en France.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <nav className="nav">
            <div className="logo">BB<span>France</span></div>
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
