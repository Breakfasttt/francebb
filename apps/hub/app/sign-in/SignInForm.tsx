"use client";

/**
 * Formulaire de connexion du hub (Discord, Google, lien par email), affiché quand l'application n'a pas indiqué
 * de moyen de connexion, ou si le moyen indiqué a échoué. La requête OAuth signée présente dans l'URL est jointe
 * à chaque demande par le client Better Auth : après connexion, le hub reprend l'autorisation et renvoie vers
 * l'application cliente.
 */
import { useState } from "react";
import { authClient } from "@/lib/authClient";
import { magicLinkCallbacks } from "@/lib/oauthResume";
import { Button, Input } from "@bbfrance/ui";
import CenteredCard from "../components/CenteredCard";
import DevAccounts from "./DevAccounts";
import { ErrorMessage, Muted } from "../components/Messages";
import { authErrorCodeMessage, authErrorMessage } from "@/lib/authErrors";

// Jamais en production, même si la variable a été recopiée par erreur : le serveur refuse déjà ces comptes (lib/devAccounts.ts)
const DEV_PASSWORD_LOGIN = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_HUB_DEV_PASSWORD_LOGIN === "1";

function followRedirect(data: unknown) {
  const url = (data as { url?: string } | null)?.url;
  if (url) window.location.href = url;
}

/**
 * `errorCode` : code d'erreur lu dans l'adresse, traduit ici (un texte venu de l'adresse n'est jamais affiché tel quel).
 * `errorMessage` : message déjà rédigé par la connexion automatique qui a échoué.
 */
export default function SignInForm({ errorCode, errorMessage, initialEmail }: { errorCode?: string | null; errorMessage?: string | null; initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    errorMessage ?? (errorCode ? authErrorCodeMessage(errorCode) : null),
  );

  const signInSocial = async (provider: "discord" | "google") => {
    const { error: socialError } = await authClient.signIn.social({ provider });
    if (socialError) setError(authErrorMessage(socialError, "La connexion n'a pas abouti. Réessaie, ou utilise ton adresse email."));
  };

  const sendMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    // Le lien reçu doit ramener le membre dans l'application qui l'a envoyé ici (fin du flux OIDC)
    const { error: linkError } = await authClient.signIn.magicLink({ email, ...magicLinkCallbacks(window.location.search) });
    if (linkError) setError(authErrorMessage(linkError, "Le lien n'a pas pu être envoyé. Vérifie ton adresse et réessaie."));
    else setMessage("Lien de connexion envoyé : vérifie ta boîte mail.");
  };

  const signInWithPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const { data, error: passwordError } = await authClient.signIn.email({ email, password });
    if (passwordError) setError(authErrorMessage(passwordError, "Email ou mot de passe incorrect."));
    else followRedirect(data);
  };

  return (
    <CenteredCard title="Connexion">
      <Button variant="secondary" size="tap" onClick={() => signInSocial("discord")}>Continuer avec Discord</Button>
      <Button variant="secondary" size="tap" onClick={() => signInSocial("google")}>Continuer avec Google</Button>
      <Muted className="text-center">ou</Muted>
      <form onSubmit={sendMagicLink} className="flex flex-col gap-2.5">
        <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
        <Button variant="primary" size="tap" type="submit">Recevoir un lien de connexion</Button>
      </form>
      {DEV_PASSWORD_LOGIN && (
        <form onSubmit={signInWithPassword} className="flex flex-col gap-2.5">
          <Muted>Développement seulement</Muted>
          <Input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Mot de passe" />
          <Button variant="secondary" size="tap" type="submit">Se connecter avec un mot de passe</Button>
        </form>
      )}
      {/* Comptes de test : le navigateur ne les demande jamais en production (carte 153) */}
      {process.env.NODE_ENV !== "production" && <DevAccounts />}
      {message && <Muted role="status">{message}</Muted>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </CenteredCard>
  );
}
