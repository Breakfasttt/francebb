"use client";

/**
 * Applications qui ont accès au compte du coach, avec un bouton pour leur retirer cet accès (carte 120).
 */
import { useState } from "react";

type Application = { clientId: string; name: string; scopes: string[] };

// Droits expliqués en français : le coach ne doit jamais lire un nom technique de portée
const SCOPE_LABELS: Record<string, string> = {
  openid: "savoir qui tu es",
  profile: "voir ton pseudo et ton avatar",
  email: "voir ton adresse email",
  offline_access: "rester connectée sans te redemander",
  "bbfrance:profile": "voir ton profil de coach (NAF, région…)",
  "bbfrance:profile:write": "modifier ton profil de coach",
};

export default function Applications({ initial }: { initial: Application[] }) {
  const [applications, setApplications] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  const revoke = async (application: Application) => {
    if (!window.confirm(`Retirer l'accès de ${application.name} ? Tu devras te reconnecter pour l'utiliser.`)) return;
    const response = await fetch("/api/v1/applications/revoke", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clientId: application.clientId }),
    });
    if (response.ok) setApplications((current) => current.filter((item) => item.clientId !== application.clientId));
    else setError("Impossible de retirer cet accès, réessaie.");
  };

  if (applications.length === 0) return <p className="hub-muted">Aucune application n&apos;a accès à ton compte.</p>;
  return (
    <>
      <ul className="hub-list">
        {applications.map((application) => (
          <li key={application.clientId}>
            <div>
              <strong>{application.name}</strong>
              <p className="hub-muted hub-help">
                Peut {application.scopes.map((scope) => SCOPE_LABELS[scope] ?? scope).join(", ")}.
              </p>
            </div>
            <button className="hub-button" type="button" onClick={() => revoke(application)}>Retirer l&apos;accès</button>
          </li>
        ))}
      </ul>
      {error && <p className="hub-error" role="alert">{error}</p>}
    </>
  );
}
