"use client";

/**
 * Message affiché sur l'accueil du forum après la suppression d'un sujet ou d'un forum (paramètres d'adresse
 * `?deletedTopic=` et `?deletedForum=`). Il reste 8 secondes, puis l'adresse est nettoyée de ces paramètres.
 * Style de la refonte (ADR 0006, carte 085) : sur téléphone, il occupe la largeur de l'écran sous la barre du haut.
 */
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@bbfrance/ui";

export default function DeletionToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deletedTopic = searchParams.get("deletedTopic");
  const deletedForum = searchParams.get("deletedForum");
  const [show, setShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastTitle, setToastTitle] = useState("");

  useEffect(() => {
    if (deletedTopic || deletedForum) {
      setShow(true);
      if (deletedTopic) {
        setToastMessage("Sujet supprimé avec succès :");
        setToastTitle(decodeURIComponent(deletedTopic));
      } else if (deletedForum) {
        setToastMessage("Forum supprimé avec succès :");
        setToastTitle(decodeURIComponent(deletedForum));
      }

      const timer = setTimeout(() => {
        setShow(false);
        // Nettoie l'adresse en retirant les paramètres de suppression
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.delete("deletedTopic");
        currentParams.delete("deletedForum");
        const newUrl = window.location.pathname + (currentParams.toString() ? `?${currentParams.toString()}` : "");
        router.replace(newUrl, { scroll: false });
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [deletedTopic, deletedForum, router]);

  if (!show || (!deletedTopic && !deletedForum)) return null;

  return (
    <div role="status" className="fixed inset-x-3 top-[4.25rem] z-[var(--z-index-toast)] lg:inset-x-auto lg:top-20 lg:right-6 lg:w-[420px]">
      <div className="flex items-center gap-3 rounded-bb-lg border border-bb-border bg-bb-surface py-2 pr-1 pl-3 text-bb-text shadow-bb">
        <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bb-surface-2 text-bb-success-text">
          <Check size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm text-bb-text-muted">{toastMessage}</p>
          <strong title={toastTitle} className="block truncate font-semibold">{toastTitle}</strong>
        </div>
        <Button type="button" variant="quiet" size="tap-icon" aria-label="Fermer" onClick={() => setShow(false)}>
          <X size={18} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
