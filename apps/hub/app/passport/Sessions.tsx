"use client";

/**
 * Appareils connectés au passeport (sessions du hub), avec la possibilité d'en déconnecter un ou tous les autres
 * (carte 120). Utilise les routes de Better Auth /list-sessions, /revoke-session et /revoke-other-sessions.
 */
import { useEffect, useState } from "react";
import { authClient } from "@/lib/authClient";

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

  if (error) return <p className="hub-error" role="alert">{error}</p>;
  if (!sessions) return <p className="hub-muted">Chargement…</p>;
  const others = sessions.filter((session) => session.token !== currentToken);
  return (
    <>
      <ul className="hub-list">
        {sessions.map((session) => (
          <li key={session.token}>
            <div>
              <strong>{describeDevice(session.userAgent)}</strong>
              <p className="hub-muted hub-help">
                {session.token === currentToken ? "Cet appareil" : `Connecté le ${new Date(session.createdAt).toLocaleDateString("fr-FR")}`}
              </p>
            </div>
            {session.token !== currentToken && (
              <button className="hub-button" type="button" onClick={() => revoke(session.token)}>Déconnecter</button>
            )}
          </li>
        ))}
      </ul>
      {others.length > 1 && (
        <button className="hub-button" type="button" onClick={revokeOthers}>Déconnecter tous les autres appareils</button>
      )}
    </>
  );
}
