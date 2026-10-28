"use client";

/**
 * Page de connexion du hub. Appelée par le flux OIDC (`loginPage`) avec la requête OAuth signée dans l'URL :
 * après connexion, Better Auth reprend l'autorisation et renvoie l'URL de retour vers l'app cliente.
 */
import { useState } from "react";
import { authClient } from "@/lib/authClient";

const DEV_PASSWORD_LOGIN = process.env.NEXT_PUBLIC_HUB_DEV_PASSWORD_LOGIN === "1";

function followRedirect(data: unknown) {
  const url = (data as { url?: string } | null)?.url;
  if (url) window.location.href = url;
}

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signInSocial = async (provider: "discord" | "google") => {
    const { error: socialError } = await authClient.signIn.social({ provider });
    if (socialError) setError(socialError.message ?? "Connexion impossible");
  };

  const sendMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    const { error: linkError } = await authClient.signIn.magicLink({ email });
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
