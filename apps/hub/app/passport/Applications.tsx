"use client";

/**
 * Applications qui ont accès au compte du coach, avec un bouton pour leur retirer cet accès (carte 120).
 */
import { useState } from "react";
import { describeScopes } from "@/lib/scopes";
import { Button } from "@bbfrance/ui";
import { ErrorMessage, Muted } from "../components/Messages";
import ItemList from "./ItemList";

type Application = { clientId: string; name: string; scopes: string[] };

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

  if (applications.length === 0) return <Muted>Aucune application n&apos;a accès à ton compte.</Muted>;
  return (
    <>
      <ItemList
        items={applications.map((application) => ({
          key: application.clientId,
          name: application.name,
          detail: `Peut ${describeScopes(application.scopes).join(", ")}.`,
          action: (
            <Button variant="secondary" size="tap" type="button" onClick={() => revoke(application)}>Retirer l&apos;accès</Button>
          ),
        }))}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </>
  );
}
