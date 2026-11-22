/**
 * Un tournoi dans la liste `/tournois` (refonte, carte 089) : carte de la grille (`TournamentCard`) ou ligne de la
 * liste (`TournamentRow`). La carte entière, comme la ligne entière, est un lien vers le sujet du forum du tournoi.
 * Le badge d'état (« Annulé », « Terminé », « Passé », « Complet », « Inscriptions fermées ») et l'étiquette « Par
 * équipes » sont partagés par les deux ; les places prises s'écrivent comme sur la fiche (`placesLabel`, revue 221).
 */
import { gameEditionLabel, structureLabel } from "@/lib/tournamentForm";
import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Badge, Card, cn } from "@bbfrance/ui";
import { isFull, placesLabel, takenPlaces } from "@/lib/tournamentPlaces";
import { isTournamentOver } from "@/lib/tournamentDates";

/** Champs du tournoi utilisés par la liste. */
export interface TournamentListItem {
  id: string;
  name: string;
  date: Date;
  /** Dernier jour du tournoi ; vide pour un tournoi d'un jour importé de l'ancien site. */
  endDate: Date | null;
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
  registrationsLocked: boolean;
  organizer: { name: string | null };
  topic: { id: string } | null;
}

/** Adresse du sujet du tournoi ; sans sujet (supprimé), la liste des tournois, faute de page dédiée. */
export const topicHref = (tournament: Pick<TournamentListItem, "topic">) => (tournament.topic?.id ? `/forum/topic/${tournament.topic.id}` : "/tournois");

/** Prix : en gras quand il est connu ; « Prix non précisé » reste discret (revue 221). */
function Price({ price }: { price: number | null }) {
  if (price == null) return <span className="font-normal text-bb-text-muted">Prix non précisé</span>;
  return <span className="font-bold text-bb-text">{price === 0 ? "Gratuit" : `${price} €`}</span>;
}

/** Ville du tournoi, ou à défaut son lieu. Réutilisé par l'accueil (carte 155). */
export const placeText = (tournament: Pick<TournamentListItem, "ville" | "location">) => (tournament.ville || tournament.location);

/**
 * Badge d'état, un seul par tournoi : annulé, terminé, passé (dernier jour dépassé, heure de Paris, sans avoir été
 * marqué terminé : règle de lib/tournamentDates.ts, carte 187), puis, pour un tournoi à venir, complet ou inscriptions
 * fermées. Badges sobres (DESIGN.md) : le contour rouge est réservé à « Annulé », le reste est en gris.
 */
export function TournamentStatusBadge({ tournament, now }: { tournament: TournamentListItem; now: Date }) {
  if (tournament.isCancelled) return <Badge variant="danger">Annulé</Badge>;
  if (tournament.isFinished) return <Badge variant="neutral">Terminé</Badge>;
  if (isTournamentOver(tournament, now)) return <Badge variant="neutral">Passé</Badge>;
  if (tournament.registrationsLocked) return <Badge variant="neutral">Inscriptions fermées</Badge>;
  if (isFull(tournament)) return <Badge variant="neutral">Complet</Badge>;
  return null;
}

const places = (tournament: TournamentListItem) => placesLabel(takenPlaces(tournament), tournament.maxParticipants, tournament.isTeam);

/** Pavé de la date : le jour en grand, le mois en dessous. Réutilisé par la fiche d'une ligue (carte 094). */
export function DateBlock({ date, className }: { date: Date; className?: string }) {
  const value = new Date(date);
  return (
    <div
      aria-hidden="true"
      className={cn("flex size-12 shrink-0 flex-col items-center justify-center rounded-bb-md border border-bb-border bg-bb-surface-2 leading-none", className)}
    >
      <span className="text-lg font-bold text-bb-text">{value.getDate()}</span>
      <span className="mt-0.5 text-xs font-semibold text-bb-text-muted uppercase">{value.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}</span>
    </div>
  );
}

const muted = "text-bb-text-muted";

export function TournamentCard({ tournament, now }: { tournament: TournamentListItem; now: Date }) {
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
            <h3 className="text-base leading-snug font-bold break-words text-bb-text">{tournament.name}</h3>
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
          <TournamentStatusBadge tournament={tournament} now={now} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="neutral">{gameEditionLabel(tournament.gameEdition)}</Badge>
          {tournament.isTeam && <Badge variant="neutral">Par équipes</Badge>}
          {tournament.ruleset && <Badge variant="neutral">Règles : {tournament.ruleset}</Badge>}
          {tournament.structure && <Badge variant="neutral">{structureLabel(tournament.structure)}</Badge>}
          {tournament.mealsIncluded && <Badge variant="neutral">Repas inclus</Badge>}
          {tournament.lodgingAtVenue && <Badge variant="neutral">Dodo sur place</Badge>}
          {tournament.fridayArrival && <Badge variant="neutral">Vendredi</Badge>}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-bb-border pt-3 text-sm">
          <span className={cn("flex items-center gap-1.5 tabular-nums", muted)}>
            <Users size={16} aria-hidden="true" />
            <span>{places(tournament)}</span>
          </span>
          <Price price={tournament.price} />
        </div>
      </Card>
    </Link>
  );
}

export function TournamentRow({ tournament, now }: { tournament: TournamentListItem; now: Date }) {
  const status = <TournamentStatusBadge tournament={tournament} now={now} />;
  const isActive = !tournament.isCancelled && !tournament.isFinished && !isTournamentOver(tournament, now);
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
        <p className={cn("m-0 mt-0.5 text-sm", muted)}>
          Par {tournament.organizer.name}
          {tournament.isTeam && " · Par équipes"}
        </p>
        {/* Téléphone : lieu, format et prix sous le nom (sur ordinateur, ils ont leurs colonnes) */}
        <p className={cn("m-0 mt-0.5 text-sm break-words lg:hidden", muted)}>
          {placeText(tournament)} · {gameEditionLabel(tournament.gameEdition)}{tournament.ruleset ? ` · ${tournament.ruleset}` : ""} ·{" "}
          <Price price={tournament.price} />
          {isActive && ` · ${places(tournament)}`}
        </p>
      </div>
      <div className="hidden min-w-0 text-sm lg:block">
        <p className="m-0 truncate text-bb-text">{placeText(tournament)}</p>
        <p className={cn("m-0 truncate", muted)}>
          {tournament.region} {tournament.departement && `(${tournament.departement})`}
        </p>
      </div>
      <div className="hidden flex-wrap gap-1 lg:flex">
        <Badge variant="neutral">{gameEditionLabel(tournament.gameEdition)}</Badge>
        {tournament.ruleset && <Badge variant="neutral">{tournament.ruleset}</Badge>}
      </div>
      <div className="hidden text-sm lg:flex lg:flex-col lg:items-start lg:gap-1">
        {isActive && <span className={cn("tabular-nums", muted)}>{places(tournament)}</span>}
        {status}
      </div>
      <p className="m-0 hidden text-right text-sm lg:block">
        <Price price={tournament.price} />
      </p>
    </Link>
  );
}
