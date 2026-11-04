"use client";

/**
 * Choix d'une page (carte 182) : l'indication « Page 3 sur 15 » de `PageNav` devient un bouton qui ouvre un panneau.
 * Le panneau monte du bas de l'écran sur téléphone et s'affiche en fenêtre centrée sur ordinateur. Il propose
 * « Première page », « Dernière page » (ou un autre libellé, comme « Dernier message ») et la liste des pages en
 * grille de boutons de 44 pixels. Au-delà de MAX_LISTED_PAGES pages, la grille ne montre que les pages proches de la
 * page courante, et un champ « Aller à la page » permet de saisir n'importe quel numéro.
 *
 * Ce composant reçoit des fonctions (`hrefFor`, `onPageChange`, `navigate`) : il ne peut donc être utilisé que depuis
 * un composant client, jamais directement depuis une page rendue sur le serveur.
 */
import * as React from "react";
import { cn } from "./cn";
import { Button } from "./button";
import { Input } from "./field";
import { Sheet, SheetContent } from "./sheet";
import { DESKTOP_QUERY, useMediaQuery } from "./use-media-query";

/** Au-delà de ce nombre de pages, la grille complète deviendrait trop longue à parcourir au doigt. */
const MAX_LISTED_PAGES = 30;
/** Nombre de pages affichées de chaque côté de la page courante quand la grille est réduite. */
const NEARBY_PAGES = 4;

export type PagePickerOptions = {
  /** Libellé du raccourci vers la fin (« Dernière page » par défaut, « Dernier message » pour un sujet du forum). */
  lastLabel?: string;
  /** Appelé lors d'un appui sur ce raccourci (par exemple pour faire défiler jusqu'au dernier message). */
  onLastClick?: (event: React.MouseEvent) => void;
  /** Navigation après la saisie d'un numéro (par exemple `router.push`) ; sinon, la page est rechargée. */
  navigate?: (href: string) => void;
};

type PagePickerProps = PagePickerOptions & {
  page: number;
  totalPages: number;
  hrefFor?: (page: number) => string;
  onPageChange?: (page: number) => void;
  lastHref?: string;
  linkComponent: React.ElementType;
  className?: string;
};

/** Pages affichées dans la grille : toutes, ou seulement les voisines de la page courante quand il y en a trop. */
function listedPages(page: number, totalPages: number): number[] {
  if (totalPages <= MAX_LISTED_PAGES) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const start = Math.max(1, Math.min(page - NEARBY_PAGES, totalPages - 2 * NEARBY_PAGES));
  const end = Math.min(totalPages, start + 2 * NEARBY_PAGES);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function PagePicker({
  page,
  totalPages,
  hrefFor,
  onPageChange,
  lastHref,
  lastLabel = "Dernière page",
  onLastClick,
  navigate,
  linkComponent: LinkComponent,
  className,
}: PagePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [typed, setTyped] = React.useState("");
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const fieldId = React.useId();

  /** Va à une page : demande au parent (liste chargée dans la page) ou suit le lien, puis ferme le panneau. */
  const goTo = (target: number) => {
    setOpen(false);
    if (onPageChange) onPageChange(target);
    else if (hrefFor) {
      const href = hrefFor(target);
      if (navigate) navigate(href);
      else window.location.assign(href);
    }
  };

  /** Un raccourci ou une case de la grille : lien vers la page, ou bouton qui la demande au parent. */
  const target = (to: number, content: React.ReactNode, props: { className: string; label?: string; current?: boolean; href?: string; onClick?: (e: React.MouseEvent) => void }) =>
    onPageChange ? (
      <Button
        type="button"
        variant={props.current ? "primary" : "secondary"}
        size="tap"
        aria-label={props.label}
        aria-current={props.current ? "page" : undefined}
        onClick={() => goTo(to)}
        className={props.className}
      >
        {content}
      </Button>
    ) : (
      <Button asChild variant={props.current ? "primary" : "secondary"} size="tap" className={props.className}>
        <LinkComponent
          href={props.href ?? hrefFor!(to)}
          aria-label={props.label}
          aria-current={props.current ? "page" : undefined}
          onClick={(e: React.MouseEvent) => {
            props.onClick?.(e);
            setOpen(false);
          }}
        >
          {content}
        </LinkComponent>
      </Button>
    );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const wanted = Number.parseInt(typed, 10);
    if (!Number.isFinite(wanted)) return;
    goTo(Math.min(totalPages, Math.max(1, wanted)));
  };

  const pages = listedPages(page, totalPages);
  const reduced = totalPages > MAX_LISTED_PAGES;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="quiet"
        size="tap"
        aria-haspopup="dialog"
        aria-label={`Page ${page} sur ${totalPages} : choisir une page`}
        onClick={() => setOpen(true)}
        className={cn("min-w-28 px-2 text-sm font-semibold text-bb-text underline decoration-dotted underline-offset-4", className)}
      >
        Page {page} sur {totalPages}
      </Button>
      <SheetContent title="Choisir une page" side={isDesktop ? "center" : "bottom"}>
        <div className="flex flex-col gap-4 pb-2">
          <div className="grid grid-cols-2 gap-2">
            {target(1, "Première page", { className: "w-full", current: false })}
            {target(totalPages, lastLabel, { className: "w-full", href: lastHref, onClick: onLastClick })}
          </div>

          {reduced && (
            <form onSubmit={submit} className="flex items-end gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <label htmlFor={fieldId} className="text-sm font-semibold text-bb-text">
                  Aller à la page (1 à {totalPages})
                </label>
                <Input
                  id={fieldId}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={totalPages}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                />
              </div>
              <Button type="submit" variant="primary" size="tap" className="shrink-0">
                Aller
              </Button>
            </form>
          )}

          <div className="flex flex-col gap-2">
            <p className="m-0 text-sm text-bb-text-muted">{reduced ? "Pages proches" : "Toutes les pages"}</p>
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] gap-2 p-0">
              {pages.map((n) => (
                <li key={n}>
                  {target(n, n, {
                    className: "w-full px-0 tabular-nums",
                    label: n === page ? `Page ${n}, page actuelle` : `Page ${n}`,
                    current: n === page,
                  })}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
