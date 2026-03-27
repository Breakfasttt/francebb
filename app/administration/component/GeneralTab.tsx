"use client";

import { useEffect, useState, useTransition } from "react";
import { getSiteSetting, updateSiteSetting } from "../actions";
import { Save, Loader2, Globe, Link as LinkIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";

export default function GeneralTab() {
  const [discordInvite, setDiscordInvite] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadSettings() {
      try {
        const invite = await getSiteSetting("discord_invite");
        setDiscordInvite(invite || "");
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
      const res = await updateSiteSetting("discord_invite", discordInvite);
      if (res.success) {
        toast.success("Paramètres mis à jour !");
      } else {
        toast.error(res.error || "Erreur lors de la mise à jour");
      }
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  return (
    <PremiumCard style={{ padding: "2.5rem" }}>
      <header style={{ marginBottom: "2.5rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <div style={{ background: "var(--primary-transparent)", color: "var(--primary)", padding: "0.8rem", borderRadius: "12px" }}>
            <Globe size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.4rem", color: "var(--foreground)", margin: 0, fontWeight: 800 }}>
              Paramètres Généraux
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.2rem" }}>
              Configuration globale de la plateforme BBFrance.
            </p>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {/* Discord Invite Section */}
        <section className="settings-section">
          <div className="section-header">
            <div className="icon-badge">
              <LinkIcon size={18} />
            </div>
            <div>
              <h4 className="section-title">Lien d'invitation Discord</h4>
              <p className="section-desc">L'URL d'invitation pour rejoindre la communauté officielle.</p>
            </div>
          </div>

          <div className="input-wrapper">
            <input
              type="text"
              value={discordInvite}
              onChange={(e) => setDiscordInvite(e.target.value)}
              placeholder="https://discord.gg/..."
              className="premium-input-field"
            />
          </div>
          <div className="info-box">
            <p>Ce lien sera utilisé pour le bouton d'accueil et les communications automatiques.</p>
          </div>
        </section>

        {/* Action Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
          <button
            onClick={handleSave}
            disabled={isPending}
            className={`action-btn-save ${isPending ? 'pending' : ''}`}
          >
            {isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .settings-section {
          background: var(--glass-bg);
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid var(--glass-border);
          transition: all 0.3s ease;
        }
        .settings-section:hover {
          border-color: var(--primary-transparent);
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          marginBottom: 1.5rem;
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
          fontSize: 1.1rem;
          color: var(--foreground);
          font-weight: 700;
        }
        .section-desc {
          margin: 0;
          fontSize: 0.85rem;
          color: var(--text-muted);
        }
        .input-wrapper {
          marginTop: 1.5rem;
        }
        .premium-input-field {
          width: 100%;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          padding: 1rem 1.2rem;
          border-radius: 12px;
          color: var(--foreground);
          font-size: 1rem;
          transition: all 0.2s ease;
        }
        .premium-input-field:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-transparent);
        }
        .info-box {
          marginTop: 1rem;
          background: rgba(var(--primary-rgb, 194, 29, 29), 0.03);
          padding: 0.8rem 1rem;
          border-radius: 8px;
          border-left: 3px solid var(--primary);
        }
        .info-box p {
          margin: 0;
          fontSize: 0.8rem;
          color: var(--text-muted);
          font-style: italic;
        }
        .action-btn-save {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1rem 2rem;
          background: var(--primary);
          color: var(--header-foreground);
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px var(--btn-shadow);
        }
        .action-btn-save:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--btn-shadow);
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
    </PremiumCard>
  );
}
