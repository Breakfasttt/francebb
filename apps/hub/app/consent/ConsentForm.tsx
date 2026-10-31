"use client";

/**
 * Choix du coach sur l'écran de consentement : « Refuser » est aussi visible qu'« Autoriser » (carte 127).
 * L'accès accordé se retire ensuite depuis le passeport, section « Applications liées ».
 */
import { authClient } from "@/lib/authClient";
import { Button } from "@bbfrance/ui";
import CenteredCard from "../components/CenteredCard";
import { Muted } from "../components/Messages";

export default function ConsentForm({ appName, rights }: { appName: string; rights: string[] }) {
  const answer = async (accept: boolean) => {
    const { data } = await authClient.oauth2.consent({ accept });
    const url = (data as { url?: string } | null)?.url;
    if (url) window.location.href = url;
  };

  return (
    <CenteredCard title={`Autoriser ${appName} ?`}>
      <p className="m-0">
        <strong>{appName}</strong> n&apos;est pas une application BBFrance. Elle demande à pouvoir :
      </p>
      <ul className="m-0 flex list-disc flex-col gap-2 pl-5 text-sm text-bb-text-muted">
        {rights.map((right) => (
          <li key={right}>{right}</li>
        ))}
      </ul>
      <Muted>Tu pourras retirer cet accès à tout moment depuis ton passeport Blood Bowl.</Muted>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" size="tap" onClick={() => answer(false)}>Refuser</Button>
        <Button variant="secondary" size="tap" onClick={() => answer(true)}>Autoriser</Button>
      </div>
    </CenteredCard>
  );
}
