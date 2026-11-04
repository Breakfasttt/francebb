/**
 * Mise en page commune de l'application BBQuizz (carte 180). En attendant la relance du quiz, elle n'entoure que la
 * page d'attente. Pas de bibliothèque d'interface : quelques styles écrits sur place suffisent.
 */
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = { title: "BBQuizz — Blood Bowl France", robots: { index: false } };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#14161a", color: "#f2f2f2" }}>{children}</body>
    </html>
  );
}
