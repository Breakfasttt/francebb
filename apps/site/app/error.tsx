"use client";

/**
 * Écran d'erreur d'une page (carte 188) : si une page plante (base de données injoignable, par exemple), Next.js
 * affiche cet écran à la place de la page, en gardant la coquille du site (barres de navigation). « Réessayer »
 * appelle `unstable_retry`, qui redemande la page au serveur ; c'est la fonction conseillée par Next.js 16.2, alors
 * que `reset` réafficherait la page sans la redemander, donc avec la même erreur.
 */
import ErrorScreen from "@/common/components/ErrorScreen/ErrorScreen";

export default function Error({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return <ErrorScreen onRetry={unstable_retry} digest={error.digest} />;
}
