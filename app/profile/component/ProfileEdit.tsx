import { getReferenceDataAction, updateProfile, updateTheme } from "@/app/profile/actions";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import Modal from "@/common/components/Modal/Modal";
import RankSelect from "@/common/components/RankSelect/RankSelect";
import Toast from "@/common/components/Toast/Toast";
import UserAvatar, { Rank } from "@/common/components/UserAvatar/UserAvatar";
import { siteConfig } from "@/lib/siteConfig";
import { Dices, Droplets, Loader2, Moon, Palette, Sparkles, Sun, Upload } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useTheme } from "next-themes";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";

const IMGBB_API_KEY = siteConfig.api.imgbb.apiKey;

const DICEBEAR_STYLES = [
  { id: "adventurer", label: "Aventurier" },
  { id: "avataaars", label: "Moderne" },
  { id: "bottts", label: "Robot" },
  { id: "fun-emoji", label: "Smiley" },
  { id: "lorelei", label: "Lorelei" },
  { id: "open-peeps", label: "Minimaliste" },
  { id: "personas", label: "Humain" },
  { id: "pixel-art", label: "Pixel Art" },
];

interface ProfileEditProps {
  user: any;
  postCount: number;
  onUpdate?: () => void;
}

export default function ProfileEdit({ user, postCount, onUpdate }: ProfileEditProps) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    image: user.image || "",
    nafNumber: user.nafNumber || "",
    region: user.region || "",
    league: user.league || "",
    signature: user.signature || "",
    avatarFrame: user.avatarFrame || "auto",
  });

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genSeed, setGenSeed] = useState(user.name || "");
  const [genStyle, setGenStyle] = useState("avataaars");

  const [isPending, startTransition] = useTransition();
  const [isUpdatingTheme, startThemeUpdate] = useTransition();
  const { theme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme || user.theme || "dark");
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [regions, setRegions] = useState<{ key: string; label: string }[]>([]);

  useEffect(() => {
    async function loadRegions() {
      const data = await getReferenceDataAction("COACH_REGION");
      setRegions(data);
    }
    loadRegions();
  }, []);

  useEffect(() => {
    if (theme) setCurrentTheme(theme);
  }, [theme]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formDataUpload,
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.data.url }));
        showToast("Image uploadée avec succès !", "success");
      } else {
        showToast(`Erreur ImgBB: ${data.error?.message || "Échec"}`, "error");
      }
    } catch (error) {
      showToast("Erreur lors de l'upload de l'image.", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRandomAvatar = () => {
    const style = DICEBEAR_STYLES[Math.floor(Math.random() * DICEBEAR_STYLES.length)].id;
    const seed = Math.random().toString(36).substring(7);
    const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    setFormData(prev => ({ ...prev, image: url }));
    showToast("Avatar généré !", "success");
  };

  const handleGenerateApply = () => {
    const url = `https://api.dicebear.com/7.x/${genStyle}/svg?seed=${genSeed}`;
    setFormData(prev => ({ ...prev, image: url }));
    setIsGeneratorOpen(false);
  };

  const handleThemeChange = (newTheme: string) => {
    setCurrentTheme(newTheme);
    setTheme(newTheme);
    startThemeUpdate(async () => {
      const result = await updateTheme(newTheme);
      if (result.success) {
        showToast("Thème mis à jour !", "success");
      } else {
        showToast("Erreur lors du changement de thème", "error");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    startTransition(async () => {
      try {
        const result = await updateProfile(data);
        if (result.success) {
          showToast("Profil mis à jour !", "success");
          if (onUpdate) {
            setTimeout(() => onUpdate(), 1000);
          }
        }
      } catch (err) {
        showToast("Erreur lors de la mise à jour", "error");
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <PremiumCard className="profile-edit-container fade-in">
      <h3 className="section-title">Éditer mon profil</h3>

      <form onSubmit={handleSubmit} className="profile-edit-form">
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleImageUpload}
        />

        <div className="profile-edit-layout-rows">
          {/* Avatar Section */}
          <div className="avatar-studio-box">
            <div className="studio-preview-pane">
              <UserAvatar
                image={formData.image}
                selectedRank={formData.avatarFrame as Rank}
                size={140}
                postCount={postCount}
              />
              <div className="preview-label">Aperçu</div>
            </div>

            <div className="studio-controls-pane">
              <div className="form-group">
                <label>URL de l'avatar</label>
                <div className="avatar-input-group">
                  <input
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://..."
                    style={{ flex: 1 }}
                  />
                  <div className="btn-group-avatar">
                      <button type="button" className="upload-btn-icon" onClick={handleRandomAvatar} title="Aléatoire">
                        <Dices size={16} />
                      </button>
                      <button type="button" className="upload-btn-icon sparkles" onClick={() => setIsGeneratorOpen(true)} title="Personnaliser">
                        <Sparkles size={16} />
                      </button>
                      <button type="button" className="upload-btn-icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Contour d'avatar</label>
                <RankSelect
                  value={formData.avatarFrame}
                  onSelect={(frame) => setFormData(prev => ({ ...prev, avatarFrame: frame }))}
                  postCount={postCount}
                />
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="form-row-grid">
            <div className="form-group">
              <label>Pseudo</label>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Pseudo" />
            </div>

            <div className="form-group">
              <label>Numéro NAF</label>
              <input name="nafNumber" value={formData.nafNumber} onChange={handleChange} placeholder="Ex: 12345" />
            </div>

            <div className="form-group">
              <label>Région de tournoi</label>
              <select name="region" value={formData.region} onChange={handleChange}>
                <option value="">Sélectionnez une région</option>
                {regions.map(r => (
                  <option key={r.key} value={r.key}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ligue</label>
              <input name="league" value={formData.league} onChange={handleChange} placeholder="Ex: Ligue de Paris" />
            </div>
          </div>

          {/* Signature Section */}
          <div className="form-group full-width-group">
            <label>Signature du forum (250 car. max)</label>
            <BBCodeEditor
              name="signature"
              defaultValue={user.signature || ""}
              maxLength={250}
              rows={4}
              onChange={(val) => setFormData(prev => ({ ...prev, signature: val }))}
            />
          </div>

          {/* Appearance Section */}
          <div className="appearance-box">
             <label className="section-label-inner"><Palette size={16} /> Apparence du site</label>
             <div className="theme-grid">
               {[
                 { id: 'dark', label: 'Sombre', icon: <Moon size={14} /> },
                 { id: 'light', label: 'Clair', icon: <Sun size={14} /> },
                 { id: 'blood', label: 'Blood', icon: <Droplets size={14} /> },
                 { id: 'malpierre', label: 'Malpierre', icon: <Sparkles size={14} /> },
                 { id: 'nehekhara', label: 'Néhékhara', icon: <Sparkles size={14} /> },
                 { id: 'saison3', label: 'Saison 3', icon: <Sparkles size={14} /> },
                 { id: 'naf', label: 'NAF', icon: <Sparkles size={14} /> },
               ].map(t => (
                 <button
                   key={t.id}
                   type="button"
                   className={`theme-card ${currentTheme === t.id ? 'active' : ''}`}
                   onClick={() => handleThemeChange(t.id)}
                   disabled={isUpdatingTheme}
                 >
                   <div className={`theme-preview ${t.id}`}></div>
                   <div className="theme-info">
                     {t.icon}
                     <span>{t.label}</span>
                   </div>
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div className="form-actions-edit">
          <button type="submit" className="btn-save" disabled={isPending}>
            {isPending ? <Loader2 size={18} className="animate-spin" /> : "Sauvegarder le profil"}
          </button>
        </div>
      </form>

      <Modal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onConfirm={handleGenerateApply}
        title="Générateur d'Avatar Dicebear"
        confirmText="Appliquer"
      >
        <div className="avatar-gen-modal">
          <div className="gen-preview">
            <img src={`https://api.dicebear.com/7.x/${genStyle}/svg?seed=${genSeed}`} alt="Preview" />
          </div>
          <div className="gen-field">
            <label>Seed (Texte de génération)</label>
            <input type="text" value={genSeed} onChange={(e) => setGenSeed(e.target.value)} placeholder="Ex: votre pseudo" />
          </div>
          <div className="gen-styles-grid">
            {DICEBEAR_STYLES.map(style => (
              <button key={style.id} className={`style-item ${genStyle === style.id ? 'active' : ''}`} onClick={() => setGenStyle(style.id)}>
                <img src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=preview`} alt={style.label} />
                <span>{style.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <style jsx>{`
        :global(.profile-edit-container) {
          padding: 2rem !important;
        }
        .section-title {
          margin: 0 0 2rem 0;
          font-size: 1.2rem;
          color: var(--foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .profile-edit-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .profile-edit-layout-rows {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .avatar-studio-box {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .studio-preview-pane {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding-right: 2rem;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }
        .preview-label { font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800; }
        .studio-controls-pane {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          justify-content: center;
        }
        .avatar-input-group {
          display: flex;
          gap: 0.5rem;
        }
        .btn-group-avatar { display: flex; gap: 0.4rem; }
        .upload-btn-icon {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; border-radius: 8px;
          background: var(--input-bg); border: 1px solid var(--glass-border);
          color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        .upload-btn-icon:hover { background: var(--glass-border); color: var(--foreground); }
        .upload-btn-icon.sparkles { color: var(--accent); }

        .form-row-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .form-group { display: flex; flex-direction: column; gap: 0.6rem; }
        .form-group label {
          font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
          color: var(--text-muted); letter-spacing: 0.05em;
        }
        input, select {
          padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid var(--glass-border);
          background: var(--input-bg); color: var(--foreground); font-size: 0.95rem;
          transition: border-color 0.2s;
        }
        input:focus, select:focus { border-color: var(--primary); outline: none; }

        .appearance-box {
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .section-label-inner {
          display: flex; align-items: center; gap: 0.6rem;
          font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
          color: var(--text-muted); margin-bottom: 1rem;
        }
        .theme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }
        .theme-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 12px; padding: 0.8rem;
          cursor: pointer; transition: all 0.2s ease;
          display: flex; flex-direction: column; gap: 0.8rem;
          color: var(--foreground); text-align: left;
        }
        .theme-card:hover { background: rgba(255, 255, 255, 0.05); transform: translateY(-2px); }
        .theme-card.active { border-color: var(--primary); background: rgba(194, 29, 29, 0.05); }
        .theme-preview { height: 40px; border-radius: 6px; width: 100%; border: 1px solid rgba(255,255,255,0.05); }
        .theme-preview.dark { background: #0a0a0c; }
        .theme-preview.light { background: #f0f1f4; }
        .theme-preview.blood { background: #120000; }
        .theme-preview.malpierre { background: #020a02; }
        .theme-preview.nehekhara { background: #0b0e14; }
        .theme-preview.saison3 { background: #9e1d1d; }
        .theme-preview.naf { background: #012b5d; }
        .theme-info { display: flex; align-items: center; gap: 0.6rem; font-weight: 600; font-size: 0.85rem; }

        .form-actions-edit { display: flex; justify-content: flex-end; margin-top: 1rem; }
        .btn-save {
          background: var(--primary); color: white; border: none;
          padding: 1rem 2.5rem; border-radius: 8px; font-size: 0.9rem;
          font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .btn-save:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(194, 29, 29, 0.3); }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .avatar-studio-box { grid-template-columns: 1fr; }
          .studio-preview-pane { border-right: none; padding-right: 0; padding-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
          .form-row-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </PremiumCard>
  );
}
