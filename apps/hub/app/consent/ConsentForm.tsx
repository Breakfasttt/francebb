"use client";

/**
 * Choix du coach sur l'écran de consentement : « Refuser » est aussi visible qu'« Autoriser » (carte 127).
 * L'accès accordé se retire ensuite depuis le passeport, section « Applications liées ».
 */
import { authClient } from "@/lib/authClient";

export default function ConsentForm({ appName, rights }: { appName: string; rights: string[] }) {
  const answer = async (accept: boolean) => {
    const { data } = await authClient.oauth2.consent({ accept });
    const url = (data as { url?: string } | null)?.url;
    if (url) window.location.href = url;
  };

  return (
    <main className="hub-card">
      <h1>Autoriser {appName} ?</h1>
      <p>
        <strong>{appName}</strong> n&apos;est pas une application BBFrance. Elle demande à pouvoir :
      </p>
      <ul className="hub-explain">
        {rights.map((right) => (
          <li key={right}>{right}</li>
        ))}
      </ul>
      <p className="hub-muted">Tu pourras retirer cet accès à tout moment depuis ton passeport Blood Bowl.</p>
      <div className="hub-choice">
        <button className="hub-button" onClick={() => answer(false)}>Refuser</button>
        <button className="hub-button" onClick={() => answer(true)}>Autoriser</button>
      </div>
    </main>
  );
}
