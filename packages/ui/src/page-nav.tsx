/**
 * Pagination compacte de la refonte : « ‹ Page 3 sur 5 › » et un accès direct à la dernière page, en cibles de 44 px.
 * Les liens sont construits par `hrefFor(page)` : l'adresse (?page=N) reste celle du site.
 */
import * as React from "react";
import { cn } from "./cn";

const arrow = (d: string) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const cell =
  "inline-flex size-11 items-center justify-center rounded-bb-md text-bb-text hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:outline-bb-focus";
const disabledCell = "pointer-events-none opacity-35";

export function PageNav({ page, totalPages, hrefFor, lastHref, className, linkComponent: LinkComponent = "a" }: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  /** Lien « dernière page » (par exemple vers le dernier message) ; par défaut, la dernière page. */
  lastHref?: string;
  className?: string;
  linkComponent?: React.ElementType;
}) {
  if (totalPages <= 1 && !lastHref) return null;
  const prev = page > 1;
  const next = page < totalPages;
  return (
    <nav aria-label="Pagination" className={cn("inline-flex items-center gap-1 rounded-bb-lg border border-bb-border bg-bb-surface p-0.5", className)}>
      <LinkComponent href={hrefFor(Math.max(1, page - 1))} aria-label="Page précédente" aria-disabled={!prev} className={cn(cell, !prev && disabledCell)}>
        {arrow("m15 6-6 6 6 6")}
      </LinkComponent>
      <span className="min-w-28 px-1 text-center text-sm font-semibold text-bb-text" aria-current="page">
        Page {page} sur {totalPages}
      </span>
      <LinkComponent href={hrefFor(Math.min(totalPages, page + 1))} aria-label="Page suivante" aria-disabled={!next} className={cn(cell, !next && disabledCell)}>
        {arrow("m9 6 6 6-6 6")}
      </LinkComponent>
      <LinkComponent href={lastHref ?? hrefFor(totalPages)} aria-label="Aller à la fin" className={cn(cell, "border-l border-bb-border rounded-l-none")}>
        {arrow("m7 6 6 6-6 6M17 6v12")}
      </LinkComponent>
    </nav>
  );
}
