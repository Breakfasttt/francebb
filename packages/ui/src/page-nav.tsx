/**
 * Pagination compacte de la refonte : « ‹ Page 3 sur 5 › » et un accès direct à la dernière page, en cibles de 44 px.
 * Deux façons de l'utiliser :
 * - avec `hrefFor(page)`, les flèches sont des liens : l'adresse (?page=N) reste celle du site ;
 * - avec `onPageChange(page)` (carte 092), les flèches sont des boutons : pour une liste chargée dans la page sans
 *   changer l'adresse (sujets suivis du profil, annuaire des membres).
 */
import * as React from "react";
import { cn } from "./cn";
import { Button } from "./button";

const arrow = (d: string) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const cell =
  "inline-flex size-11 items-center justify-center rounded-bb-md text-bb-text hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:outline-bb-focus";
const disabledCell = "pointer-events-none opacity-35";

type PageNavProps = {
  page: number;
  totalPages: number;
  /** Lien « dernière page » (par exemple vers le dernier message) ; par défaut, la dernière page. */
  lastHref?: string;
  className?: string;
  linkComponent?: React.ElementType;
} & (
  | { hrefFor: (page: number) => string; onPageChange?: never }
  | { onPageChange: (page: number) => void; hrefFor?: never }
);

export function PageNav({ page, totalPages, hrefFor, onPageChange, lastHref, className, linkComponent: LinkComponent = "a" }: PageNavProps) {
  if (totalPages <= 1 && !lastHref) return null;
  const prev = page > 1;
  const next = page < totalPages;

  /** Une flèche : lien vers la page, ou bouton qui la demande au parent. */
  const step = (target: number, label: string, enabled: boolean, icon: React.ReactNode, extra?: string, href?: string) =>
    onPageChange ? (
      <Button
        type="button"
        variant="quiet"
        aria-label={label}
        disabled={!enabled}
        onClick={() => onPageChange(target)}
        className={cn(cell, "p-0 disabled:opacity-35", extra)}
      >
        {icon}
      </Button>
    ) : (
      <LinkComponent href={href ?? hrefFor!(target)} aria-label={label} aria-disabled={!enabled} className={cn(cell, !enabled && disabledCell, extra)}>
        {icon}
      </LinkComponent>
    );

  return (
    <nav aria-label="Pagination" className={cn("inline-flex items-center gap-1 rounded-bb-lg border border-bb-border bg-bb-surface p-0.5", className)}>
      {step(Math.max(1, page - 1), "Page précédente", prev, arrow("m15 6-6 6 6 6"))}
      <span className="min-w-28 px-1 text-center text-sm font-semibold text-bb-text" aria-current="page">
        Page {page} sur {totalPages}
      </span>
      {step(Math.min(totalPages, page + 1), "Page suivante", next, arrow("m9 6 6 6-6 6"))}
      {step(totalPages, "Aller à la fin", onPageChange ? next : true, arrow("m7 6 6 6-6 6M17 6v12"), "border-l border-bb-border rounded-l-none", lastHref)}
    </nav>
  );
}
