"use client";

/**
 * Connexion lancée automatiquement avec le moyen choisi par le membre sur l'écran de l'application (carte 073) :
 * redirection immédiate vers Discord ou Google, ou envoi du lien par email. Le membre ne voit qu'un court
 * message. En cas d'échec, le formulaire normal du hub s'affiche avec l'erreur, pour qu'il puisse réessayer.
 */
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/authClient";
import { magicLinkCallbacks, type LoginMethod } from "@/lib/oauthResume";
import SignInForm from "./SignInForm";
import CenteredCard from "../components/CenteredCard";
import { Muted } from "../components/Messages";

/** Mémorise, pour cet onglet, qu'un lien a déjà été envoyé pour cette demande : recharger la page ne renvoie pas d'email. */
function sentKey() {
  return `hub-magic-link-sent:${new URLSearchParams(window.location.search).get("sig")}`;
}

function alreadySent() {
  try {
    return sessionStorage.getItem(sentKey()) === "1";
  } catch {
    return false;
  }
}

function rememberSent() {
  try {
    sessionStorage.setItem(sentKey(), "1");
  } catch {
    // Stockage indisponible (navigation privée stricte) : seul l'anti-doublon au rechargement est perdu
  }
}

export default function AutoSignIn({ method, email }: { method: LoginMethod; email?: string }) {
  const [status, setStatus] = useState<"redirecting" | "sent" | "failed">("redirecting");
  const [error, setError] = useState<string | null>(null);
  // React lance les effets deux fois en développement : sans ce verrou, deux emails partiraient
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      if (method === "email") {
        if (alreadySent()) return setStatus("sent");
        const { error: linkError } = await authClient.signIn.magicLink({ email: email!, ...magicLinkCallbacks(window.location.search) });
        if (linkError) {
          setError(linkError.message ?? "Envoi du lien impossible");
          return setStatus("failed");
        }
        rememberSent();
        return setStatus("sent");
      }
      // Le client Better Auth suit lui-même la redirection vers Discord ou Google
      const { error: socialError } = await authClient.signIn.social({ provider: method });
      if (socialError) {
        setError(socialError.message ?? "Connexion impossible");
        setStatus("failed");
      }
    };
    run().catch(() => {
      setError("Connexion impossible, réessaie.");
      setStatus("failed");
    });
  }, [method, email]);

  if (status === "failed") return <SignInForm errorMessage={error} initialEmail={email} />;

  return (
    <CenteredCard aria-live="polite" title={status === "sent" ? "Vérifie ta boîte mail" : undefined}>
      {status === "sent" ? (
        <>
          <p className="m-0">Un lien de connexion vient d&apos;être envoyé à {email}.</p>
          <Muted>Ouvre-le sur cet appareil, dans ce navigateur : tu reviendras connecté sur BBFrance.</Muted>
        </>
      ) : (
        <p className="m-0">Redirection…</p>
      )}
    </CenteredCard>
  );
}
