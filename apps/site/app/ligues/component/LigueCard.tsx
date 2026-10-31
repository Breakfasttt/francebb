/**
 * Une ligue dans la liste `/ligues` (refonte, carte 094, ADR 0006) : carte de la grille (`LigueCard`) ou ligne de la
 * liste (`LigueRow`). La carte entière, comme la ligne entière, est un lien vers la fiche de la ligue.
 * La zone est affichée par son libellé (« R2 - Nord-Ouest ») quand la page le fournit, sinon par sa clé.
 */
import Link from "next/link";
import { MapPin, Trophy, Users } from "lucide-react";
import { Badge, cn } from "@bbfrance/ui";
import LigueBlason from "./LigueBlason";

export interface LigueListItem {
  id: string;
  name: string;
  acronym: string;
  geographicalZone: string | null;
  region: string | null;
  ville: string | null;
  description: string | null;
  image: string | null;
  _count?: { tournaments: number; members: number };
}

/** Lieu affiché : zone, puis ville (ou région administrative). */
function placeText(ligue: LigueListItem, zoneLabel?: string) {
  const zone = zoneLabel || ligue.geographicalZone;
  const town = ligue.ville || ligue.region;
  return [zone, town].filter(Boolean).join(" · ") || "France";
}

/** Début de la présentation, sans les balises BBCode. */
function excerpt(description: string | null) {
  if (!description) return "";
  const text = description.replace(/\[\/?[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 140 ? `${text.slice(0, 140)}…` : text;
}

const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? "s" : ""}`;

/** Membres et tournois de la ligue. */
function Stats({ ligue, className }: { ligue: LigueListItem; className?: string }) {
  const members = ligue._count?.members ?? 0;
  const tournaments = ligue._count?.tournaments ?? 0;
  return (
    <p className={cn("m-0 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-bb-text-muted", className)}>
      <span className="inline-flex items-center gap-1.5">
        <Users size={16} aria-hidden="true" />
        {plural(members, "membre")}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Trophy size={16} aria-hidden="true" />
        {plural(tournaments, "tournoi")}
      </span>
    </p>
  );
}

const linkClass =
  "text-bb-text no-underline hover:border-bb-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bb-focus";

export function LigueCard({ ligue, zoneLabel }: { ligue: LigueListItem; zoneLabel?: string }) {
  const summary = excerpt(ligue.description);
  return (
    <Link href={`/ligue/${ligue.id}`} className={cn("flex h-full flex-col gap-3 rounded-bb-lg border border-bb-border bg-bb-surface p-4", linkClass)}>
      <div className="flex items-start gap-3">
        <LigueBlason image={ligue.image} size={56} />
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
          <h2 className="m-0 line-clamp-2 border-0 p-0 text-base leading-snug font-bold break-words text-bb-text normal-case not-italic">{ligue.name}</h2>
          <Badge variant="outline">{ligue.acronym}</Badge>
        </div>
      </div>
      <p className="m-0 flex items-start gap-1.5 text-sm text-bb-text-muted">
        <MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
        <span className="min-w-0 break-words">{placeText(ligue, zoneLabel)}</span>
      </p>
      {summary && <p className="m-0 line-clamp-2 text-sm break-words text-bb-text-muted">{summary}</p>}
      <Stats ligue={ligue} className="mt-auto border-t border-bb-border pt-3" />
    </Link>
  );
}

export function LigueRow({ ligue, zoneLabel }: { ligue: LigueListItem; zoneLabel?: string }) {
  return (
    <Link
      href={`/ligue/${ligue.id}`}
      className={cn("flex min-h-14 items-center gap-3 border-b border-bb-border px-3 py-3 last:border-b-0 hover:bg-bb-surface-2 lg:px-4", linkClass)}
    >
      <LigueBlason image={ligue.image} size={44} />
      <div className="min-w-0 flex-1">
        <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 font-bold break-words text-bb-text">
          {ligue.name}
          <Badge variant="outline">{ligue.acronym}</Badge>
        </p>
        <p className="m-0 mt-1 flex items-start gap-1.5 text-sm text-bb-text-muted">
          <MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span className="min-w-0 break-words">{placeText(ligue, zoneLabel)}</span>
        </p>
        {/* Téléphone : membres et tournois sous le nom */}
        <Stats ligue={ligue} className="mt-1 lg:hidden" />
      </div>
      <Stats ligue={ligue} className="hidden shrink-0 lg:flex" />
    </Link>
  );
}
