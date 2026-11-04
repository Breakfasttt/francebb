/**
 * Mise en page commune de l'application BBScheme (carte 179). En attendant la relance de l'éditeur, elle n'entoure que
 * la page d'attente. Pas de bibliothèque d'interface : quelques styles écrits sur place suffisent.
 */
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = { title: "BBScheme — Blood Bowl France", robots: { index: false } };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#14161a", color: "#f2f2f2" }}>{children}</body>
    </html>
  );
}
