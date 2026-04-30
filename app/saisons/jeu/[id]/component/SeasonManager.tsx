"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { changeSeasonStatus, registerTeamToSeason, updateMatchStatus } from "../../../actions";
import { Play, CheckCircle, Users, Swords, FileText, Check, X, Trophy } from "lucide-react";
import Link from "next/link";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import DangerButton from "@/common/components/Button/DangerButton";
import ClassicSelect from "@/common/components/Form/ClassicSelect";

export default function SeasonManager({ season, isAdmin, userAvailableTeams, standings, currentUserId }: { season: any, isAdmin: boolean, userAvailableTeams: any[], standings?: any[], currentUserId?: string }) {
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Passer la saison au statut ${newStatus} ?`)) return;
    await changeSeasonStatus(season.id, newStatus);
    router.refresh();
  };

  const handleMatchStatus = async (matchId: string, newStatus: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir ${newStatus === 'VALIDATED' ? 'valider' : 'contester'} ce match ?`)) return;
    try {
      await updateMatchStatus(matchId, newStatus);
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRegister = async () => {
    if (!selectedTeam) return;
    try {
      setIsRegistering(true);
      await registerTeamToSeason(season.id, selectedTeam);
      alert("Équipe inscrite avec succès !");
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* SECTION ADMIN */}
      {isAdmin && (
        <PremiumCard>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-primary">Panneau Commissaire</h3>
            <div className="flex gap-2">
              {season.status === "DRAFT" && (
                <CTAButton onClick={() => handleStatusChange("REGISTRATION")}>
                  Ouvrir les Inscriptions
                </CTAButton>
              )}
              {season.status === "REGISTRATION" && (
                <CTAButton onClick={() => handleStatusChange("COMPETITION")} icon={<Play />}>
                  Lancer la Compétition
                </CTAButton>
              )}
              {season.status === "COMPETITION" && (
                <CTAButton onClick={() => handleStatusChange("FINISHED")}>
                  Clôturer la Saison
                </CTAButton>
              )}
            </div>
          </div>
        </PremiumCard>
      )}

      {/* SECTION COMPETITION (CLASSEMENT & MATCHS) */}
      {season.status === "COMPETITION" && standings && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy className="text-yellow-400" /> Classement</h2>
            <Link href={`/saisons/jeu/${season.id}/report`}>
              <CTAButton icon={<Swords />}>
                Déclarer un Match
              </CTAButton>
            </Link>
          </div>

          <PremiumCard>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-muted text-sm">
                    <th className="p-2">#</th>
                    <th className="p-2">Équipe</th>
                    <th className="p-2 text-center">Pts</th>
                    <th className="p-2 text-center">J</th>
                    <th className="p-2 text-center">V</th>
                    <th className="p-2 text-center">N</th>
                    <th className="p-2 text-center">D</th>
                    <th className="p-2 text-center">TD+</th>
                    <th className="p-2 text-center">TD-</th>
                    <th className="p-2 text-center">Sorties+</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, idx) => (
                    <tr key={s.team.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="p-2 font-bold">{idx + 1}</td>
                      <td className="p-2">
                        <Link href={`/equipes/${s.team.id}`} className="hover:text-primary font-bold transition">
                          {s.team.name}
                        </Link>
                      </td>
                      <td className="p-2 text-center font-bold text-primary">{s.pts}</td>
                      <td className="p-2 text-center">{s.played}</td>
                      <td className="p-2 text-center">{s.w}</td>
                      <td className="p-2 text-center">{s.d}</td>
                      <td className="p-2 text-center">{s.l}</td>
                      <td className="p-2 text-center">{s.tdFor}</td>
                      <td className="p-2 text-center">{s.tdAgainst}</td>
                      <td className="p-2 text-center">{s.casFor}</td>
                    </tr>
                  ))}
                  {standings.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-4 text-center text-muted">Aucune équipe classée.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </PremiumCard>

          {/* HISTORIQUE DES MATCHS */}
          <PremiumCard>
            <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
              <FileText className="text-primary" /> Historique des Matchs
            </h3>
            <div className="flex flex-col gap-2">
              {season.matches && season.matches.length > 0 ? (
                season.matches.map((m: any) => {
                  const teamA = season.teams.find((t:any) => t.id === m.teamAId);
                  const teamB = season.teams.find((t:any) => t.id === m.teamBId);
                  const tA = teamA?.name || "Inconnu";
                  const tB = teamB?.name || "Inconnu";
                  
                  // Peut valider si admin OU si le user est le coach d'une des deux équipes
                  const canValidate = isAdmin || (currentUserId && (teamA?.userId === currentUserId || teamB?.userId === currentUserId));

                  return (
                    <div key={m.id} className="p-3 bg-black/20 rounded border border-white/5 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="flex-1 text-right font-bold">{tA}</div>
                        <div className="px-4 text-center">
                          <span className="bg-black/50 px-3 py-1 rounded text-xl font-black">
                            {m.scoreA} - {m.scoreB}
                          </span>
                          <div className={`text-xs mt-1 font-bold ${m.status === 'VALIDATED' ? 'text-green-500' : m.status === 'DISPUTED' ? 'text-red-500' : 'text-yellow-500'}`}>
                            {m.status}
                          </div>
                        </div>
                        <div className="flex-1 text-left font-bold">{tB}</div>
                      </div>
                      
                      {m.status === "PENDING" && canValidate && (
                        <div className="flex justify-center gap-2 mt-2 pt-2 border-t border-white/10">
                          <CTAButton onClick={() => handleMatchStatus(m.id, "VALIDATED")} size="xs" icon={<Check />}>
                            Valider
                          </CTAButton>
                          <DangerButton onClick={() => handleMatchStatus(m.id, "DISPUTED")} size="xs" icon={<X />}>
                            Contester
                          </DangerButton>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-muted">Aucun match joué.</p>
              )}
            </div>
          </PremiumCard>
        </>
      )}

      {/* SECTION INSCRIPTION */}
      {season.status === "REGISTRATION" && (
        <PremiumCard>
          <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
            <CheckCircle className="text-green-500" /> Inscriptions Ouvertes
          </h3>
          
          {userAvailableTeams.length > 0 ? (
            <div className="flex gap-4 items-end w-full">
              <ClassicSelect 
                label="Sélectionnez une de vos équipes libres :"
                value={selectedTeam} 
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="flex-1"
              >
                <option value="" disabled>-- Choisir une équipe --</option>
                {userAvailableTeams.map(t => (
                  <option key={t.id} value={t.id}>{t.name} (TV: {t.currentTV})</option>
                ))}
              </ClassicSelect>
              <CTAButton 
                onClick={handleRegister} 
                disabled={!selectedTeam || isRegistering}
                isLoading={isRegistering}
              >
                S'inscrire !
              </CTAButton>
            </div>
          ) : (
            <p className="text-muted">Vous n'avez aucune équipe disponible pour cette ligue. Allez dans "Mes Équipes" pour en créer une !</p>
          )}
        </PremiumCard>
      )}

      {/* EQUIPES INSCRITES */}
      <PremiumCard>
        <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
          <Users className="text-primary" /> Équipes Engagées ({season.teams.length})
        </h3>
        {season.teams.length === 0 ? (
          <p className="text-muted">Aucune équipe inscrite pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {season.teams.map((t: any) => (
              <Link href={`/equipes/${t.id}`} key={t.id} className="no-underline">
                <div className="p-3 bg-black/20 border border-white/5 rounded hover:bg-white/5 transition flex justify-between">
                  <div>
                    <strong className="block">{t.name}</strong>
                    <span className="text-sm text-muted">Coach: {t.user.pseudo || t.user.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold">TV {t.currentTV}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </PremiumCard>

    </div>
  );
}
