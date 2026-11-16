/**
 * Éléments partagés par les deux accueils (carte 210), repris de l'ancien `app/page.tsx` (cartes 155 et 205) : styles
 * des blocs, liens « Créer » et « Tout voir », prochains tournois, boutons du forum et de Discord. Les autres blocs
 * sont dans `HomeSections.tsx`.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, MessageSquare, Plus } from "lucide-react";
import { Button, cn } from "@bbfrance/ui";
import { DateBlock, placeText, topicHref } from "@/app/tournois/component/TournamentListItems";
import { takenPlaces } from "@/lib/tournamentPlaces";
import type { HomeTournament } from "./homeData";

/** Contour de focus clavier commun aux liens de l'accueil. */
export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bb-focus";

/** Titre d'un bloc (sans les majuscules ni l'italique de l'ancien CSS des titres). */
export const blockTitle = "m-0 border-0 p-0 text-xl leading-tight font-extrabold text-bb-text normal-case not-italic";

/** Surface pleine d'un bloc posé sur le terrain. */
export const blockSurface = "flex flex-col overflow-hidden rounded-bb-lg border border-bb-border bg-bb-surface";

/** Petit lien « Créer » (ou « Écrire ») dans l'en-tête d'un bloc. */
export function CreateLink({ href, label, text = "Créer" }: { href: string; label: string; text?: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`inline-flex min-h-11 shrink-0 items-center gap-1 rounded-bb-md bg-bb-accent-soft px-3 text-sm font-bold text-bb-accent-text no-underline transition-colors hover:bg-bb-surface-2 ${focusRing}`}
    >
      <Plus size={15} aria-hidden="true" /> {text}
    </Link>
  );
}

/** Lien « Tout voir » (ou autre) dans l'en-tête d'un bloc. */
export function MoreLink({ href, children, srLabel }: { href: string; children: ReactNode; srLabel?: string }) {
  return (
    <Link href={href} className={`inline-flex min-h-11 shrink-0 items-center text-sm font-semibold whitespace-nowrap text-bb-accent-text no-underline ${focusRing}`}>
      {children}
      {srLabel && <span className="sr-only"> : {srLabel}</span>}
    </Link>
  );
}

/**
 * « Aller au forum », l'action principale des deux accueils, et le bouton Discord à côté, moins voyant (carte 210).
 * Le bouton Discord n'apparaît que si l'invitation est réglée dans l'administration (carte 189).
 */
export function ForumDiscordButtons({ discordHref, className }: { discordHref: string | null; className?: string }) {
  return (
    <div className={cn("flex gap-2.5", className)}>
      <Button asChild variant="primary" size="tap" className="min-h-[52px] flex-1 px-6 text-base font-extrabold whitespace-nowrap lg:flex-none lg:px-3 lg:text-sm xl:px-6 xl:text-base">
        <Link href="/forum">
          <MessageSquare size={20} aria-hidden="true" /> Aller au forum
        </Link>
      </Button>
      {discordHref && (
        <Button asChild variant="secondary" size="tap" className="min-h-[52px] border-bb-text-muted whitespace-nowrap lg:px-3 lg:text-sm xl:px-4 xl:text-base">
          <a href={discordHref} target="_blank" rel="noopener noreferrer">
            {/* Libellé long seulement à partir de 1280 pixels, pour que la rangée tienne sur une ligne */}
            <span className="xl:hidden">Discord</span>
            <span className="hidden xl:inline">Rejoindre le Discord</span>
            <span className="sr-only">(nouvel onglet)</span>
          </a>
        </Button>
      )}
    </div>
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
  return (
    <section aria-labelledby="home-next-tournaments" className={cn(blockSurface, className)}>
      {/* Titre et liens sur une seule ligne, même en 360 pixels de large (carte 205) */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2 lg:px-[22px] lg:pt-4">
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
                className="flex items-center gap-3.5 px-4 py-3.5 text-inherit no-underline transition-colors hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus lg:px-[22px]"
              >
                <DateBlock date={tournament.date} className="size-[52px] border-0 bg-bb-accent-soft" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-base leading-snug font-bold break-words text-bb-text">{tournament.name}</span>
                  <span className="text-sm text-bb-text-muted">
                    {placeText(tournament)} · {placesText(takenPlaces(tournament), tournament.maxParticipants)}
                  </span>
                  {registeredIds?.has(tournament.id) && <span className="text-sm font-semibold text-bb-success-text">Tu es inscrit</span>}
                </span>
                <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-bb-text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 border-t border-bb-border px-4 py-6 text-center lg:py-7">
          <p className="m-0 text-base font-bold text-bb-text">Aucun tournoi prévu pour l&apos;instant</p>
          <p className="m-0 max-w-[300px] text-sm leading-normal text-bb-text-muted">Vous organisez un tournoi ? Annoncez-le à la communauté.</p>
          {/* Un seul « Créer » : quand l'en-tête en porte déjà un (accueil du membre), pas de second bouton ici */}
          {createHref && !createInHeader && (
            <Link
              href={createHref}
              className={`inline-flex min-h-11 items-center gap-1 rounded-bb-md bg-bb-accent-soft px-4 text-sm font-bold text-bb-accent-text no-underline ${focusRing}`}
            >
              <Plus size={15} aria-hidden="true" /> Créer un tournoi
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
