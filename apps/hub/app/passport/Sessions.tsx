"use client";

/**
 * Appareils connectés au passeport (sessions du hub), avec la possibilité d'en déconnecter un ou tous les autres
 * (carte 120). Utilise les routes de Better Auth /list-sessions, /revoke-session et /revoke-other-sessions.
 */
import { useEffect, useState } from "react";
import { authClient } from "@/lib/authClient";
import { Button } from "@bbfrance/ui";
import { ErrorMessage, Muted } from "../components/Messages";
import ItemList from "./ItemList";

type HubSession = { token: string; userAgent?: string | null; createdAt: Date | string };

/** Description courte d'un appareil à partir de l'identification envoyée par son navigateur. */
function describeDevice(userAgent?: string | null) {
  if (!userAgent) return "Appareil inconnu";
  const device = /iPhone|iPad/.test(userAgent) ? "iPhone ou iPad" : /Android/.test(userAgent) ? "Android" : /Windows/.test(userAgent) ? "Windows" : /Mac OS/.test(userAgent) ? "Mac" : /Linux/.test(userAgent) ? "Linux" : "Appareil";
  const browser = /Edg\//.test(userAgent) ? "Edge" : /Firefox\//.test(userAgent) ? "Firefox" : /Chrome\//.test(userAgent) ? "Chrome" : /Safari\//.test(userAgent) ? "Safari" : "navigateur";
  return `${device}, ${browser}`;
}

export default function Sessions({ currentToken }: { currentToken: string }) {
  const [sessions, setSessions] = useState<HubSession[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data, error: listError } = await authClient.listSessions();
    if (listError) setError("Impossible de lire la liste des appareils.");
    else setSessions(data as HubSession[]);
  };
  useEffect(() => {
    void load();
  }, []);

  const revoke = async (token: string) => {
    await authClient.revokeSession({ token });
    await load();
  };
  const revokeOthers = async () => {
    await authClient.revokeOtherSessions();
    await load();
  };

  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!sessions) return <Muted>Chargement…</Muted>;
  const others = sessions.filter((session) => session.token !== currentToken);
  return (
    <>
      <ItemList
        items={sessions.map((session) => ({
          key: session.token,
          name: describeDevice(session.userAgent),
          detail: session.token === currentToken ? "Cet appareil" : `Connecté le ${new Date(session.createdAt).toLocaleDateString("fr-FR")}`,
          action: session.token !== currentToken && (
            <Button variant="secondary" size="tap" type="button" onClick={() => revoke(session.token)}>Déconnecter</Button>
          ),
        }))}
      />
      {others.length > 1 && (
        <Button variant="secondary" size="tap" type="button" onClick={revokeOthers}>Déconnecter tous les autres appareils</Button>
      )}
    </>
  );
}
