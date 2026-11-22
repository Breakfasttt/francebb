/**
 * Fiche d'un tournoi, en tête du sujet du forum qui lui sert de page (refonte, carte 089, ADR 0006) : nom, statut,
 * mode par équipes et circuits, ligue organisatrice, puis les informations pratiques (date et durée, lieu avec lien
 * vers la carte, participants, prix, plateforme, édition, règles, type) et la logistique (repas, logement, accueil
 * le vendredi). Sur téléphone, les informations passent sur deux colonnes, puis une seule sur un très petit écran.
 */
import { gameEditionLabel, platformLabel, structureLabel } from "@/lib/tournamentForm";
import { placesLabel } from "@/lib/tournamentPlaces";
import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge, Card } from "@bbfrance/ui";

interface TournamentSummaryProps {
  tournament: {
    name: string;
    date: Date;
    location: string;
    address: string | null;
    gmapsUrl: string | null;
    ville: string | null;
    departement: string | null;
    region: string | null;
    maxParticipants: number | null;
    currentParticipants: number;
    price: number | null;
    priceMeals: number | null;
    priceLodging: number | null;
    days: string | null;
    structure: string | null;
    ruleset: string | null;
    gameEdition: string | null;
    platform: string | null;
    mealsIncluded: boolean;
    lodgingAtVenue: boolean;
    fridayArrival: boolean;
    isTeam: boolean;
    coachsPerTeam: number | null;
    isNAF: boolean;
    isCDF: boolean;
    isCGO: boolean;
    isTGE: boolean;
    isTSC: boolean;
    isFinished: boolean;
    isCancelled: boolean;
    ligueId?: string | null;
    ligueCustom?: string | null;
    ligue?: { id: string; name: string; acronym: string } | null;
    lat?: number | null;
    lng?: number | null;
    registrations?: any[];
    teams?: any[];
    mercenaries?: any[];
  };
}

/** Une information pratique : intitulé en voix Heading, valeur (DESIGN.md : pas d'icône devant chaque libellé). */
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="font-bb-heading text-bb-label text-bb-text-muted">{label}</dt>
      <dd className="mt-0.5 text-[0.95rem] font-semibold break-words text-bb-text">{children}</dd>
    </div>
  );
}

const TournamentSummary: React.FC<TournamentSummaryProps> = ({ tournament }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  const championships = [
    { label: 'NAF', active: tournament.isNAF },
    { label: 'CDF', active: tournament.isCDF },
    { label: 'CGO', active: tournament.isCGO },
    { label: 'TGE', active: tournament.isTGE },
    { label: 'TSC', active: tournament.isTSC },
  ].filter(c => c.active);

  // Construction de l'adresse pour Google Maps
  const displayAddress = tournament.address || tournament.location;
  const isActuallySpecified = displayAddress && displayAddress !== "Lieu non précisé";

  // Si on a des coordonnées précises, on les utilise en priorité
  let gmapsUrl = tournament.gmapsUrl;
  if (!gmapsUrl && tournament.lat != null && tournament.lng != null) {
    gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${tournament.lat},${tournament.lng}`;
  }

  // Fallback sur la recherche textuelle
  if (!gmapsUrl) {
    const gmapsQuery = encodeURIComponent(`${displayAddress || ''} ${tournament.ville || ''} ${tournament.departement || ''}`.trim());
    gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${gmapsQuery}`;
  }

  // Participants : validés, puis pré-inscrits (p), liste d'attente (a) et mercenaires (m)
  const byStatus = (status: string) =>
    (tournament.isTeam ? tournament.teams?.filter((t) => t.status === status) : tournament.registrations?.filter((r) => r.status === status)) || [];
  const validated = byStatus("REGISTERED");
  const preReg = byStatus("PRE_REGISTERED");
  const waiting = byStatus("WAITING_LIST");
  const mercs = tournament.mercenaries || [];

  // Logistique écrite en clair (plutôt que des étiquettes barrées, qui se lisent mal)
  const options = [
    tournament.mealsIncluded ? "Repas inclus" : "Repas non inclus",
    tournament.lodgingAtVenue ? "Dodo sur place" : "Pas de dodo sur place",
    tournament.fridayArrival ? "Accueil le vendredi" : "Pas d'accueil le vendredi",
  ];
  // Participants en toutes lettres (l'ancien « 2 (p:1) » était illisible)
  const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? "s" : ""}`;
  // Places prises : validés et pré-inscrits, en équipes pour un tournoi par équipes ; même calcul et même libellé que
  // la liste /tournois (lib/tournamentPlaces.ts, revue 221). Le nombre importé de l'ancien site compte s'il est plus grand.
  const taken = Math.max(validated.length + preReg.length, tournament.currentParticipants);
  const participantDetails = [
    preReg.length > 0 && `dont ${plural(preReg.length, tournament.isTeam ? "équipe pré-inscrite" : "pré-inscrit")}`,
    waiting.length > 0 && `${waiting.length} en attente`,
    mercs.length > 0 && plural(mercs.length, "mercenaire"),
  ].filter(Boolean).join(" · ");

  return (
    <Card className="flex flex-col gap-4 p-4 lg:p-5">
      {/* Le nom du tournoi est déjà le titre de la page : la fiche n'a qu'un intitulé discret */}
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-bb-heading text-[0.95rem] text-bb-text">Fiche du tournoi</h2>
        {tournament.isCancelled ? (
          <Badge variant="danger">Annulé</Badge>
        ) : tournament.isFinished ? (
          <Badge variant="neutral">Terminé</Badge>
        ) : null}
        {tournament.isTeam && <Badge variant="neutral">Par équipes de {tournament.coachsPerTeam}</Badge>}
        {championships.map((c) => (
          <Badge key={c.label} variant="neutral">{c.label}</Badge>
        ))}
      </div>
      {/* Tournoi annulé : dit en clair, en tête de la fiche (revue 221) */}
      {tournament.isCancelled && (
        <p role="status" className="m-0 rounded-bb-md border border-bb-danger-text px-3 py-2 text-[0.95rem] font-semibold text-bb-danger-text">
          Ce tournoi est annulé. Les inscriptions sont fermées.
        </p>
      )}
      {(tournament.ligue || tournament.ligueCustom) && (
        <p className="-mt-2 flex flex-wrap items-center gap-1.5 text-sm text-bb-text-muted">
          <span>Organisé par</span>
          {tournament.ligue ? (
            <Link href={`/ligue/${tournament.ligue.id}`} className="font-semibold text-bb-accent-text hover:underline max-lg:inline-flex max-lg:min-h-11 max-lg:items-center">
              {tournament.ligue.name}
            </Link>
          ) : (
            <span className="font-semibold text-bb-text">{tournament.ligueCustom}</span>
          )}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-bb-border pt-4 lg:grid-cols-4">
        <Fact label="Date et durée">
          {formatDate(tournament.date)} ({tournament.days || 1} jour{parseInt(tournament.days || '1') > 1 ? 's' : ''})
        </Fact>
        <Fact label="Lieu">
          {isActuallySpecified ? (
            <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-bb-accent-text hover:underline max-lg:min-h-11">
              <span className="break-words">{displayAddress}</span>
              <ExternalLink size={13} aria-hidden="true" className="shrink-0" />
              <span className="sr-only">(nouvel onglet)</span>
            </a>
          ) : (
            <span className="font-normal text-bb-text-muted">{tournament.location}</span>
          )}
          {(tournament.ville || tournament.departement) && (
            <span className="block text-sm font-normal text-bb-text-muted">
              {tournament.ville}{tournament.departement && ` (${tournament.departement})`}
            </span>
          )}
        </Fact>
        <Fact label="Participants">
          <span className="tabular-nums">
            {placesLabel(taken, tournament.maxParticipants, tournament.isTeam)}
          </span>
          {participantDetails && <span className="block text-sm font-normal text-bb-text-muted">{participantDetails}</span>}
        </Fact>
        <Fact label="Inscription (PAF)">
          {tournament.price === 0 ? "Gratuit" : tournament.price != null ? `${tournament.price} €` : <span className="font-normal text-bb-text-muted">Non précisé</span>}
          {(tournament.priceMeals || tournament.priceLodging) && (
            <span className="block text-sm font-normal text-bb-text-muted">
              {tournament.priceMeals && `Repas : +${tournament.priceMeals} € `}
              {tournament.priceLodging && `Dodo : +${tournament.priceLodging} €`}
            </span>
          )}
        </Fact>
        <Fact label="Plateforme">{platformLabel(tournament.platform)}</Fact>
        <Fact label="Édition">{gameEditionLabel(tournament.gameEdition)}</Fact>
        {tournament.ruleset && <Fact label="Ruleset">{tournament.ruleset}</Fact>}
        <Fact label="Format">{structureLabel(tournament.structure || "Resurrection")}</Fact>
      </dl>

      <p className="border-t border-bb-border pt-3 text-sm text-bb-text-muted">
        <span className="sr-only">Logistique : </span>
        {options.join(" · ")}
      </p>
    </Card>
  );
};

export default TournamentSummary;
