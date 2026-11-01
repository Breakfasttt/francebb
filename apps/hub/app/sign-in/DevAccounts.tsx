"use client";

/**
 * Section « Comptes de test » de la page de connexion, affichée seulement en développement (carte 153).
 * Un clic connecte avec le mot de passe commun des comptes de test, puis reprend l'autorisation en cours
 * comme une connexion normale : le site, le passeport et la déconnexion se comportent comme en production.
 */
import { useEffect, useState } from "react";
import { authClient } from "@/lib/authClient";
import { Button } from "@bbfrance/ui";
import { DEV_ACCOUNT_PASSWORD } from "@/lib/devAccountPassword";
import type { DevAccount } from "@/lib/devAccounts";
import { createDevAccountAction, listDevAccountsAction } from "./devActions";
import { ErrorMessage, Muted } from "../components/Messages";

export default function DevAccounts() {
  // null : liste pas encore reçue, ou fonction désactivée par le serveur
  const [accounts, setAccounts] = useState<DevAccount[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listDevAccountsAction().then(setAccounts, () => setAccounts(null));
  }, []);

  if (!accounts) return null;

  const signInAs = async (email: string) => {
    setBusy(true);
    const { data, error: signInError } = await authClient.signIn.email({ email, password: DEV_ACCOUNT_PASSWORD });
    if (signInError) {
      setError(signInError.message ?? "Connexion impossible");
      setBusy(false);
      return;
    }
    const url = (data as { url?: string } | null)?.url;
    window.location.href = url ?? "/";
  };

  const create = async () => {
    setBusy(true);
    const account = await createDevAccountAction();
    setBusy(false);
    if (account) setAccounts((previous) => [account, ...(previous ?? [])]);
    else setError("Création impossible");
  };

  return (
    <section aria-labelledby="dev-accounts-title" className="flex flex-col gap-2.5 border-t border-dashed border-bb-border pt-4">
      <h2 id="dev-accounts-title" className="m-0 text-sm font-bold text-bb-text-muted">Comptes de test (développement)</h2>
      {accounts.length === 0 && <Muted>Aucun compte de test pour l’instant.</Muted>}
      {accounts.map((account) => (
        <Button key={account.id} variant="quiet" size="tap" className="w-full justify-start" disabled={busy} onClick={() => signInAs(account.email)}>
          <span className="truncate">{account.name}</span>
          <span className="ml-auto truncate text-xs text-bb-text-muted">{account.email}</span>
        </Button>
      ))}
      <Button variant="secondary" size="tap" disabled={busy} onClick={create}>Créer un compte de test</Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </section>
  );
}
