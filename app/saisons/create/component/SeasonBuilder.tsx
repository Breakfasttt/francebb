"use client";

import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import CTAButton from "@/common/components/Button/CTAButton";
import ClassicInput from "@/common/components/Form/ClassicInput";
import ClassicSelect from "@/common/components/Form/ClassicSelect";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { Calendar, Coins, FileText, Save, Settings, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createLeagueSeason } from "../../actions";

export default function SeasonBuilder({ ligues }: { ligues: any[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ligueId, setLigueId] = useState("");
  const [competitionType, setCompetitionType] = useState("ROUND_ROBIN");
  const [initialBudget, setInitialBudget] = useState(1000000);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ligueId) return;

    try {
      setIsSubmitting(true);
      const seasonId = await createLeagueSeason({
        name,
        ligueId,
        competitionType,
        initialBudget,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        description
      });
      router.push(`/saisons/jeu/${seasonId}`);
    } catch (err: any) {
      alert("Erreur: " + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-16">
      <div className="max-w-3xl mx-auto">
        <PremiumCard style={{ padding: '5rem', boxShadow: 'var(--glass-shadow-strong)' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-24">

            <section className="form-section">
              <h3 className="text-primary font-bold uppercase tracking-wider text-sm mb-12 flex items-center gap-3">
                <Settings size={20} /> Informations Générales
              </h3>
              <div className="flex flex-col gap-14">
                <ClassicInput
                  label="Nom de la Saison"
                  icon={<Trophy size={14} />}
                  placeholder="ex: Saison Régulière 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <ClassicSelect
                  label="Rattacher à quelle Ligue ?"
                  icon={<Trophy size={14} />}
                  value={ligueId}
                  onChange={(e) => setLigueId(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Sélectionner une ligue --</option>
                  {ligues.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.acronym})</option>
                  ))}
                </ClassicSelect>
              </div>
            </section>

            <hr className="border-white/5 my-10" />

            <section className="form-section">
              <h3 className="text-primary font-bold uppercase tracking-wider text-sm mb-12 flex items-center gap-3">
                <Settings size={20} /> Format & Budget
              </h3>
              <div className="flex flex-col gap-14">
                <ClassicSelect
                  label="Type de Compétition"
                  icon={<Settings size={14} />}
                  value={competitionType}
                  onChange={(e) => setCompetitionType(e.target.value)}
                  required
                >
                  <option value="ROUND_ROBIN">Toutes rondes (Championnat)</option>
                  <option value="SWISS">Ronde Suisse</option>
                  <option value="GROUPS">Poules + Play-offs</option>
                  <option value="ELIMINATION">Élimination directe (Bracket)</option>
                </ClassicSelect>

                <ClassicInput
                  label="Budget Initial (Trésorerie)"
                  icon={<Coins size={14} />}
                  type="number"
                  value={initialBudget}
                  onChange={(e) => setInitialBudget(parseInt(e.target.value))}
                  step="10000"
                  min="0"
                  required
                />
              </div>
            </section>

            <hr className="border-white/5 my-10" />

            <section className="form-section">
              <h3 className="text-primary font-bold uppercase tracking-wider text-sm mb-12 flex items-center gap-3">
                <Calendar size={20} /> Calendrier Prévisionnel
              </h3>
              <div className="flex flex-col gap-14">
                <ClassicInput
                  label="Date de début"
                  icon={<Calendar size={14} />}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <ClassicInput
                  label="Date de fin"
                  icon={<Calendar size={14} />}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </section>

            <hr className="border-white/5 my-10" />

            <section className="form-section flex flex-col gap-10">
              <h3 className="text-primary font-bold uppercase tracking-wider text-sm flex items-center gap-3">
                <FileText size={20} /> Description & Règlement
              </h3>
              <BBCodeEditor
                name="description"
                placeholder="Précisez les règles spécifiques, tie-breakers ou toute information utile pour les coachs..."
                rows={14}
                onChange={(val) => setDescription(val)}
              />
            </section>

            <div className="flex justify-end pt-6 border-t border-white/10">
              <CTAButton
                type="submit"
                disabled={isSubmitting || !name || !ligueId}
                isLoading={isSubmitting}
                className="px-12"
                icon={<Save size={18} />}
              >
                Créer l'Ébauche de Saison
              </CTAButton>
            </div>
          </form>
        </PremiumCard>
      </div>
    </div>
  );
}
