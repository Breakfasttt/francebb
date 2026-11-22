"use client";

/** Erreur inattendue du hub : en français, avec un bouton pour réessayer et un retour au passeport. */
import { Button, buttonVariants } from "@bbfrance/ui";
import CenteredCard from "./components/CenteredCard";
import { Muted } from "./components/Messages";

export default function HubError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <CenteredCard title="Un problème est survenu">
      <Muted>Le passeport n&apos;a pas pu afficher cette page. Réessaie dans un instant ; si le problème continue, reviens plus tard.</Muted>
      <Button variant="primary" size="tap" type="button" onClick={reset}>Réessayer</Button>
      <a href="/" className={buttonVariants({ variant: "secondary", size: "tap" })}>Aller à mon passeport</a>
    </CenteredCard>
  );
}
