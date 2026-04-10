"use client";

import React, { useState } from 'react';
import { Trophy, ChevronLeft, ChevronRight, Edit2, Swords, User as UserIcon, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import './TournamentResultWidget.css';
import './TournamentResultWidget-mobile.css';


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
}

export default function TournamentResultWidget({ tournamentId, results, rounds, canEdit }: TournamentResultWidgetProps) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'ranking' | 'matches'>('ranking');

  const hasResults = results && results.length > 0;
  const hasRounds = rounds && rounds.length > 0;
  
  if (!hasResults && !canEdit) return null;

  const sortedResults = hasResults ? [...results].sort((a, b) => (a.rank || 999) - (b.rank || 999)) : [];
  const currentRound = (rounds && rounds.length > 0) ? rounds[currentRoundIndex] : null;

  const handlePrevRound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentRoundIndex((prev: number) => (prev === 0 ? rounds.length - 1 : prev - 1));
  };

  const handleNextRound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentRoundIndex((prev: number) => (prev === rounds.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`tournament-result-widget ${isExpanded ? 'active' : ''}`}>
      <div className="widget-header" onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
        <div className="widget-title">
          <Trophy size={18} color="var(--accent)" />
          <span>Résultats du Tournoi</span>
          {hasResults && <span className="participant-count">({results.length} participants)</span>}
          {!hasResults && <span className="participant-count" style={{ opacity: 0.5 }}>(En attente)</span>}
        </div>
        <div className="header-right">
          {canEdit && hasResults && (
            <Link href={`/forum/tournament/${tournamentId}/results`} className="edit-results-btn" onClick={(e) => e.stopPropagation()}>
              <Edit2 size={14} /> Modifier
            </Link>
          )}
          <button className="toggle-expand-btn">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="widget-content-expandable">
          {!hasResults ? (
            <div className="empty-state-inner">
               <Trophy size={40} className="empty-icon-small" />
               <p className="empty-desc-small">Le tournoi est terminé ! Les résultats n&apos;ont pas encore été publiés.</p>
               {canEdit && (
                 <Link href={`/forum/tournament/${tournamentId}/results`} className="publish-results-btn-small">
                   <Edit2 size={14} /> Publier les résultats
                 </Link>
               )}
            </div>
          ) : (
            <>
              {hasRounds && (
                <div className="widget-view-toggle">
                  <button className={`toggle-btn ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}>
                    <Trophy size={14} /> Classement
                  </button>
                  <button className={`toggle-btn ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>
                    <Swords size={14} /> Matchs
                  </button>
                </div>
              )}

              {activeTab === 'ranking' ? (
                <div className="results-table-container">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th className="rank-th">#</th>
                        <th className="naf-th">NAF #</th>
                        <th>Coach</th>
                        <th className="roster-th">Roster</th>
                        <th className="stats-cell-th">V/N/D</th>
                        <th className="stats-cell-th">CAS</th>
                        <th className="points-cell-th">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedResults.map((res: any) => (
                        <tr key={res.id}>
                          <td className="rank-cell">{res.rank || '-'}</td>
                          <td className="naf-cell">{res.nafNumber || '-'}</td>
                          <td className="coach-cell-wrapper">
                            <div className="coach-cell">
                              {res.user ? (
                                <Link href={`/profile/${res.user.id}`} className="coach-link">
                                  <img src={res.user.image || "/default-avatar.png"} alt="" className="coach-avatar" />
                                  <span className="coach-name">{res.coachName}</span>
                                </Link>
                              ) : (
                                <div className="coach-no-user">
                                  <div className="coach-avatar-placeholder">
                                    <UserIcon size={12} />
                                  </div>
                                  <span className="coach-name">{res.coachName}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="roster-cell">{res.roster || '-'}</td>
                          <td className="stats-cell">{res.wins}/{res.draws}/{res.losses}</td>
                          <td className="stats-cell">{res.casualties}</td>
                          <td className="points-cell">{res.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="matches-view-container">
                  {currentRound && (
                    <div className="matches-toggle-inner">
                      <div className="round-navigation" style={{ marginTop: '0' }}>
                        <button className="round-nav-btn" onClick={handlePrevRound} disabled={rounds.length <= 1}>
                          <ChevronLeft size={18} />
                        </button>
                        <div className="round-info">
                          <span className="current-round-label">Ronde {currentRound.roundNumber}</span>
                          <span className="round-matches-count">{currentRound.matches.length} matchs</span>
                        </div>
                        <button className="round-nav-btn" onClick={handleNextRound} disabled={rounds.length <= 1}>
                          <ChevronRight size={18} />
                        </button>
                      </div>

                      <div className="matches-linear-list">
                        {currentRound.matches.map((match: TournamentMatch) => (
                          <div key={match.id} className="match-linear-row">
                            <div className="match-table-num">T{match.tableNumber || '-'}</div>
                            <div className="match-participant left">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                {match.coach1TD > match.coach2TD && <Trophy size={14} color="var(--accent)" />}
                                <span className="participant-name">{match.coach1Name}</span>
                              </div>
                              <span className="participant-cas">{match.coach1Casualties} CAS</span>
                            </div>
                            <div className="match-score-pill">
                              <span className={`score-val ${match.coach1TD > match.coach2TD ? 'bold' : ''}`}>{match.coach1TD}</span>
                              <span className="score-sep">-</span>
                              <span className={`score-val ${match.coach2TD > match.coach1TD ? 'bold' : ''}`}>{match.coach2TD}</span>
                            </div>
                            <div className="match-participant right">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="participant-name">{match.coach2Name}</span>
                                {match.coach2TD > match.coach1TD && <Trophy size={14} color="var(--accent)" />}
                              </div>
                              <span className="participant-cas">{match.coach2Casualties} CAS</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
