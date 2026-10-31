/**
 * Fiche d'un tournoi, en tête du sujet du forum qui lui sert de page (refonte, carte 089, ADR 0006) : nom, statut,
 * mode par équipes et circuits, ligue organisatrice, puis les informations pratiques (date et durée, lieu avec lien
 * vers la carte, participants, prix, plateforme, édition, règles, type) et la logistique (repas, logement, accueil
 * le vendredi). Sur téléphone, les informations passent sur deux colonnes, puis une seule sur un très petit écran.
 */
import React from "react";
import Link from "next/link";
import { Calendar, CheckCircle2, Coins, ExternalLink, Info, Layers, MapPin, Monitor, Shield, Trophy, Users, XCircle } from "lucide-react";
import { Badge, Card, cn } from "@bbfrance/ui";
import { parseInlineBBCode } from "@/lib/bbcode";

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

/** Une information pratique : icône, intitulé discret, valeur. */
function Fact({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-bb-accent-text">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold tracking-wide text-bb-text-muted uppercase">{label}</dt>
        <dd className="m-0 text-[0.95rem] font-semibold break-words text-bb-text">{children}</dd>
      </div>
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

  const options = [
    { label: "Repas inclus", active: tournament.mealsIncluded },
    { label: "Dodo sur place", active: tournament.lodgingAtVenue },
    { label: "Accueil vendredi", active: tournament.fridayArrival },
  ];

  return (
    <Card className="flex flex-col gap-4 p-4 lg:p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-bb-md bg-bb-accent-soft text-bb-accent-text">
          <Trophy size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {tournament.isCancelled ? (
              <Badge variant="danger">Annulé</Badge>
            ) : tournament.isFinished ? (
              <Badge variant="success">Terminé</Badge>
            ) : null}
            {tournament.isTeam && <Badge variant="outline">Par équipe de {tournament.coachsPerTeam}</Badge>}
            {championships.map((c) => (
              <Badge key={c.label} variant="accent">{c.label}</Badge>
            ))}
          </div>
          <h2
            className="m-0 mt-1 border-0 p-0 text-xl leading-tight font-bold break-words text-bb-text normal-case not-italic lg:text-2xl"
            dangerouslySetInnerHTML={{ __html: parseInlineBBCode(tournament.name) }}
          />
          {(tournament.ligue || tournament.ligueCustom) && (
            <p className="m-0 mt-1 flex flex-wrap items-center gap-1.5 text-sm text-bb-text-muted">
              <Shield size={14} aria-hidden="true" />
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
        </div>
      </div>

      <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-bb-border pt-4 lg:grid-cols-4 lg:gap-x-4">
        <Fact icon={<Calendar size={18} />} label="Date et durée">
          {formatDate(tournament.date)} ({tournament.days || 1} jour{parseInt(tournament.days || '1') > 1 ? 's' : ''})
        </Fact>
        <Fact icon={<MapPin size={18} />} label="Lieu">
          {isActuallySpecified ? (
            <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-bb-accent-text hover:underline max-lg:min-h-11">
              <span className="break-words">{displayAddress}</span>
              <ExternalLink size={13} aria-hidden="true" className="shrink-0" />
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
        <Fact icon={<Users size={18} />} label="Participants">
          {validated.length}
          {preReg.length > 0 && <span className="ml-1 text-sm font-normal text-bb-text-muted" title="Pré-inscrits">(p:{preReg.length})</span>}
          {waiting.length > 0 && <span className="ml-1 text-sm font-normal text-bb-text-muted" title="Liste d'attente">(a:{waiting.length})</span>}
          {mercs.length > 0 && <span className="ml-1 text-sm font-normal text-bb-text-muted" title="Mercenaires">(m:{mercs.length})</span>}
          {` / ${tournament.maxParticipants || '∞'} ${tournament.isTeam ? 'équipes' : 'coachs'}`}
        </Fact>
        <Fact icon={<Coins size={18} />} label="Inscription (PAF)">
          {tournament.price != null ? `${tournament.price} €` : 'N/A'}
          {(tournament.priceMeals || tournament.priceLodging) && (
            <span className="block text-sm font-normal text-bb-text-muted">
              {tournament.priceMeals && `Repas : +${tournament.priceMeals} € `}
              {tournament.priceLodging && `Dodo : +${tournament.priceLodging} €`}
            </span>
          )}
        </Fact>
        <Fact icon={<Monitor size={18} />} label="Plateforme">{tournament.platform || 'Tabletop'}</Fact>
        <Fact icon={<Layers size={18} />} label="Édition">{tournament.gameEdition || 'BB25'}</Fact>
        <Fact icon={<Shield size={18} />} label="Ruleset">{tournament.ruleset || 'Libre'}</Fact>
        <Fact icon={<Info size={18} />} label="Type de tournoi">{tournament.structure || 'Resurrection'}</Fact>
      </dl>

      <ul aria-label="Logistique" className="m-0 flex list-none flex-wrap gap-2 p-0">
        {options.map((option) => (
          <li
            key={option.label}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold",
              option.active ? "border-bb-success-text text-bb-success-text" : "border-bb-border text-bb-text-muted line-through decoration-1"
            )}
          >
            {option.active ? <CheckCircle2 size={15} aria-hidden="true" /> : <XCircle size={15} aria-hidden="true" />}
            <span>{option.label}</span>
            <span className="sr-only">{option.active ? " : oui" : " : non"}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default TournamentSummary;
