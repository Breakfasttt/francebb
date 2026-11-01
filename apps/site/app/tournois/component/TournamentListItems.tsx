/**
 * Un tournoi dans la liste `/tournois` (refonte, carte 089) : carte de la grille (`TournamentCard`) ou ligne de la
 * liste (`TournamentRow`). La carte entière, comme la ligne entière, est un lien vers le sujet du forum du tournoi.
 * Le badge de statut (« Annulé », « Terminé », « Passé ») est partagé par les deux.
 */
import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Badge, Card, cn } from "@bbfrance/ui";
import { takenPlaces } from "@/lib/tournamentPlaces";

/** Champs du tournoi utilisés par la liste. */
export interface TournamentListItem {
  id: string;
  name: string;
  date: Date;
  days: string | null;
  location: string;
  ville: string | null;
  region: string | null;
  departement: string | null;
  gameEdition: string | null;
  ruleset: string | null;
  structure: string | null;
  price: number | null;
  maxParticipants: number | null;
  // Places prises : calculées par takenPlaces (lib/tournamentPlaces.ts, carte 150) à partir des trois champs suivants
  currentParticipants: number;
  isTeam: boolean;
  _count: { registrations: number; teams: number };
  mealsIncluded: boolean;
  lodgingAtVenue: boolean;
  fridayArrival: boolean;
  isFinished: boolean;
  isCancelled: boolean;
  organizer: { name: string | null };
  topic: { id: string } | null;
}

/** Adresse du sujet du tournoi ; sans sujet (supprimé), la liste des tournois, faute de page dédiée. */
const topicHref = (tournament: TournamentListItem) => (tournament.topic?.id ? `/forum/topic/${tournament.topic.id}` : "/tournois");

const priceText = (price: number | null) => (price === 0 ? "Gratuit" : price != null ? `${price} €` : "Prix non précisé");

const placeText = (tournament: TournamentListItem) => (tournament.ville || tournament.location);

/** Badge de statut : annulé, terminé ou passé (date dépassée sans avoir été marqué terminé). */
export function TournamentStatusBadge({ tournament, todayStart }: { tournament: TournamentListItem; todayStart: Date }) {
  if (tournament.isCancelled) return <Badge variant="danger">Annulé</Badge>;
  if (tournament.isFinished) return <Badge variant="success">Terminé</Badge>;
  if (new Date(tournament.date) < todayStart) return <Badge variant="neutral">Passé</Badge>;
  return null;
}

/** Pavé de la date : le jour en grand, le mois en dessous. Réutilisé par la fiche d'une ligue (carte 094). */
export function DateBlock({ date, className }: { date: Date; className?: string }) {
  const value = new Date(date);
  return (
    <div
      aria-hidden="true"
      className={cn("flex size-12 shrink-0 flex-col items-center justify-center rounded-bb-md border border-bb-border bg-bb-surface-2 leading-none", className)}
    >
      <span className="text-lg font-bold text-bb-text">{value.getDate()}</span>
      <span className="mt-0.5 text-xs font-semibold text-bb-accent-text uppercase">{value.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}</span>
    </div>
  );
}

const muted = "text-bb-text-muted";

export function TournamentCard({ tournament, todayStart }: { tournament: TournamentListItem; todayStart: Date }) {
  const inactive = tournament.isCancelled || tournament.isFinished;
  return (
    <Link
      href={topicHref(tournament)}
      className="group block rounded-bb-lg text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bb-focus"
    >
      <Card className={cn("flex h-full flex-col gap-3 p-4 transition-colors group-hover:border-bb-text-muted", inactive && "opacity-75")}>
        <div className="flex items-start gap-3">
          <DateBlock date={tournament.date} />
          <div className="min-w-0 flex-1">
            <h3 className="m-0 border-0 p-0 text-base leading-snug font-bold break-words text-bb-text normal-case not-italic">{tournament.name}</h3>
            <p className={cn("m-0 mt-1 flex items-start gap-1.5 text-sm", muted)}>
              <MapPin size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span className="min-w-0 break-words">
                {placeText(tournament)}
                {tournament.region && `, ${tournament.region}`}
                {tournament.departement && ` (${tournament.departement})`}
              </span>
            </p>
            <p className={cn("m-0 mt-0.5 flex items-center gap-1.5 text-sm", muted)}>
              <CalendarDays size={15} aria-hidden="true" className="shrink-0" />
              <span>
                {new Date(tournament.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                {" · "}
                {tournament.days || 1} jour{parseInt(tournament.days || "1") > 1 ? "s" : ""}
              </span>
            </p>
          </div>
          <TournamentStatusBadge tournament={tournament} todayStart={todayStart} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="accent">{tournament.gameEdition || "BB20"}</Badge>
          <Badge variant="outline">Règles : {tournament.ruleset || "NAF"}</Badge>
          {tournament.structure && <Badge variant="neutral">{tournament.structure}</Badge>}
          {tournament.mealsIncluded && <Badge variant="neutral">Repas inclus</Badge>}
          {tournament.lodgingAtVenue && <Badge variant="neutral">Dodo sur place</Badge>}
          {tournament.fridayArrival && <Badge variant="neutral">Vendredi</Badge>}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-bb-border pt-3 text-sm">
          <span className={cn("flex items-center gap-1.5", muted)} title="Inscriptions">
            <Users size={16} aria-hidden="true" />
            <span>
              {takenPlaces(tournament)} / {tournament.maxParticipants || "∞"} places
            </span>
          </span>
          <span className="font-bold text-bb-text">{priceText(tournament.price)}</span>
        </div>
      </Card>
    </Link>
  );
}

export function TournamentRow({ tournament, todayStart }: { tournament: TournamentListItem; todayStart: Date }) {
  const status = <TournamentStatusBadge tournament={tournament} todayStart={todayStart} />;
  const isActive = !tournament.isCancelled && !tournament.isFinished && new Date(tournament.date) >= todayStart;
  return (
    <Link
      href={topicHref(tournament)}
      className="flex min-h-14 items-start gap-3 border-b border-bb-border px-4 py-3 text-inherit no-underline last:border-b-0 hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus lg:grid lg:grid-cols-[48px_minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_7rem_5.5rem] lg:items-center lg:gap-4"
    >
      <DateBlock date={tournament.date} />
      <div className="min-w-0 flex-1">
        <p className="m-0 flex flex-wrap items-center gap-2 text-[0.95rem] leading-snug font-bold break-words text-bb-text">
          <span className="min-w-0 break-words">{tournament.name}</span>
          <span className="lg:hidden">{status}</span>
        </p>
        <p className={cn("m-0 mt-0.5 text-sm", muted)}>Par {tournament.organizer.name}</p>
        {/* Téléphone : lieu, format et prix sous le nom (sur ordinateur, ils ont leurs colonnes) */}
        <p className={cn("m-0 mt-0.5 text-sm break-words lg:hidden", muted)}>
          {placeText(tournament)} · {tournament.gameEdition || "BB20"} · {tournament.ruleset || "NAF"} ·{" "}
          <span className="font-semibold text-bb-text">{priceText(tournament.price)}</span>
          {isActive && ` · ${takenPlaces(tournament)}/${tournament.maxParticipants || "∞"} places`}
        </p>
      </div>
      <div className="hidden min-w-0 text-sm lg:block">
        <p className="m-0 truncate text-bb-text">{placeText(tournament)}</p>
        <p className={cn("m-0 truncate", muted)}>
          {tournament.region} {tournament.departement && `(${tournament.departement})`}
        </p>
      </div>
      <div className="hidden flex-wrap gap-1 lg:flex">
        <Badge variant="accent">{tournament.gameEdition || "BB20"}</Badge>
        <Badge variant="outline">{tournament.ruleset || "NAF"}</Badge>
      </div>
      <div className="hidden text-sm lg:block">
        {isActive ? (
          <span className={cn("inline-flex items-center gap-1", muted)}>
            <Users size={14} aria-hidden="true" />
            {takenPlaces(tournament)}/{tournament.maxParticipants || "∞"}
          </span>
        ) : (
          status
        )}
      </div>
      <p className="m-0 hidden text-right text-sm font-bold text-bb-text lg:block">{priceText(tournament.price)}</p>
    </Link>
  );
}
