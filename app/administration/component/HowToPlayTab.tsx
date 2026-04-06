"use client";

import { useEffect, useState, useTransition } from "react";
import { getHowToPlaySettings, updateHowToPlaySettings } from "../actions";
import { Save, Loader2, BookOpen, Gamepad2, MonitorSmartphone, Users, Trophy, ShieldCheck, Map } from "lucide-react";
import { toast } from "react-hot-toast";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";

export default function HowToPlayTab() {
  const [settings, setSettings] = useState<Record<string, string>>({
    how_to_play_what_is_bb: "",
    how_to_play_platforms: "",
    how_to_play_community: "",
    how_to_play_tournaments: "",
    how_to_play_naf_cdf_rtc: "",
    how_to_play_challenges: ""
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getHowToPlaySettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await updateHowToPlaySettings(settings);
        if (res.success) {
          toast.success("Guide mis à jour !");
        } else {
          toast.error(res.error || "Erreur lors de la mise à jour");
        }
      } catch (err) {
        toast.error("Erreur réseau");
      }
    });
  };

  const updateSection = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  const sections = [
    { key: "how_to_play_what_is_bb", label: "C'est quoi Blood Bowl ?", icon: <Gamepad2 size={18} />, desc: "Introduction au jeu et à l'univers." },
    { key: "how_to_play_platforms", label: "Comment y jouer ?", icon: <MonitorSmartphone size={18} />, desc: "Plateformes (Plateau, Fumbbl, BB3)." },
    { key: "how_to_play_community", label: "Communauté & Ligues", icon: <Users size={18} />, desc: "Comment rejoindre le Discord et les ligues locales." },
    { key: "how_to_play_tournaments", label: "Rejoindre un Tournoi", icon: <Trophy size={18} />, desc: "Explications sur les inscriptions et le calendrier." },
    { key: "how_to_play_naf_cdf_rtc", label: "NAF, CdF & RTC", icon: <ShieldCheck size={18} />, desc: "Structures officielles et système de répartition." },
    { key: "how_to_play_challenges", label: "Challenges Régionaux", icon: <Map size={18} />, desc: "Les circuits comme le Grand Ouest, TGE, etc." }
  ];

  return (
    <div className="how-to-play-tab">
      <PremiumCard style={{ padding: "2.5rem", marginBottom: "2rem" }}>
        <header style={{ marginBottom: "2.5rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <div style={{ background: "var(--primary-transparent)", color: "var(--primary)", padding: "0.8rem", borderRadius: "12px" }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.4rem", color: "var(--foreground)", margin: 0, fontWeight: 800 }}>
                Configuration du Guide "Comment Jouer"
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.2rem" }}>
                Gérez le contenu de la page d'accueil pour les nouveaux coachs. Utilisez le BBCode pour la mise en forme.
              </p>
            </div>
          </div>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          {sections.map((section) => (
            <section key={section.key} className="settings-section">
              <div className="section-header">
                <div className="icon-badge">
                  {section.icon}
                </div>
                <div>
                  <h4 className="section-title">{section.label}</h4>
                  <p className="section-desc">{section.desc}</p>
                </div>
              </div>
              <div className="editor-wrapper">
                <BBCodeEditor 
                  name={section.key}
                  defaultValue={settings[section.key]}
                  onChange={(val) => updateSection(section.key, val)}
                  rows={8}
                />
              </div>
            </section>
          ))}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem", position: "sticky", bottom: "2rem", zIndex: 100 }}>
            <button
              onClick={handleSave}
              disabled={isPending}
              className={`action-btn-save ${isPending ? 'pending' : ''}`}
            >
              {isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span>Enregistrer le Guide</span>
            </button>
          </div>
        </div>
      </PremiumCard>

      <style jsx>{`
        .settings-section {
          background: var(--glass-bg);
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid var(--glass-border);
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .icon-badge {
          background: var(--primary-transparent);
          color: var(--primary);
          padding: 0.6rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .section-title {
          margin: 0;
          font-size: 1.1rem;
          color: var(--foreground);
          font-weight: 700;
        }
        .section-desc {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .editor-wrapper {
          margin-top: 1rem;
        }
        .action-btn-save {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1rem 2.5rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 10px 25px var(--btn-shadow);
        }
        .action-btn-save:hover {
          filter: brightness(1.1);
          transform: translateY(-4px);
          box-shadow: 0 15px 30px var(--btn-shadow);
        }
        .action-btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .pending {
          filter: grayscale(0.5);
        }
      `}</style>
    </div>
  );
}
