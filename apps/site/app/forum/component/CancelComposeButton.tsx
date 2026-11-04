"use client";

/**
 * Bouton « Annuler » d'un écran de rédaction du forum (carte 181) : si le texte n'est ni vide ni identique au texte
 * de départ, une confirmation est demandée avant de partir, et le brouillon est oublié. Avec `href`, c'est un lien
 * (nouveau sujet : retour au forum) ; sans `href`, il revient à la page précédente (répondre, modifier un message).
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, ConfirmDialog } from "@bbfrance/ui";
import type { Draft } from "@/common/hooks/useDraft";

export default function CancelComposeButton({ draft, href, className }: { draft: Pick<Draft, "hasChanges" | "forget">; href?: string; className?: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const leave = () => {
    draft.forget();
    if (href) router.push(href);
    else router.back();
  };

  return (
    <>
      {href ? (
        <Button asChild variant="secondary" size="tap" className={className}>
          <Link
            href={href}
            onClick={(event) => {
              if (!draft.hasChanges()) return;
              event.preventDefault();
              setConfirmOpen(true);
            }}
          >
            Annuler
          </Link>
        </Button>
      ) : (
        <Button type="button" variant="secondary" size="tap" className={className} onClick={() => (draft.hasChanges() ? setConfirmOpen(true) : router.back())}>
          Annuler
        </Button>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Abandonner ce message ?"
        message="Ce que vous avez écrit sera perdu, brouillon compris."
        confirmLabel="Abandonner"
        cancelLabel="Continuer à écrire"
        danger
        onConfirm={() => {
          setConfirmOpen(false);
          leave();
        }}
      />
    </>
  );
}
