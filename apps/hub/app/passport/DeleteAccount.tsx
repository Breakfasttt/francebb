"use client";

/**
 * Suppression du compte depuis le passeport (carte 123), expliquée en langage simple : ce qui est effacé, le délai de
 * grâce de 30 jours, comment annuler. Quand une suppression est en cours, propose seulement de l'annuler.
 */
import { useState } from "react";
import { Button } from "@bbfrance/ui";
import { ErrorMessage } from "../components/Messages";

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default function DeleteAccount({ scheduledAt: initial }: { scheduledAt: string | null }) {
  const [scheduledAt, setScheduledAt] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  const call = async (url: string) => {
    setError(null);
    // Better Auth n'accepte un POST qu'avec un corps JSON, même vide
    const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    if (!response.ok) setError("L'opération n'a pas abouti, réessaie.");
    return response;
  };

  const request = async () => {
    if (!window.confirm("Supprimer ton compte BBFrance ? Il sera effacé dans 30 jours, sauf si tu annules d'ici là.")) return;
    const response = await call("/api/v1/account/delete");
    if (response.ok) setScheduledAt(((await response.json()) as { scheduledAt: string }).scheduledAt);
  };
  const cancel = async () => {
    if ((await call("/api/v1/account/delete/cancel")).ok) setScheduledAt(null);
  };

  if (scheduledAt) {
    return (
      <>
        <p role="status" className="m-0">
          Ton compte sera effacé le <strong>{formatDate(scheduledAt)}</strong>. Les applications BBFrance n&apos;y ont
          plus accès d&apos;ici là. Tu peux encore changer d&apos;avis.
        </p>
        <Button variant="primary" size="tap" type="button" onClick={cancel}>Annuler la suppression</Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </>
    );
  }
  return (
    <>
      <ul className="m-0 flex list-disc flex-col gap-2 pl-5 text-sm text-bb-text-muted">
        <li>Ton passeport et tes connexions (Discord, Google, email) sont effacés.</li>
        <li>Chaque application BBFrance efface tes données personnelles. Certaines gardent tes contributions publiques (messages, résultats de tournoi) sous un nom anonyme.</li>
        <li>L&apos;effacement a lieu <strong>30 jours</strong> après ta demande. D&apos;ici là, tu peux annuler en te reconnectant ici. Tu reçois un email de confirmation, puis un rappel une semaine avant.</li>
        <li>Ton pseudo ne pourra pas être repris par quelqu&apos;un d&apos;autre.</li>
      </ul>
      <Button variant="danger" size="tap" type="button" onClick={request}>Supprimer mon compte</Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </>
  );
}
