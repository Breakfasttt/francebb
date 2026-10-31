"use client";

/**
 * Affichages du classement du Championnat de France (refonte, carte 097, ADR 0006).
 * - `RankingList` : classement des coachs (année, glissant ou archive). Une ligne par coach : rang, coach et points
 *   toujours visibles ; sur ordinateur, le numéro NAF et le nombre de tournois joués ont aussi leur colonne. Le bouton
 *   « Détails de … » (attribut `aria-expanded`) déplie la ligne : numéro NAF, tournois joués, lien vers le profil et
 *   les meilleurs tournois retenus (points, place, lien vers le sujet du tournoi). Sur téléphone, rien ne déborde : les
 *   colonnes secondaires passent dans la ligne dépliée.
 * - `RosterList` : le meilleur coach de chaque roster.
 * - `HallOfFame` : le podium de chaque année.
 * Les données viennent des actions serveur de `app/classement/actions.ts`, inchangées par la refonte.
 */
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Medal, Shield, Trophy, User } from "lucide-react";
import { Badge, Button, Card, cn } from "@bbfrance/ui";

export interface RankingResult {
  points: number;
  rank?: number;
  totalParticipants?: number;
  tournamentName?: string;
  /** Nom du tournoi dans une archive saisie à la main. */
  name?: string;
  topicId?: string | null;
}

export interface RankingEntry {
  id?: string;
  name: string;
  nafNumber?: string | null;
  userId?: string | null;
  roster?: string;
  totalPoints: number;
  count?: number;
  bestResults?: RankingResult[];
}

export interface HallOfFameYear {
  year: number;
  podium: { rank: number; name: string; totalPoints: number }[];
}

/** Couleur du rang : or pour le premier, puis les deux autres marches du podium. */
function rankTone(rank: number) {
  if (rank === 1) return "text-bb-rank";
  if (rank === 2) return "text-bb-text";
  if (rank === 3) return "text-bb-warning-text";
  return "text-bb-text-muted";
}

/** Points arrondis à deux décimales au plus (les points CDF sont calculés à 4 décimales). */
export function formatPoints(points: number) {
  return Number.isFinite(points) ? String(Math.round(points * 100) / 100) : "0";
}

// Ordinateur : rang, coach, NAF, tournois joués, points, bouton de détail. Téléphone : rang, coach, points, bouton.
const columns = "grid grid-cols-[2.25rem_minmax(0,1fr)_auto_2.75rem] items-center gap-x-2 lg:grid-cols-[3rem_minmax(0,1fr)_7rem_7rem_6rem_2.75rem] lg:gap-x-3";

function RankingRow({ entry, rank }: { entry: RankingEntry; rank: number }) {
  const [open, setOpen] = useState(false);
  const detailsId = `cdf-details-${rank}`;
  const results = entry.bestResults ?? [];

  return (
    <li className="border-t border-bb-border first:border-t-0">
      <div className={cn(columns, "px-3 py-2 lg:px-4")}>
        <span className={cn("text-center text-lg font-bold tabular-nums", rankTone(rank))}>{rank}</span>
        <span className="min-w-0">
          <span className="block font-semibold break-words text-bb-text">{entry.name}</span>
          {!entry.userId && <span className="block text-xs text-bb-text-muted lg:hidden">Non associé à un membre</span>}
        </span>
        <span className="hidden text-sm text-bb-text-muted tabular-nums lg:block">{entry.nafNumber ? `#${entry.nafNumber}` : "-"}</span>
        <span className="hidden text-sm text-bb-text-muted tabular-nums lg:block">{entry.count ?? results.length}</span>
        <span className="text-right">
          <span className="block text-lg leading-tight font-bold text-bb-accent-text tabular-nums">{formatPoints(entry.totalPoints)}</span>
          <span className="block text-xs text-bb-text-muted lg:sr-only">points</span>
        </span>
        <Button
          type="button"
          variant="quiet"
          size="tap-icon"
          aria-expanded={open}
          aria-controls={detailsId}
          aria-label={`Détails de ${entry.name}`}
          onClick={() => setOpen(!open)}
        >
          <ChevronDown size={20} aria-hidden="true" className={cn("transition-transform", open && "rotate-180")} />
        </Button>
      </div>

      {open && (
        <div id={detailsId} className="flex flex-col gap-3 border-t border-dashed border-bb-border bg-bb-surface-2 px-3 py-3 lg:px-4">
          <p className="m-0 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-bb-text-muted">
            <span>NAF : {entry.nafNumber ? `#${entry.nafNumber}` : "non renseigné"}</span>
            <span>{entry.count ?? results.length} tournoi{(entry.count ?? results.length) > 1 ? "s" : ""} joué{(entry.count ?? results.length) > 1 ? "s" : ""}</span>
            {entry.userId ? (
              <Link
                href={`/spy/${entry.userId}`}
                aria-label={`Voir le profil de ${entry.name}`}
                className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-bb-accent-text hover:underline"
              >
                <User size={16} aria-hidden="true" /> Voir le profil
              </Link>
            ) : (
              <span>Non associé à un membre du site</span>
            )}
          </p>
          {results.length > 0 ? (
            <div>
              <p className="m-0 mb-2 text-xs font-bold tracking-wide text-bb-text-muted uppercase">Meilleurs tournois retenus</p>
              <ul className="m-0 grid list-none grid-cols-1 gap-x-4 p-0 lg:grid-cols-2">
                {results.map((result, index) => {
                  const title = result.tournamentName || result.name || "Tournoi";
                  const rank = result.rank ?? 0;
                  return (
                    <li key={index} className="flex min-w-0 items-center gap-3 border-b border-bb-border py-1.5 last:border-b-0 lg:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
                      <span className="min-w-0 flex-1">
                        {result.topicId ? (
                          <Link href={`/forum/topic/${result.topicId}`} className="inline-flex min-h-11 items-center font-semibold break-words text-bb-text hover:underline lg:min-h-0">
                            {title}
                          </Link>
                        ) : (
                          <span className="block break-words text-bb-text">{title}</span>
                        )}
                        {rank > 0 && (
                          <span className="block text-sm text-bb-text-muted tabular-nums">
                            {rank}
                            {rank === 1 ? "er" : "e"}
                            {result.totalParticipants ? ` sur ${result.totalParticipants}` : ""}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 font-bold text-bb-accent-text tabular-nums">{formatPoints(result.points)} pts</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="m-0 text-sm text-bb-text-muted">Le détail des tournois n&apos;est pas connu pour cette ligne.</p>
          )}
        </div>
      )}
    </li>
  );
}

export function RankingList({ entries }: { entries: RankingEntry[] }) {
  return (
    <Card className="overflow-hidden">
      <div aria-hidden="true" className={cn(columns, "border-b border-bb-border bg-bb-surface-2 px-3 py-2 text-xs font-bold tracking-wide text-bb-text-muted uppercase lg:px-4")}>
        <span className="text-center">#</span>
        <span>Coach</span>
        <span className="hidden lg:block">NAF</span>
        <span className="hidden lg:block">Tournois</span>
        <span className="text-right">Points</span>
        <span />
      </div>
      <ol className="m-0 list-none p-0">
        {entries.map((entry, index) => (
          <RankingRow key={entry.id ?? `${entry.name}-${index}`} entry={entry} rank={index + 1} />
        ))}
      </ol>
    </Card>
  );
}

export function RosterList({ entries }: { entries: RankingEntry[] }) {
  return (
    <ol className="m-0 grid list-none grid-cols-1 gap-3 p-0 lg:grid-cols-2">
      {entries.map((entry, index) => (
        <li key={`${entry.roster}-${index}`}>
          <Card className="flex items-center gap-3 p-3 lg:p-4">
            <span aria-hidden="true" className={cn("flex size-10 shrink-0 items-center justify-center rounded-full bg-bb-surface-2", rankTone(index + 1))}>
              {index < 3 ? <Trophy size={20} /> : <Shield size={20} />}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="m-0 border-0 p-0 text-base font-bold break-words text-bb-text normal-case not-italic">{entry.roster}</h2>
              <p className="m-0 mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-bb-text-muted">
                <span>Meilleur coach :</span>
                {entry.userId ? (
                  <Link href={`/spy/${entry.userId}`} aria-label={`Voir le profil de ${entry.name}`} className="font-semibold break-words text-bb-text hover:underline">
                    {entry.name}
                  </Link>
                ) : (
                  <span className="font-semibold break-words text-bb-text">{entry.name}</span>
                )}
              </p>
            </div>
            <span className="shrink-0 text-right">
              <span className="block text-lg leading-tight font-bold text-bb-accent-text tabular-nums">{formatPoints(entry.totalPoints)}</span>
              <span className="block text-xs text-bb-text-muted">points</span>
            </span>
          </Card>
        </li>
      ))}
    </ol>
  );
}

export function HallOfFame({ years }: { years: HallOfFameYear[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {years.map((entry) => (
        <li key={entry.year}>
          <Card className="flex h-full flex-col gap-3 p-4">
            <h2 className="m-0 flex items-center justify-between border-0 p-0 text-xl font-bold text-bb-text normal-case not-italic">
              <span>{entry.year}</span>
              <Trophy size={22} aria-hidden="true" className="text-bb-rank" />
            </h2>
            <ol className="m-0 flex list-none flex-col gap-2 p-0">
              {entry.podium.map((place) => (
                <li key={place.rank} className="flex items-center gap-3 rounded-bb-md bg-bb-surface-2 px-3 py-2">
                  <Medal size={20} aria-label={`${place.rank}${place.rank === 1 ? "er" : "e"}`} className={cn("shrink-0", rankTone(place.rank))} />
                  <span className="min-w-0 flex-1 font-semibold break-words text-bb-text">{place.name}</span>
                  <Badge variant={place.rank === 1 ? "rank" : "neutral"} className="tabular-nums">{formatPoints(place.totalPoints)} pts</Badge>
                </li>
              ))}
            </ol>
          </Card>
        </li>
      ))}
    </ul>
  );
}
