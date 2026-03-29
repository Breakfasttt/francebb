"use client";

import { useEffect, useState, useTransition } from "react";
import { getSiteSetting, updateSiteSetting } from "../actions";
import { Save, Loader2, Globe, Link as LinkIcon, Video, Youtube, Map } from "lucide-react";
import { toast } from "react-hot-toast";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";

export default function GeneralTab() {
  const [discordInvite, setDiscordInvite] = useState("");
  const [twitchChannels, setTwitchChannels] = useState("");
  const [youtubeChannels, setYoutubeChannels] = useState("");
  const [youtubeApiKey, setYoutubeApiKey] = useState("");
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadSettings() {
      try {
        const [invite, twitch, youtube, yApiKey, gMapsKey] = await Promise.all([
          getSiteSetting("discord_invite"),
          getSiteSetting("twitch_channels"),
          getSiteSetting("youtube_channels"),
          getSiteSetting("youtube_api_key"),
          getSiteSetting("google_maps_api_key"),
        ]);
        
        setDiscordInvite(invite || "");
        setTwitchChannels(twitch || "");
        setYoutubeChannels(youtube || "");
        setYoutubeApiKey(yApiKey || "");
        setGoogleMapsApiKey(gMapsKey || "");
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
          updateSiteSetting("twitch_channels", twitchChannels),
          updateSiteSetting("youtube_channels", youtubeChannels),
          updateSiteSetting("youtube_api_key", youtubeApiKey),
          updateSiteSetting("google_maps_api_key", googleMapsApiKey),
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
                <p className="section-desc">Chaînes à surveiller (séparées par des virgules).</p>
              </div>
            </div>
            <div className="input-wrapper">
              <input
                type="text"
                value={twitchChannels}
                onChange={(e) => setTwitchChannels(e.target.value)}
                placeholder="bloody_owl, fumbll_network..."
                className="premium-input-field"
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
                <p className="section-desc">IDs des chaînes pour les vidéos (séparés par des virgules).</p>
              </div>
            </div>
            <div className="input-wrapper">
              <input
                type="text"
                value={youtubeChannels}
                onChange={(e) => setYoutubeChannels(e.target.value)}
                placeholder="UC_x5XG1OV2P6uWXO-..."
                className="premium-input-field"
              />
            </div>
          </section>
        </div>

        {/* API Keys Section */}
        <section className="settings-section">
          <div className="section-header">
            <div className="icon-badge">
              <Map size={18} />
            </div>
            <div>
              <h4 className="section-title">Clés API Externes</h4>
              <p className="section-desc">Nécessaires pour les fonctionnalités Media et Carte.</p>
            </div>
          </div>
          <div className="input-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem", display: "block" }}>Google Maps API Key</label>
              <input
                type="password"
                value={googleMapsApiKey}
                onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="premium-input-field"
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem", display: "block" }}>YouTube Data API Key</label>
              <input
                type="password"
                value={youtubeApiKey}
                onChange={(e) => setYoutubeApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="premium-input-field"
              />
            </div>
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
        .action-btn-save {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.8rem 1.8rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 10px;
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

