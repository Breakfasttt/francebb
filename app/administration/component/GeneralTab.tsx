"use client";

import { useEffect, useState, useTransition } from "react";
import { getSiteSetting, updateSiteSetting } from "../actions";
import { Save, Globe, Link as LinkIcon, Video, Youtube, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import TagSelector from "@/common/components/TagSelector/TagSelector";
import CTAButton from "@/common/components/Button/CTAButton";

export default function GeneralTab() {
  const [discordInvite, setDiscordInvite] = useState("");
  const [twitchChannels, setTwitchChannels] = useState<string[]>([]);
  const [youtubeChannels, setYoutubeChannels] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadSettings() {
      try {
        const [invite, twitch, youtube] = await Promise.all([
          getSiteSetting("discord_invite"),
          getSiteSetting("twitch_channels"),
          getSiteSetting("youtube_channels"),
        ]);
        
        setDiscordInvite(invite || "");
        setTwitchChannels(twitch?.split(",").map(c => c.trim()).filter(Boolean) || []);
        setYoutubeChannels(youtube?.split(",").map(c => c.trim()).filter(Boolean) || []);
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
        await Promise.all([
          updateSiteSetting("discord_invite", discordInvite),
          updateSiteSetting("twitch_channels", twitchChannels.join(",")),
          updateSiteSetting("youtube_channels", youtubeChannels.join(",")),
        ]);
        toast.success("Paramètres mis à jour !");
      } catch (err) {
        toast.error("Erreur lors de la mise à jour");
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
        {/* Discord Section */}
        <section className="settings-section">
          <div className="section-header">
            <div className="icon-badge">
              <LinkIcon size={18} />
            </div>
            <div>
              <h4 className="section-title">Communauté Discord</h4>
              <p className="section-desc">L'URL d'invitation pour rejoindre le serveur.</p>
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
        </section>

        {/* Media Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <section className="settings-section">
            <div className="section-header">
              <div className="icon-badge">
                <Video size={18} />
              </div>
              <div>
                <h4 className="section-title">Streams Twitch</h4>
                <p className="section-desc">Chaînes à surveiller.</p>
              </div>
            </div>
            <div className="input-wrapper">
              <TagSelector
                value={twitchChannels}
                onChange={setTwitchChannels}
                placeholder="Ex: bloody_owl, fumbll_network..."
              />
            </div>
          </section>

          <section className="settings-section">
            <div className="section-header">
              <div className="icon-badge">
                <Youtube size={18} />
              </div>
              <div>
                <h4 className="section-title">Chaînes YouTube</h4>
                <p className="section-desc">IDs des chaînes (UC...).</p>
              </div>
            </div>
            <div className="input-wrapper">
              <TagSelector
                value={youtubeChannels}
                onChange={setYoutubeChannels}
                placeholder="Ex: UC_x5XG1OV2P6uWXO-..."
              />
            </div>
          </section>
        </div>

        {/* Action Bar */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <CTAButton
            onClick={handleSave}
            isLoading={isPending}
            icon={<Save size={18} />}
          >
            Enregistrer les modifications
          </CTAButton>
        </div>
      </div>

      <style jsx>{`
        .settings-section {
          background: var(--glass-bg);
          padding: 1.5rem;
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
          margin-bottom: 0.5rem;
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
          font-size: 1rem;
          color: var(--foreground);
          font-weight: 700;
        }
        .section-desc {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .input-wrapper {
          margin-top: 1rem;
        }
        .premium-input-field {
          width: 100%;
          background: var(--card-bg);
          border: 1px solid var(--glass-border);
          padding: 0.8rem 1.2rem;
          border-radius: 10px;
          color: var(--foreground);
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        .premium-input-field:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-transparent);
        }
        .pending {
          filter: grayscale(0.5);
        }
      `}</style>
    </PremiumCard>
  );
}

