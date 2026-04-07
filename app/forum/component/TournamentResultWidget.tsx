"use client";

import React, { useState } from 'react';
import { Trophy, ChevronLeft, ChevronRight, Edit2, Swords, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import './TournamentResultWidget.css';

interface TournamentResultWidgetProps {
  tournamentId: string;
  results: any[];
  rounds: any[];
  canEdit: boolean;
}

export default function TournamentResultWidget({ tournamentId, results, rounds, canEdit }: TournamentResultWidgetProps) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  if (!results || results.length === 0) {
    if (!canEdit) return null;
    return (
      <div className="tournament-result-widget" style={{ textAlign: 'center', padding: '2rem' }}>
        <Trophy size={48} style={{ color: 'var(--accent)', opacity: 0.2, marginBottom: '1rem' }} />
        <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Aucun résultat publié</h3>
        {canEdit && (
          <Link href={`/forum/tournament/${tournamentId}/results`} className="edit-results-btn" style={{ margin: '1rem auto' }}>
            <Edit2 size={14} /> Publier les résultats
          </Link>
        )}
      </div>
    );
  }

  const sortedResults = [...results].sort((a, b) => (a.rank || 999) - (b.rank || 999));
  const currentRound = rounds[currentRoundIndex];

  const handlePrevRound = () => {
    setCurrentRoundIndex((prev) => (prev === 0 ? rounds.length - 1 : prev - 1));
  };

  const handleNextRound = () => {
    setCurrentRoundIndex((prev) => (prev === rounds.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="tournament-result-widget">
      <div className="widget-header">
        <div className="widget-title">
          <Trophy size={18} color="var(--accent)" />
          <span>Classement Final</span>
        </div>
        {canEdit && (
          <Link href={`/forum/tournament/${tournamentId}/results`} className="edit-results-btn">
            <Edit2 size={14} /> Modifier
          </Link>
        )}
      </div>

      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Coach</th>
              <th>Roster</th>
              <th className="stats-cell">V/N/D</th>
              <th className="stats-cell">CAS</th>
              <th className="points-cell">Points</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.slice(0, 10).map((res) => (
              <tr key={res.id}>
                <td className="rank-cell">{res.rank || '-'}</td>
                <td>
                  <div className="coach-cell">
                    {res.user ? (
                      <Link href={`/profile/${res.user.id}`} className="coach-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={res.user.image || "/default-avatar.png"} alt="" className="coach-avatar" />
                        <span className="coach-name">{res.coachName}</span>
                      </Link>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="coach-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                          <UserIcon size={14} />
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
        {results.length > 10 && (
          <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
             <Link href={`/forum/tournament/${tournamentId}/results/view`} style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                Voir le classement complet ({results.length} participants)
             </Link>
          </div>
        )}
      </div>

      {rounds && rounds.length > 0 && (
        <div className="matches-toggle">
          <div className="round-navigation">
            <button className="round-nav-btn" onClick={handlePrevRound} disabled={rounds.length <= 1}>
              <ChevronLeft size={18} />
            </button>
            <span className="current-round-label">Ronde {currentRound.roundNumber}</span>
            <button className="round-nav-btn" onClick={handleNextRound} disabled={rounds.length <= 1}>
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="matches-grid">
            {currentRound.matches.map((match: any) => (
              <div key={match.id} className="match-card">
                <div className="match-header">
                  <span>Table {match.tableNumber || '-'}</span>
                  <Swords size={12} style={{ opacity: 0.5 }} />
                </div>
                <div className="match-content">
                  <div className="team-display left">
                    <span className="coach-name">{match.coach1Name}</span>
                    <span className="cas-badge">{match.coach1Casualties} CAS</span>
                  </div>
                  <div className="score-display">
                    <span className={match.coach1TD > match.coach2TD ? "winner" : ""}>{match.coach1TD}</span>
                    <span style={{ opacity: 0.3, fontSize: '0.8rem' }}>-</span>
                    <span className={match.coach2TD > match.coach1TD ? "winner" : ""}>{match.coach2TD}</span>
                  </div>
                  <div className="team-display right">
                    <span className="coach-name">{match.coach2Name}</span>
                    <span className="cas-badge">{match.coach2Casualties} CAS</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
