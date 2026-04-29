"use client";

import { useState } from "react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { submitMatchReport } from "../../../../actions";

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

  const teamA = season.teams.find((t: any) => t.id === teamAId);
  const teamB = season.teams.find((t: any) => t.id === teamBId);

  // Calcul auto Petty Cash
  if (teamA && teamB) {
    const diff = teamA.currentTV - teamB.currentTV;
    if (diff > 0 && pettyCashB !== diff && pettyCashA !== 0) {
      setPettyCashB(diff);
      setPettyCashA(0);
    } else if (diff < 0 && pettyCashA !== Math.abs(diff) && pettyCashB !== 0) {
      setPettyCashA(Math.abs(diff));
      setPettyCashB(0);
    }
  }

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
        status: isAdmin ? "VALIDATED" : "PENDING"
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
        
        <div className="flex gap-4">
          {/* TEAM A */}
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-bold">Équipe A (Domicile)</label>
            <select 
              className="p-2 rounded bg-black/20 border border-white/10 text-white"
              value={teamAId}
              onChange={e => setTeamAId(e.target.value)}
              disabled={!isAdmin && !!userTeamId} // Bloqué si joueur
            >
              <option value="">-- Sélectionner --</option>
              {season.teams.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name} (TV: {t.currentTV})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center font-bold text-xl px-4 mt-6">VS</div>

          {/* TEAM B */}
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-bold">Équipe B (Extérieur)</label>
            <select 
              className="p-2 rounded bg-black/20 border border-white/10 text-white"
              value={teamBId}
              onChange={e => setTeamBId(e.target.value)}
            >
              <option value="">-- Sélectionner --</option>
              {season.teams.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name} (TV: {t.currentTV})</option>
              ))}
            </select>
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

        <div className="grid grid-cols-2 gap-8 text-center mt-4">
          <div className="flex flex-col gap-4">
            <div>
              <label>Touchdowns {teamA?.name}</label>
              <input type="number" min="0" value={scoreA} onChange={e => setScoreA(parseInt(e.target.value)||0)} className="w-full mt-1 p-2 bg-black/20 border border-white/10 rounded text-center text-2xl"/>
            </div>
            <div>
              <label>Sorties (Blocages)</label>
              <input type="number" min="0" value={casA} onChange={e => setCasA(parseInt(e.target.value)||0)} className="w-full mt-1 p-2 bg-black/20 border border-white/10 rounded text-center"/>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label>Touchdowns {teamB?.name}</label>
              <input type="number" min="0" value={scoreB} onChange={e => setScoreB(parseInt(e.target.value)||0)} className="w-full mt-1 p-2 bg-black/20 border border-white/10 rounded text-center text-2xl"/>
            </div>
            <div>
              <label>Sorties (Blocages)</label>
              <input type="number" min="0" value={casB} onChange={e => setCasB(parseInt(e.target.value)||0)} className="w-full mt-1 p-2 bg-black/20 border border-white/10 rounded text-center"/>
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

        <button 
          type="submit" 
          disabled={isSubmitting || !teamAId || !teamBId || teamAId === teamBId}
          className="classic-button cta-button justify-center mt-4"
        >
          {isSubmitting ? "Envoi..." : <><Save size={18} /> Soumettre le Rapport</>}
        </button>

      </form>
    </PremiumCard>
  );
}
