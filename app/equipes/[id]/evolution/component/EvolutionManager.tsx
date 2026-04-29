"use client";

import { useState } from "react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { Save, ArrowUpRight } from "lucide-react";
import { evolvePlayer } from "../../../actions";
import { useRouter } from "next/navigation";

// Table des coûts de SPP et TV simplifiée (BB2020)
const UPGRADE_OPTIONS = [
  { label: "Compétence Principale Aléatoire", spp: 3, tv: 10000 },
  { label: "Compétence Principale Choisie", spp: 6, tv: 20000 },
  { label: "Compétence Secondaire Aléatoire", spp: 6, tv: 20000 },
  { label: "Compétence Secondaire Choisie", spp: 12, tv: 40000 },
  { label: "Caractéristique (+MA/AV)", spp: 18, tv: 10000 },
  { label: "Caractéristique (+PA/AG)", spp: 18, tv: 20000 },
  { label: "Caractéristique (+ST)", spp: 18, tv: 40000 },
];

export default function EvolutionManager({ players, teamId }: { players: any[], teamId: string }) {
  const router = useRouter();

  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedUpgrade, setSelectedUpgrade] = useState(-1);
  const [skillName, setSkillName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const player = players.find(p => p.id === selectedPlayerId);
  const upgrade = selectedUpgrade >= 0 ? UPGRADE_OPTIONS[selectedUpgrade] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player || !upgrade || !skillName) return;

    if (player.spp < upgrade.spp) {
      alert("Pas assez de SPP !");
      return;
    }

    try {
      setIsSubmitting(true);
      await evolvePlayer({
        playerId: player.id,
        skillName: skillName,
        sppCost: upgrade.spp,
        tvIncrease: upgrade.tv
      });
      alert("Évolution appliquée !");
      router.push(`/equipes/${teamId}`);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <PremiumCard className="max-w-xl mx-auto">
      <h3 className="text-xl font-bold mb-4">Dépenser des SPP</h3>
      
      {players.length === 0 ? (
        <p className="text-muted">Aucun joueur n'a de SPP à dépenser pour le moment.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Joueur</label>
            <select 
              className="p-2 rounded bg-black/20 border border-white/10 text-white"
              value={selectedPlayerId}
              onChange={(e) => {
                setSelectedPlayerId(e.target.value);
                setSelectedUpgrade(-1);
              }}
            >
              <option value="">-- Sélectionner un Joueur --</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>
                  #{p.number} {p.name} - {p.position} ({p.spp} SPP)
                </option>
              ))}
            </select>
          </div>

          {player && (
            <>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm">Type d'Évolution</label>
                <select 
                  className="p-2 rounded bg-black/20 border border-white/10 text-white"
                  value={selectedUpgrade}
                  onChange={(e) => setSelectedUpgrade(parseInt(e.target.value))}
                >
                  <option value="-1">-- Sélectionner --</option>
                  {UPGRADE_OPTIONS.map((opt, idx) => (
                    <option key={idx} value={idx} disabled={player.spp < opt.spp}>
                      {opt.label} (Coût: {opt.spp} SPP | TV: +{opt.tv.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {upgrade && (
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm">Nom de la compétence ou Caractéristique obtenue</label>
                  <input 
                    type="text" 
                    placeholder="ex: Blocage, Esquive, +1 MA..."
                    className="p-2 rounded bg-black/20 border border-white/10 text-white"
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted">
                    L'ajout manuel permet de s'adapter aux jets aléatoires réels effectués sur table.
                  </p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting || !upgrade || !skillName}
                className="classic-button cta-button justify-center mt-4"
              >
                {isSubmitting ? "Application..." : <><ArrowUpRight size={18} /> Appliquer l'Évolution</>}
              </button>
            </>
          )}
        </form>
      )}
    </PremiumCard>
  );
}
