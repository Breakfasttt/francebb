"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageHeader from "@/common/components/PageHeader/PageHeader";
import toast from 'react-hot-toast';
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
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
  Info,
  HelpCircle,
  Edit
} from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import Modal from "@/common/components/Modal/Modal";
import { isModerator, isAdmin } from "@/lib/roles";
import { 
  getRanking, 
  getHallOfFame, 
  getRankingYears, 
  archiveYear,
  deleteArchive,
  RankingFilter 
} from "./actions";
import "./page.css";

export default function ClassementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<RankingFilter>("ROLLING");
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<any[]>([]);
  const [hof, setHof] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<any[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteConfirmLevel2Open, setIsDeleteConfirmLevel2Open] = useState(false);

  const user = session?.user as any;
  const isMod = isModerator(user?.role);
  const isAdminUser = isAdmin(user?.role);

  const currentYearData = availableYears.find(y => `CDF_${y.year}` === filter);
  const isSelectedYearArchived = currentYearData?.isArchived || false;

  useEffect(() => {
    async function loadYears() {
      const years = await getRankingYears();
      setAvailableYears(years);
      // Si une année est dispo et qu'on est au chargement initial, on peut choisir la plus récente
      if (years.length > 0 && filter === "ROLLING") {
        setFilter(`CDF_${years[0].year}`);
      }
    }
    loadYears();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (filter === "HOF") {
          const data = await getHallOfFame();
          setHof(data);
        } else {
          const data = await getRanking(filter);
          setRanking(data);
        }
      } catch (error) {
        console.error("Error fetching ranking:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filter]);

  async function handleArchive() {
    if (!currentYearData) return;
    const res = await archiveYear(currentYearData.year);
    if (res.success) {
      toast.success("Classement archivé avec succès !");
      // Recharger les années
      const years = await getRankingYears();
      setAvailableYears(years);
    } else {
      toast.error(res.error || "Une erreur est survenue");
    }
  }

  async function handleDeleteArchive() {
    if (!currentYearData) return;
    const res = await deleteArchive(currentYearData.year);
    if (res.success) {
      toast.success("Archive supprimée.");
      const years = await getRankingYears();
      setAvailableYears(years);
    } else {
      toast.error(res.error || "Une erreur est survenue");
    }
  }


  const years = [2026, 2025, 2024, 2023];

  return (
    <main className="container classement-page">
      <PageHeader 
        title="Championnat de France" 
        subtitle="Le Panthéon des meilleurs coachs et de la communauté Blood Bowl France"
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
              <option key={y.year} value={`CDF_${y.year}`}>
                {y.isArchived ? "[Archive] " : "🏆 "} Championnat de France {y.year}
              </option>
            ))}
            <option value="ROLLING">🔄 Classement Glissant (12 mois)</option>
            <option value="ROSTER">🏹 Meilleur Coach par Roster</option>
            <option value="HOF">🏛️ Hall of Fame (Palmarès HISTORIQUE)</option>
          </select>

          {isMod && filter.startsWith("CDF_") && !isSelectedYearArchived && (
            <button className="admin-action-btn archive-btn" onClick={() => setIsArchiveConfirmOpen(true)}>
              <Shield size={16} /> Archiver
            </button>
          )}

          {isMod && filter.startsWith("CDF_") && isSelectedYearArchived && (
            <div className="admin-actions-group">
              <button 
                className="admin-action-btn edit-archive-btn" 
                onClick={() => router.push(`/classement/edit-archive?year=${currentYearData?.year}`)}
              >
                Modifier l'archive
              </button>
              {isAdminUser && (
                <button className="admin-action-btn delete-archive-btn danger" onClick={() => setIsDeleteConfirmOpen(true)}>
                  Supprimer
                </button>
              )}
            </div>
          )}

          {isMod && (
            <button 
              className="admin-action-btn manual-archive-btn outline" 
              onClick={() => router.push('/classement/edit-archive')}
              title="Ajouter une archive manuellement"
            >
              + Manuel
            </button>
          )}
        </div>

        <button 
          className="cdf-help-trigger" 
          onClick={() => setIsHelpOpen(true)}
        >
          <HelpCircle size={16} />
          <span>Comment sont calculés les points ?</span>
        </button>
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
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Calcul des Points CDF"
      >
        <div className="cdf-help-content">
          <p>Le <strong>Championnat de France</strong> utilise une formule pondérée pour valoriser la performance et l&apos;ampleur des tournois :</p>
          
          <ul className="help-rules-list">
            <li><strong>Sélection des scores :</strong> Seuls vos 4 meilleurs résultats sur la période (12 mois glissants ou année civile) sont cumulés pour votre score total.</li>
            <li><strong>La Formule :</strong> <code>Score = R * (Nc - Pl) / (Nc + Pl - 2)</code>
              <br/><small>Nc = Nb participants, Pl = Votre place, R = Valeur de référence du tournoi.</small>
            </li>
            <li><strong>Poids du tournoi (R) :</strong> Le score maximum (R) dépend du type de tournoi (100 en individuel), boosté par le nombre de rondes et de participants.</li>
            <li><strong>Équité :</strong> Le vainqueur d&apos;un tournoi reçoit toujours le score R maximum calculé pour cet événement.</li>
          </ul>

          <div className="help-roster-note">
            <Info size={14} />
            <span>Pour le classement par Roster, seuls les 2 meilleurs scores avec la même race sont retenus.</span>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={isArchiveConfirmOpen}
        onClose={() => setIsArchiveConfirmOpen(false)}
        onConfirm={async () => handleArchive()}
        title="Confirmer l'archivage"
        message={`Voulez-vous figer le classement pour l'année ${currentYearData?.year} ? Un instantanné sera pris et affiché à la place du calcul dynamique.`}
      />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={async () => {
          setIsDeleteConfirmOpen(false);
          setIsDeleteConfirmLevel2Open(true);
        }}
        title="Supprimer l'archive (1/2)"
        message="Êtes-vous sûr de vouloir supprimer cette archive ? Les données seront à nouveau calculées en temps réel."
        confirmLabel="Continuer"
        isDanger
      />

      <ConfirmModal
        isOpen={isDeleteConfirmLevel2Open}
        onClose={() => setIsDeleteConfirmLevel2Open(false)}
        onConfirm={async () => {
          setIsDeleteConfirmLevel2Open(false);
          await handleDeleteArchive();
        }}
        title="CONFIRMATION FINALE (2/2)"
        message="CETTE ACTION EST IRRÉVERSIBLE. Vous confirmez la suppression définitive de l'instantané ?"
        confirmLabel="SUPPRIMER DÉFINITIVEMENT"
        isDanger
      />
    </main>
  );
}
