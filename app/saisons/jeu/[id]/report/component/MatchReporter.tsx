"use client";

import { useState } from "react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { Save, Swords, Trophy, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { submitMatchReport } from "../../../../actions";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import ClassicSelect from "@/common/components/Form/ClassicSelect";

export default function MatchReporter({ season, userTeamId, isAdmin }: { season: any, userTeamId?: string, isAdmin: boolean }) {
  const router = useRouter();

  // Si on est un joueur, l'équipe A est fixée. Sinon (admin), on choisit.
  const [teamAId, setTeamAId] = useState(userTeamId || "");
  const [teamBId, setTeamBId] = useState("");

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [casA, setCasA] = useState(0);
  const [casB, setCasB] = useState(0);
  
  const [pettyCashA, setPettyCashA] = useState(0);
  const [pettyCashB, setPettyCashB] = useState(0);
  
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats détaillées
  const [mvpA, setMvpA] = useState("");
  const [mvpB, setMvpB] = useState("");
  const [playerActions, setPlayerActions] = useState<Record<string, { td: number, cas: number }>>({});

  const teamA = season.teams.find((t: any) => t.id === teamAId);
  const teamB = season.teams.find((t: any) => t.id === teamBId);

  const updateAction = (playerId: string, type: 'td' | 'cas', val: number) => {
    setPlayerActions(prev => ({
      ...prev,
      [playerId]: {
        ...(prev[playerId] || { td: 0, cas: 0 }),
        [type]: val
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamAId || !teamBId || teamAId === teamBId) {
      alert("Veuillez sélectionner deux équipes différentes.");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitMatchReport({
        seasonId: season.id,
        teamAId,
        teamBId,
        scoreA,
        scoreB,
        casA,
        casB,
        notes,
        status: isAdmin ? "VALIDATED" : "PENDING",
        stats: {
          notes,
          mvpA,
          mvpB,
          playerActions
        }
      });
      alert("Rapport envoyé !");
      router.push(`/saisons/jeu/${season.id}`);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <PremiumCard className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* TEAM A */}
          <ClassicSelect 
            label="Équipe A (Domicile)"
            icon={<User size={16} />}
            value={teamAId}
            onChange={e => setTeamAId(e.target.value)}
            disabled={!isAdmin && !!userTeamId}
            className="flex-1"
          >
            <option value="">-- Sélectionner --</option>
            {season.teams.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name} (TV: {t.currentTV})</option>
            ))}
          </ClassicSelect>

          <div className="hidden md:flex items-center justify-center font-bold text-xl px-4 mt-8 text-muted">VS</div>

          {/* TEAM B */}
          <ClassicSelect 
            label="Équipe B (Extérieur)"
            icon={<User size={16} />}
            value={teamBId}
            onChange={e => setTeamBId(e.target.value)}
            className="flex-1"
          >
            <option value="">-- Sélectionner --</option>
            {season.teams.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name} (TV: {t.currentTV})</option>
            ))}
          </ClassicSelect>
        </div>

        <div className="bg-black/30 p-6 rounded-lg border border-primary/20 flex justify-around items-center text-center">
          <div>
            <label className="block text-sm text-muted mb-1">TD {teamA?.name}</label>
            <input type="number" min="0" value={scoreA} onChange={e => setScoreA(parseInt(e.target.value)||0)} className="w-20 p-2 bg-black/40 border border-white/10 rounded text-center text-3xl font-black text-primary"/>
            <div className="mt-2">
              <label className="block text-xs text-muted">Sorties</label>
              <input type="number" min="0" value={casA} onChange={e => setCasA(parseInt(e.target.value)||0)} className="w-16 p-1 bg-black/20 border border-white/10 rounded text-center"/>
            </div>
          </div>

          <div className="text-4xl font-black opacity-20">VS</div>

          <div>
            <label className="block text-sm text-muted mb-1">TD {teamB?.name}</label>
            <input type="number" min="0" value={scoreB} onChange={e => setScoreB(parseInt(e.target.value)||0)} className="w-20 p-2 bg-black/40 border border-white/10 rounded text-center text-3xl font-black text-primary"/>
            <div className="mt-2">
              <label className="block text-xs text-muted">Sorties</label>
              <input type="number" min="0" value={casB} onChange={e => setCasB(parseInt(e.target.value)||0)} className="w-16 p-1 bg-black/20 border border-white/10 rounded text-center"/>
            </div>
          </div>
        </div>

        {teamA && teamB && (
          <div className="bg-black/30 p-4 rounded text-center text-sm">
            Différence de TV : <strong>{Math.abs(teamA.currentTV - teamB.currentTV)}</strong> po
            <br/>
            {teamA.currentTV > teamB.currentTV ? `${teamB.name} gagne ${teamA.currentTV - teamB.currentTV} de Petty Cash` : 
             teamB.currentTV > teamA.currentTV ? `${teamA.name} gagne ${teamB.currentTV - teamA.currentTV} de Petty Cash` : "TV Égales."}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* JOUEURS TEAM A */}
          <div className="flex flex-col gap-4">
            <div className="bg-black/20 p-4 rounded border border-white/5">
              <h4 className="flex items-center gap-2 mb-4 text-primary"><Trophy size={16}/> Détails {teamA?.name}</h4>
              
              <ClassicSelect 
                label="MVP du Match"
                value={mvpA}
                onChange={e => setMvpA(e.target.value)}
                size="sm"
              >
                <option value="">-- Choisir MVP --</option>
                {teamA?.players.map((p: any) => (
                  <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                ))}
              </ClassicSelect>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr>
                      <th className="pb-2">Joueur</th>
                      <th className="pb-2 text-center">TD</th>
                      <th className="pb-2 text-center">CAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamA?.players.map((p: any) => (
                      <tr key={p.id} className="border-t border-white/5">
                        <td className="py-2">#{p.number} {p.name}</td>
                        <td className="py-2">
                          <input 
                            type="number" min="0" 
                            className="w-12 bg-black/40 border border-white/10 rounded text-center p-1"
                            value={playerActions[p.id]?.td || 0}
                            onChange={e => updateAction(p.id, 'td', parseInt(e.target.value)||0)}
                          />
                        </td>
                        <td className="py-2">
                          <input 
                            type="number" min="0" 
                            className="w-12 bg-black/40 border border-white/10 rounded text-center p-1"
                            value={playerActions[p.id]?.cas || 0}
                            onChange={e => updateAction(p.id, 'cas', parseInt(e.target.value)||0)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* JOUEURS TEAM B */}
          <div className="flex flex-col gap-4">
            <div className="bg-black/20 p-4 rounded border border-white/5">
              <h4 className="flex items-center gap-2 mb-4 text-primary"><Trophy size={16}/> Détails {teamB?.name}</h4>
              
              <ClassicSelect 
                label="MVP du Match"
                value={mvpB}
                onChange={e => setMvpB(e.target.value)}
                size="sm"
              >
                <option value="">-- Choisir MVP --</option>
                {teamB?.players.map((p: any) => (
                  <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                ))}
              </ClassicSelect>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr>
                      <th className="pb-2">Joueur</th>
                      <th className="pb-2 text-center">TD</th>
                      <th className="pb-2 text-center">CAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamB?.players.map((p: any) => (
                      <tr key={p.id} className="border-t border-white/5">
                        <td className="py-2">#{p.number} {p.name}</td>
                        <td className="py-2">
                          <input 
                            type="number" min="0" 
                            className="w-12 bg-black/40 border border-white/10 rounded text-center p-1"
                            value={playerActions[p.id]?.td || 0}
                            onChange={e => updateAction(p.id, 'td', parseInt(e.target.value)||0)}
                          />
                        </td>
                        <td className="py-2">
                          <input 
                            type="number" min="0" 
                            className="w-12 bg-black/40 border border-white/10 rounded text-center p-1"
                            value={playerActions[p.id]?.cas || 0}
                            onChange={e => updateAction(p.id, 'cas', parseInt(e.target.value)||0)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <label>Notes / Inducements utilisés / Événements (Blessures, MVP, etc)</label>
          <textarea 
            className="p-2 rounded bg-black/20 border border-white/10 text-white min-h-[100px]"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: MVP = #3 Bob. -1 MA sur #4..."
          />
        </div>

        <div className="flex justify-center mt-6">
          <CTAButton 
            type="submit" 
            disabled={isSubmitting || !teamAId || !teamBId || teamAId === teamBId}
            isLoading={isSubmitting}
            icon={<Save />}
            fullWidth
          >
            Soumettre le Rapport
          </CTAButton>
        </div>

      </form>
    </PremiumCard>
  );
}
