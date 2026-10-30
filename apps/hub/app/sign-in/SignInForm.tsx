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

const DEV_PASSWORD_LOGIN = process.env.NEXT_PUBLIC_HUB_DEV_PASSWORD_LOGIN === "1";

/** Messages des erreurs renvoyées par Better Auth dans l'adresse (par exemple après un lien magique refusé). */
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_TOKEN: "Ce lien de connexion a expiré ou a déjà servi : demande-en un nouveau.",
};

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
    errorMessage ?? (errorCode ? (ERROR_MESSAGES[errorCode] ?? "Connexion impossible, réessaie.") : null),
  );

  const signInSocial = async (provider: "discord" | "google") => {
    const { error: socialError } = await authClient.signIn.social({ provider });
    if (socialError) setError(socialError.message ?? "Connexion impossible");
  };

  const sendMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    // Le lien reçu doit ramener le membre dans l'application qui l'a envoyé ici (fin du flux OIDC)
    const { error: linkError } = await authClient.signIn.magicLink({ email, ...magicLinkCallbacks(window.location.search) });
    if (linkError) setError(linkError.message ?? "Envoi impossible");
    else setMessage("Lien de connexion envoyé : vérifie ta boîte mail.");
  };

  const signInWithPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const { data, error: passwordError } = await authClient.signIn.email({ email, password });
    if (passwordError) setError(passwordError.message ?? "Identifiants invalides");
    else followRedirect(data);
  };

  return (
    <main className="hub-card">
      <h1>Connexion</h1>
      <button className="hub-button" onClick={() => signInSocial("discord")}>Continuer avec Discord</button>
      <button className="hub-button" onClick={() => signInSocial("google")}>Continuer avec Google</button>
      <p className="hub-separator">ou</p>
      <form onSubmit={sendMagicLink}>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
        <button className="hub-button primary" type="submit">Recevoir un lien de connexion</button>
      </form>
      {DEV_PASSWORD_LOGIN && (
        <form onSubmit={signInWithPassword}>
          <p className="hub-muted">Dev uniquement</p>
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Mot de passe" />
          <button className="hub-button" type="submit">Connexion mot de passe (dev)</button>
        </form>
      )}
      {message && <p className="hub-muted">{message}</p>}
      {error && <p className="hub-error">{error}</p>}
    </main>
  );
}
