/**
 * Éléments partagés par les deux accueils (carte 210), repris de l'ancien `app/page.tsx` (cartes 155 et 205) : styles
 * des blocs, liens « Créer » et « Tout voir », prochains tournois, boutons du forum et de Discord. Les autres blocs
 * sont dans `HomeSections.tsx`.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@bbfrance/ui";
import { DateBlock, placeText, topicHref } from "@/app/tournois/component/TournamentListItems";
import { takenPlaces } from "@/lib/tournamentPlaces";
import LiguesMiniMap from "./LiguesMiniMap";
import type { HomeTournament } from "./homeData";

/** Contour de focus clavier commun aux liens de l'accueil. */
export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bb-focus";

/** Titre d'un bloc, en voix Heading (DESIGN.md) : capitales semi-condensées. */
export const blockTitle = "font-bb-heading text-[0.95rem] text-bb-text";

/** Surface pleine d'un bloc posé sur le terrain. */
export const blockSurface = "flex flex-col overflow-hidden rounded-bb-lg border border-bb-border bg-bb-surface";

/** Petit lien « Créer » (ou « Écrire ») dans l'en-tête d'un bloc : discret, bordé, jamais rouge. */
export function CreateLink({ href, label, text = "Créer" }: { href: string; label: string; text?: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`inline-flex min-h-11 shrink-0 items-center rounded-bb-md border border-bb-border px-3 text-sm font-semibold text-bb-text no-underline hover:border-bb-text-muted ${focusRing}`}
    >
      {text}
    </Link>
  );
}

/** Lien « Tout voir » (ou autre) dans l'en-tête d'un bloc. */
export function MoreLink({ href, children, srLabel }: { href: string; children: ReactNode; srLabel?: string }) {
  return (
    <Link href={href} className={`inline-flex min-h-11 shrink-0 items-center text-sm font-semibold whitespace-nowrap text-bb-text-muted no-underline hover:text-bb-accent-text ${focusRing}`}>
      {children}
      {srLabel && <span className="sr-only"> : {srLabel}</span>}
    </Link>
  );
}

/**
 * Places d'un tournoi : « 5 / 16 places », ou « 5 inscrits » quand il n'a pas de nombre maximum (carte 205 ; l'ancien
 * « 5 / ∞ places » était peu clair).
 */
function placesText(taken: number, max: number | null | undefined): string {
  if (max) return `${taken} / ${max} places`;
  return `${taken} inscrit${taken > 1 ? "s" : ""}`;
}

/**
 * Les trois prochains tournois. `createInHeader` met « Créer » dans l'en-tête (accueil du membre ; sinon, « Créer un
 * tournoi » n'apparaît que lorsque la liste est vide) ; `registeredIds` signale les tournois où le membre est inscrit.
 */
export function NextTournaments({
  tournaments,
  createHref,
  createInHeader = false,
  registeredIds,
  className,
}: {
  tournaments: HomeTournament[];
  createHref: string | null;
  createInHeader?: boolean;
  registeredIds?: Set<string>;
  className?: string;
}) {
  // Petite carte sous la liste (ordinateur seulement), comme le bloc des ligues ; seulement si un tournoi est localisé
  const points = tournaments.map((tournament) => ({
    id: tournament.id,
    name: tournament.name,
    lat: tournament.lat,
    lng: tournament.lng,
    location: tournament.location,
    date: tournament.date,
    topic: tournament.topic,
  }));
  const hasMap = points.some((point) => point.lat !== null && point.lng !== null);
  return (
    <section aria-labelledby="home-next-tournaments" className={cn(blockSurface, className)}>
      {/* Titre et liens sur une seule ligne, même en 360 pixels de large (carte 205) */}
      <div className="flex min-h-12 items-center justify-between gap-2 bg-bb-surface-2 px-4 lg:px-5">
        <h2 id="home-next-tournaments" className={cn(blockTitle, "min-w-0")}>Prochains tournois</h2>
        <div className="flex shrink-0 items-center gap-2">
          <MoreLink href="/tournois" srLabel="tous les tournois">Tout voir</MoreLink>
          {createInHeader && createHref && <CreateLink href={createHref} label="Créer un tournoi" />}
        </div>
      </div>
      {tournaments.length > 0 ? (
        <ul className="m-0 list-none p-0">
          {tournaments.map((tournament) => (
            <li key={tournament.id} className="border-t border-bb-border">
              <Link
                href={topicHref(tournament)}
                className="flex items-center gap-3.5 px-4 py-3 text-inherit no-underline transition-colors hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus lg:px-5"
              >
                <DateBlock date={tournament.date} className="size-[52px] border-0 bg-bb-accent-soft" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-base leading-snug font-bold break-words text-bb-text">{tournament.name}</span>
                  <span className="text-sm text-bb-text-muted">
                    {placeText(tournament)} · {placesText(takenPlaces(tournament), tournament.maxParticipants)}
                  </span>
                  {registeredIds?.has(tournament.id) && <span className="text-sm font-semibold text-bb-success-text">Tu es inscrit</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-wrap items-center gap-3 border-t border-bb-border px-4 py-4 lg:px-5">
          <p className="flex-1 text-sm text-bb-text-muted">Pas de tournoi annoncé pour le moment. Tu en organises un ? Annonce-le ici.</p>
          {/* Un seul « Créer » : quand l'en-tête en porte déjà un (accueil du membre), pas de second bouton ici */}
          {createHref && !createInHeader && (
            <Link
              href={createHref}
              className={`inline-flex min-h-11 items-center rounded-bb-md border border-bb-border px-4 text-sm font-semibold text-bb-text no-underline ${focusRing}`}
            >
              Annoncer un tournoi
            </Link>
          )}
        </div>
      )}
      {tournaments.length > 0 && (
        <Link
          href="/carte"
          className={`flex min-h-11 items-center gap-2 border-t border-bb-border px-4 text-sm font-semibold text-bb-text-muted no-underline hover:text-bb-accent-text lg:px-5 ${focusRing}`}
        >
          Voir les tournois sur la carte
        </Link>
      )}
      {hasMap && <LiguesMiniMap points={points} viewType="tournaments" className="h-[200px] border-t border-bb-border" />}
    </section>
  );
}
