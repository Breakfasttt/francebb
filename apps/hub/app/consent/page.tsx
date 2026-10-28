"use client";

/**
 * Consentement OIDC : affiché seulement pour une app tierce (les apps BBFrance sont enregistrées avec skip_consent).
 */
import { authClient } from "@/lib/authClient";

export default function ConsentPage() {
  const answer = async (accept: boolean) => {
    const { data } = await authClient.oauth2.consent({ accept });
    const url = (data as { url?: string } | null)?.url;
    if (url) window.location.href = url;
  };

  return (
    <main className="hub-card">
      <h1>Autoriser l&apos;accès</h1>
      <p>Une application demande à utiliser ton compte BBFrance (pseudo, avatar, email).</p>
      <button className="hub-button primary" onClick={() => answer(true)}>Autoriser</button>
      <button className="hub-button" onClick={() => answer(false)}>Refuser</button>
    </main>
  );
}
