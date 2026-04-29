"use client";

import { useState } from "react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { createLeagueSeason } from "../../actions";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

export default function SeasonBuilder({ ligues }: { ligues: any[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ligueId, setLigueId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ligueId) return;

    try {
      setIsSubmitting(true);
      const seasonId = await createLeagueSeason({ name, ligueId });
      router.push(`/saisons/jeu/${seasonId}`);
    } catch (err: any) {
      alert("Erreur: " + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <PremiumCard className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold">Nom de la Saison (ex: Saison Régulière 2026)</label>
          <input 
            type="text" 
            className="p-2 rounded bg-black/20 border border-white/10 text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold">Rattacher à quelle Ligue ?</label>
          <select 
            className="p-2 rounded bg-black/20 border border-white/10 text-white"
            value={ligueId}
            onChange={(e) => setLigueId(e.target.value)}
            required
          >
            <option value="" disabled>-- Sélectionner --</option>
            {ligues.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || !name || !ligueId}
          className="classic-button cta-button mt-4 justify-center"
        >
          {isSubmitting ? "Création..." : <><Save size={18} /> Créer l'Ébauche</>}
        </button>
      </form>
    </PremiumCard>
  );
}
