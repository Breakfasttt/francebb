"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { 
  Trophy, 
  Users, 
  History, 
  Shield, 
  Calendar, 
  ChevronRight, 
  Medal, 
  Award,
  Loader2,
  TrendingUp,
  Info
} from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { getRanking, getHallOfFame, getRankingYears, RankingFilter } from "./actions";
import "./page.css";

export default function ClassementPage() {
  const [filter, setFilter] = useState<RankingFilter>("ROLLING");
  const [showTeams, setShowTeams] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<any[]>([]);
  const [hof, setHof] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    async function loadYears() {
      const years = await getRankingYears();
      setAvailableYears(years);
      // Si une année est dispo et qu'on est au chargement initial, on peut choisir la plus récente
      if (years.length > 0 && filter === "ROLLING") {
        setFilter(`CDF_${years[0]}`);
      }
    }
    loadYears();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (filter === "HOF") {
          const data = await getHallOfFame(showTeams);
          setHof(data);
        } else {
          const data = await getRanking(filter, showTeams);
          setRanking(data);
        }
      } catch (error) {
        console.error("Error fetching ranking:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filter, showTeams]);


  const years = [2026, 2025, 2024, 2023];

  return (
    <main className="container classement-page">
      <PageHeader 
        title="Classement National" 
        subtitle="Le Panthéon des meilleurs coachs du Championnat de France"
        backHref="/" 
      />

      <div className="ranking-filters-bar">
        <div className="filter-controls">
          <select 
            className="ranking-select" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as RankingFilter)}
          >
            {availableYears.map(y => (
              <option key={y} value={`CDF_${y}`}>🏆 Championnat de France {y}</option>
            ))}
            <option value="ROLLING">🔄 Classement Glissant (12 mois)</option>
            <option value="ROSTER">🏹 Meilleur Coach par Roster</option>
            <option value="HOF">🏛️ Hall of Fame (Palmarès HISTORIQUE)</option>
          </select>

          <div 
            className={`team-toggle-wrapper ${showTeams ? 'active' : ''}`}
            onClick={() => setShowTeams(!showTeams)}
          >
              <Users size={20} />
              <span>Classement Équipes</span>
            <div className="toggle-switch"></div>
          </div>
        </div>

        <div className="ranking-info-badge" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={14} />
          {filter === "ROSTER" ? "Top 2 résultats" : "Top 4 résultats retenus"}
        </div>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Récupération des tablettes sacrées...</p>
        </div>
      ) : filter === "HOF" ? (
        <div className="hof-grid">
          {hof.map((h, i) => (
            <PremiumCard key={i} className="hof-card">
              <div className="hof-header">
                <div className="hof-year">{h.year}</div>
                <Trophy size={24} color="var(--accent)" />
              </div>
              
              <div className="podium-list">
                {h.podium.map((p: any) => (
                  <div key={p.rank} className={`podium-item rank-${p.rank}`}>
                    <div className="podium-rank">
                      {p.rank === 1 ? <Medal size={20} color="#FFD700" /> : 
                       p.rank === 2 ? <Medal size={20} color="#C0C0C0" /> : 
                       <Medal size={20} color="#CD7F32" />}
                    </div>
                    <div className="podium-info">
                      <div className="podium-name">{p.name}</div>
                      <div className="podium-points">{p.totalPoints} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumCard>
          ))}
        </div>
      ) : ranking.length === 0 ? (
        <div className="no-results">
          <History size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3>Aucun résultat enregistré pour cette période.</h3>
          <p>Les tournois terminés et validés par les commissaires apparaîtront ici.</p>
        </div>
      ) : (
        <div className="ranking-cards-grid">
          {ranking.map((res, idx) => (
            <PremiumCard key={idx} className={`ranking-item-card rank-${idx + 1}`}>
              <div className="card-rank-badge">{idx + 1}</div>
              
              <div className="card-main-info">
                <div className="coach-identity">
                  <div className="coach-display">
                    <span className="coach-name">{res.name}</span>
                    {res.nafNumber && <span className="naf-tag">NAF #{res.nafNumber}</span>}
                  </div>
                  <div className="user-link-row">
                    {res.userId ? (
                      <Link href={`/spy/${res.userId}`} className="spy-link">
                        <Users size={14} /> Voir le profil
                      </Link>
                    ) : (
                      <span className="no-user-tag">Non associé</span>
                    )}
                    {filter === "ROSTER" && <span className="roster-badge">{res.roster}</span>}
                  </div>
                </div>

                <div className="score-summary">
                  <div className="score-value">{res.totalPoints}</div>
                  <div className="score-label">Points CDF</div>
                  <div className="tournaments-count">{res.count} tournois joués</div>
                </div>
              </div>

              {res.bestResults && (
                <div className="tournament-details-grid">
                  {res.bestResults.map((t: any, tIdx: number) => (
                    <div key={tIdx} className="mini-tournament-card">
                      <div className="mini-t-header">
                        <span className="mini-t-points">{t.points} pts</span>
                        <span className="mini-t-rank">#{t.rank}/{t.totalParticipants}</span>
                      </div>
                      <div className="mini-t-name">
                        {t.topicId ? (
                          <Link href={`/forum/topic/${t.topicId}`} className="t-link">
                            {t.tournamentName}
                          </Link>
                        ) : (
                          t.tournamentName
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Remplissage si moins de 4 résultats pour garder l'alignement */}
                  {Array.from({ length: Math.max(0, 4 - (res.bestResults?.length || 0)) }).map((_, i) => (
                    <div key={`empty-${i}`} className="mini-tournament-card empty">
                      <div className="mini-t-header">
                        <span className="mini-t-points">-</span>
                      </div>
                      <div className="mini-t-name">N/A</div>
                    </div>
                  ))}
                </div>
              )}
            </PremiumCard>
          ))}
        </div>
      )}

      <footer style={{ marginTop: '4rem', textAlign: 'center', opacity: 0.6, fontSize: '0.9rem' }}>
        <p>Le Championnat de France est régi par les règles de la Team France Blood Bowl.</p>
      </footer>
    </main>
  );
}
