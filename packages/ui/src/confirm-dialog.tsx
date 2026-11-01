"use client";

/**
 * Fenêtre de confirmation de la refonte (carte 089) : remplace la fenêtre `confirm()` du navigateur et l'ancienne
 * `ConfirmModal` sur les écrans refaits. Elle est construite sur `Sheet` : panneau qui monte du bas sur téléphone,
 * fenêtre centrée sur ordinateur. Un appui à côté ne la ferme pas : il faut choisir « Annuler » ou confirmer.
 * Sur téléphone, le bouton de confirmation est en haut et « Annuler » en dessous (pouce) ; sur ordinateur, les deux
 * boutons sont alignés à droite.
 * `children` (carte 099) ajoute un contenu entre la phrase et les boutons, par exemple un champ de commentaire.
 */
import * as React from "react";
import { Sheet, SheetContent } from "./sheet";
import { Button } from "./button";
import { DESKTOP_QUERY, useMediaQuery } from "./use-media-query";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  danger = false,
  pending = false,
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Phrase qui explique ce qui va se passer ; lue comme description de la fenêtre. */
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Action destructrice (suppression, désinscription) : bouton rouge. */
  danger?: boolean;
  /** Action en cours : les boutons sont désactivés. */
  pending?: boolean;
  onConfirm: () => void;
  /** Contenu facultatif affiché entre la phrase et les boutons (champ de commentaire…). */
  children?: React.ReactNode;
}) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title={title}
        description={message}
        side={isDesktop ? "center" : "bottom"}
        onInteractOutside={(event) => event.preventDefault()}
      >
        {children ? <div className="pt-1">{children}</div> : null}
        <div className="flex flex-col gap-2 pt-2 pb-2 lg:flex-row-reverse lg:justify-start">
          <Button type="button" variant={danger ? "danger" : "primary"} size="tap" className="w-full lg:w-auto" disabled={pending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" disabled={pending} onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
