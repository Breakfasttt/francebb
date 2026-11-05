"use client";

/**
 * Écran d'erreur de dernier recours (carte 188) : il s'affiche quand c'est la mise en page générale du site
 * (app/layout.tsx) qui plante. Il remplace alors toute la page : il pose lui-même ses balises <html> et <body> et
 * charge la feuille de style du site. Sans attribut data-theme, les couleurs sont celles du thème par défaut
 * (« vestiaire », posé sur :root), ce qui marche même si le thème du coach n'a pas pu être lu.
 */
import ErrorScreen from "@/common/components/ErrorScreen/ErrorScreen";
import "./tailwind.css";

export default function GlobalError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-bb-bg text-bb-text">
        <title>Un problème est survenu - BBFrance</title>
        <ErrorScreen onRetry={unstable_retry} digest={error.digest} />
      </body>
    </html>
  );
}
