/**
 * Layout du hub d'identité FranceBB (connexion unique pour toutes les apps) : même habillage que le site — police
 * Archivo servie par le hub (licence OFL, app/fonts/), barre du haut marine (`HubHeader`), pied de page sobre. Le
 * thème est celui posé par défaut sur :root par packages/ui (« Saison 3 ») : le hub ne propose aucun choix de thème.
 */
import type { Metadata } from "next";
import localFont from "next/font/local";
import HubHeader from "./components/HubHeader";
import "./globals.css";

const hubFont = localFont({
  src: "./fonts/archivo-latin-var.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-bb",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

export const metadata: Metadata = { title: "Passeport Blood Bowl — FranceBB", robots: { index: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={hubFont.variable}>
      <body className="flex min-h-dvh flex-col">
        <HubHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="border-t border-bb-nav-border bg-bb-nav-bg px-4 py-3 text-center text-sm text-bb-nav-text">
          Passeport Blood Bowl · FranceBB
        </footer>
      </body>
    </html>
  );
}
