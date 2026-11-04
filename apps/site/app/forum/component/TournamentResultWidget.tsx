"use client";

/**
 * Bloc « Résultats du tournoi » du sujet d'un tournoi terminé (refonte, carte 089, ADR 0006). Replié par défaut ; une
 * fois déplié, il montre le classement et, si des rondes ont été saisies, les matchs ronde par ronde (onglets
 * « Classement » et « Matchs »). Sans résultat publié, il n'apparaît que pour qui peut les publier, avec le lien
 * « Publier les résultats ». Le classement est en lignes : sur téléphone, le roster passe sous le nom du coach.
 * Pour un tournoi de la Coupe de France, un bandeau sous le titre dit si les résultats sont validés par la modération
 * ou en attente, avec le bouton de validation pour les modérateurs (CdfValidationPanel, carte 162).
 */
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronLeft, ChevronRight, Edit2, Swords, Trophy } from 'lucide-react';
import { Avatar, Button, Card, Tabs, TabsContent, TabsList, TabsTrigger, cn } from "@bbfrance/ui";
import CdfValidationPanel from "@/app/forum/component/CdfValidationPanel";

interface TournamentMatch {
  id: string;
  tableNumber: number | null;
  coach1Name: string;
  coach2Name: string;
  coach1TD: number;
  coach2TD: number;
  coach1Casualties: number;
  coach2Casualties: number;
}

interface TournamentRound {
  roundNumber: number;
  matches: TournamentMatch[];
}

interface TournamentResult {
  id: string;
  rank: number | null;
  coachName: string;
  roster: string | null;
  wins: number;
  draws: number;
  losses: number;
  casualties: number;
  nafNumber: string | null;
  points: number;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
}

interface TournamentResultWidgetProps {
  tournamentId: string;
  results: TournamentResult[];
  rounds: TournamentRound[];
  canEdit: boolean;
  /**
   * Tournoi de la Coupe de France seulement (carte 162) : date de validation des résultats par la modération (vide
   * tant qu'ils sont en attente) et droit de les valider (modérateurs et administrateurs).
   */
  cdf?: { validatedAt: Date | string | null; canValidate: boolean };
}

/**
 * Classement : une ligne par coach (rang, coach, numéro NAF, roster, V/N/D, sorties, points), partagé avec
 * /results/view. Sur ordinateur, une colonne par information. Sur téléphone, quatre colonnes : le roster passe sous
 * le nom du coach et les sorties sous V/N/D (chaque information n'est écrite qu'une fois dans la page).
 */
export function ResultsRanking({ results }: { results: TournamentResult[] }) {
  const columns = "grid grid-cols-[2rem_minmax(0,1fr)_4.25rem_3.25rem] gap-x-2 lg:grid-cols-[2.5rem_minmax(0,1.6fr)_6rem_minmax(0,1fr)_5rem_4rem_4.5rem]";
  return (
    <div className="overflow-hidden rounded-bb-md border border-bb-border">
      <div aria-hidden="true" className={cn(columns, "bg-bb-surface-2 px-3 py-2 text-xs font-bold tracking-wide text-bb-text-muted uppercase")}>
        <span>#</span>
        <span>Coach</span>
        <span className="hidden lg:block">NAF</span>
        <span className="hidden lg:block">Roster</span>
        <span className="text-center">V/N/D</span>
        <span className="hidden text-center lg:block">CAS</span>
        <span className="text-right">Points</span>
      </div>
      <ol className="m-0 list-none p-0">
        {results.map((res) => (
          <li key={res.id} className={cn(columns, "items-center gap-y-0.5 border-t border-bb-border px-3 py-2 text-[0.95rem]")}>
            <span className={cn("font-bold max-lg:row-span-2 max-lg:self-start max-lg:pt-1", res.rank === 1 ? "text-bb-rank" : "text-bb-text-muted")}>{res.rank || '-'}</span>
            <span className="min-w-0">
              {res.user ? (
                // Fiche d'un autre membre : /spy/<id> (la page /profile/<id> n'existe pas, carte 134)
                <Link href={`/spy/${res.user.id}`} className="inline-flex min-h-11 min-w-0 items-center gap-2 font-semibold text-bb-text hover:underline lg:min-h-0">
                  <Avatar name={res.coachName} src={res.user.image} size={28} className="max-lg:hidden" />
                  <span className="min-w-0 break-words">{res.coachName}</span>
                </Link>
              ) : (
                <span className="flex min-w-0 items-center gap-2 font-semibold text-bb-text">
                  <Avatar name={res.coachName} size={28} className="max-lg:hidden" />
                  <span className="min-w-0 break-words">{res.coachName}</span>
                </span>
              )}
            </span>
            <span className="hidden text-sm text-bb-text-muted lg:block">{res.nafNumber || '-'}</span>
            <span className="min-w-0 text-sm break-words text-bb-text-muted max-lg:col-start-2 max-lg:row-start-2 lg:truncate lg:text-[0.95rem]">{res.roster || '-'}</span>
            <span className="text-center tabular-nums max-lg:col-start-3 max-lg:row-start-1">{res.wins}/{res.draws}/{res.losses}</span>
            <span className="text-center text-sm text-bb-text-muted tabular-nums max-lg:col-start-3 max-lg:row-start-2 lg:text-[0.95rem] lg:text-bb-text">
              {res.casualties}<span className="lg:hidden"> CAS</span>
            </span>
            <span className="text-right font-bold text-bb-accent-text tabular-nums max-lg:col-start-4 max-lg:row-span-2 max-lg:row-start-1">{res.points}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function TournamentResultWidget({ tournamentId, results, rounds, canEdit, cdf }: TournamentResultWidgetProps) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasResults = results && results.length > 0;
  const hasRounds = rounds && rounds.length > 0;

  if (!hasResults && !canEdit) return null;

  const sortedResults = hasResults ? [...results].sort((a, b) => (a.rank || 999) - (b.rank || 999)) : [];
  const currentRound = (rounds && rounds.length > 0) ? rounds[currentRoundIndex] : null;
  const resultsHref = `/forum/tournament/${tournamentId}/results`;

  const handlePrevRound = () => setCurrentRoundIndex((prev: number) => (prev === 0 ? rounds.length - 1 : prev - 1));
  const handleNextRound = () => setCurrentRoundIndex((prev: number) => (prev === rounds.length - 1 ? 0 : prev + 1));

  const ranking = <ResultsRanking results={sortedResults} />;

  const matches = currentRound && (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="secondary" size="tap-icon" onClick={handlePrevRound} disabled={rounds.length <= 1} aria-label="Ronde précédente">
          <ChevronLeft size={18} aria-hidden="true" />
        </Button>
        <p className="m-0 text-center">
          <span className="block font-bold text-bb-text">Ronde {currentRound.roundNumber}</span>
          <span className="text-sm text-bb-text-muted">{currentRound.matches.length} matchs</span>
        </p>
        <Button type="button" variant="secondary" size="tap-icon" onClick={handleNextRound} disabled={rounds.length <= 1} aria-label="Ronde suivante">
          <ChevronRight size={18} aria-hidden="true" />
        </Button>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {currentRound.matches.map((match: TournamentMatch) => {
          const first = match.coach1TD > match.coach2TD;
          const second = match.coach2TD > match.coach1TD;
          return (
            <li key={match.id} className="grid grid-cols-[2rem_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-bb-md border border-bb-border px-2 py-2 text-sm">
              <span className="text-xs font-bold text-bb-text-muted">T{match.tableNumber || '-'}</span>
              <span className="min-w-0 text-right">
                <span className={cn("block break-words", first ? "font-bold text-bb-text" : "text-bb-text-muted")}>
                  {first && <Trophy size={13} aria-label="Vainqueur" className="mr-1 inline text-bb-rank" />}
                  {match.coach1Name}
                </span>
                <span className="text-xs text-bb-text-muted">{match.coach1Casualties} CAS</span>
              </span>
              <span className="rounded-bb-sm bg-bb-surface-2 px-2 py-1 font-bold tabular-nums text-bb-text">
                {match.coach1TD} - {match.coach2TD}
              </span>
              <span className="min-w-0">
                <span className={cn("block break-words", second ? "font-bold text-bb-text" : "text-bb-text-muted")}>
                  {match.coach2Name}
                  {second && <Trophy size={13} aria-label="Vainqueur" className="ml-1 inline text-bb-rank" />}
                </span>
                <span className="text-xs text-bb-text-muted">{match.coach2Casualties} CAS</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 p-3 lg:p-4">
        <Button
          type="button"
          variant="quiet"
          className="min-h-11 min-w-0 flex-1 flex-wrap justify-start gap-x-2 gap-y-0 rounded-bb-md px-1 text-left text-base whitespace-normal text-bb-text hover:bg-transparent"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Trophy size={18} aria-hidden="true" className="text-bb-rank" />
          <span>Résultats du tournoi</span>
          <span className="text-sm font-normal text-bb-text-muted">{hasResults ? `(${results.length} participants)` : "(en attente)"}</span>
          <ChevronDown size={18} aria-hidden="true" className={cn("ml-auto shrink-0 text-bb-text-muted transition-transform", isExpanded && "rotate-180")} />
        </Button>
        {canEdit && hasResults && (
          <Button asChild variant="secondary" size="tap" className="shrink-0 px-3 max-lg:w-11 max-lg:px-0">
            <Link href={resultsHref} title="Modifier les résultats">
              <Edit2 size={16} aria-hidden="true" /> <span className="max-lg:sr-only">Modifier</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Tournoi CDF : où en est la validation des résultats, visible sans déplier le bloc (carte 162) */}
      {cdf && hasResults && (
        <div className="px-3 pb-3 lg:px-4 lg:pb-4">
          <CdfValidationPanel tournamentId={tournamentId} validatedAt={cdf.validatedAt} canValidate={cdf.canValidate} />
        </div>
      )}

      {isExpanded && (
        <div className="border-t border-bb-border p-3 lg:p-4">
          {!hasResults ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <Trophy size={36} aria-hidden="true" className="text-bb-text-muted" />
              <p className="m-0 text-[0.95rem] text-bb-text-muted">Le tournoi est terminé ! Les résultats n&apos;ont pas encore été publiés.</p>
              {canEdit && (
                <Button asChild variant="primary" size="tap">
                  <Link href={resultsHref}>
                    <Edit2 size={16} aria-hidden="true" /> Publier les résultats
                  </Link>
                </Button>
              )}
            </div>
          ) : hasRounds ? (
            <Tabs defaultValue="ranking" className="flex flex-col gap-3">
              <TabsList aria-label="Résultats">
                <TabsTrigger value="ranking"><Trophy size={16} aria-hidden="true" /> Classement</TabsTrigger>
                <TabsTrigger value="matches"><Swords size={16} aria-hidden="true" /> Matchs</TabsTrigger>
              </TabsList>
              <TabsContent value="ranking">{ranking}</TabsContent>
              <TabsContent value="matches">{matches}</TabsContent>
            </Tabs>
          ) : (
            ranking
          )}
        </div>
      )}
    </Card>
  );
}
