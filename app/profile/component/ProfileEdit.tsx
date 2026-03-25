import { updateProfile } from "@/app/profile/actions";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import Modal from "@/common/components/Modal/Modal";
import RankSelect from "@/common/components/RankSelect/RankSelect";
import Toast from "@/common/components/Toast/Toast";
import UserAvatar, { Rank } from "@/common/components/UserAvatar/UserAvatar";
import { siteConfig } from "@/lib/siteConfig";
import { Dices, Loader2, Sparkles, Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";

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
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // ImgBB API requires the key as a query parameter
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formDataUpload,
      });

      const data = await response.json();

      if (data.success) {
        // ImgBB returns the URL in data.data.url
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    startTransition(async () => {
      try {
        const result = await updateProfile(data);
        if (result.success) {
          showToast("Profil mis à jour !", "success");
          // On attend un peu pour que le toast soit visible et pour éviter 
          // de couper le flux de réponse du serveur trop tôt (Error in input stream)
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

  const regions = [
    { value: "", label: "Sélectionnez une région" },
    { value: "IDF", label: "R1 - Île-de-France" },
    { value: "Nord-Ouest", label: "R2 - Nord-Ouest" },
    { value: "Nord-Est", label: "R3 - Nord-Est" },
    { value: "Sud-Est", label: "R4 - Sud-Est" },
    { value: "Sud-Ouest", label: "R5 - Sud-Ouest" },
  ];

  return (
    <div className="premium-card profile-edit-container fade-in">
      <h3 className="section-title">Éditer mon profil</h3>

      <form onSubmit={handleSubmit} className="profile-edit-form">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleImageUpload}
        />

        <div className="profile-edit-layout-rows">
          <div className="form-row-box">
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
                {regions.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ligue</label>
              <input name="league" value={formData.league} onChange={handleChange} placeholder="Ex: Ligue de Paris" />
            </div>
          </div>


          <div className="full-width avatar-studio-box">
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
                  <button
                    type="button"
                    className="upload-btn dicebear-btn"
                    onClick={handleRandomAvatar}
                    title="Aléatoire"
                  >
                    <Dices size={16} />
                  </button>
                  <button
                    type="button"
                    className="upload-btn dicebear-btn sparkles-btn"
                    onClick={() => setIsGeneratorOpen(true)}
                    title="Personnaliser"
                  >
                    <Sparkles size={16} />
                  </button>
                  <button
                    type="button"
                    className="upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  </button>
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

          <div className="form-row-box no-bg">
            <div className="form-group full-width">
              <label>Signature du forum (250 car. max)</label>
              <BBCodeEditor
                name="signature"
                defaultValue={user.signature || ""}
                maxLength={250}
                rows={4}
                onChange={(val) => setFormData(prev => ({ ...prev, signature: val }))}
              />
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
            <input
              type="text"
              value={genSeed}
              onChange={(e) => setGenSeed(e.target.value)}
              placeholder="Ex: votre pseudo"
            />
          </div>

          <div className="gen-styles-grid">
            {DICEBEAR_STYLES.map(style => (
              <button
                key={style.id}
                className={`style-item ${genStyle === style.id ? 'active' : ''}`}
                onClick={() => setGenStyle(style.id)}
              >
                <img src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=preview`} alt={style.label} />
                <span>{style.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <style jsx>{`
            .upload-btn.dicebear-btn {
                background: rgba(255, 255, 255, 0.05);
                color: #aaa;
                padding: 0 10px;
            }
            .upload-btn.dicebear-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }
            .sparkles-btn {
                color: var(--accent) !important;
            }

            .avatar-studio-box {
              display: flex;
              gap: 2.5rem;
              background: rgba(0,0,0,0.2);
              padding: 2rem;
              border-radius: 16px;
              border: 1px solid var(--glass-border);
              margin-bottom: 0.5rem;
            }

            .studio-preview-pane {
              flex-shrink: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 1rem;
              padding-right: 2.5rem;
              border-right: 1px solid rgba(255,255,255,0.05);
            }

            .studio-controls-pane {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 1.5rem;
              justify-content: center;
            }

            .preview-label {
              font-size: 0.65rem;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              color: #555;
              font-weight: 900;
            }
            
            .avatar-gen-modal {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                padding: 0.5rem;
            }
            .gen-preview {
                display: flex;
                justify-content: center;
                background: rgba(0,0,0,0.2);
                padding: 1rem;
                border-radius: 12px;
            }
            .gen-preview img {
                width: 120px;
                height: 120px;
                border-radius: 12px;
                background: white;
            }
            .gen-field {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .gen-field label { font-size: 0.8rem; font-weight: 700; color: #666; text-transform: uppercase; }
            .gen-field input {
                background: rgba(255,255,255,0.05);
                border: 1px solid var(--glass-border);
                padding: 0.8rem;
                border-radius: 8px;
                color: white;
                outline: none;
            }
            .gen-styles-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
            }
            .style-item {
                background: rgba(255,255,255,0.03);
                border: 2px solid transparent;
                padding: 8px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }
            .style-item img { width: 40px; height: 40px; border-radius: 4px; background: white; }
            .style-item span { font-size: 0.75rem; color: #888; font-weight: 600; }
            .style-item:hover { background: rgba(255,255,255,0.08); }
            .style-item.active {
                border-color: var(--accent);
                background: rgba(255, 215, 0, 0.05);
            }
            .style-item.active span { color: var(--accent); }
            
            .form-actions-edit {
                margin-top: 0;
                display: flex;
                justify-content: center;
            }
            .btn-save {
                background: var(--primary);
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
            }
            .btn-save:hover:not(:disabled) {
                background: #d42020;
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(194, 29, 29, 0.3);
            }
            .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        `}</style>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <style jsx>{`
        .profile-edit-container {
          padding: 1.5rem 2rem;
        }
        .section-title {
          margin: 0 0 2rem 0;
          font-size: 1.2rem;
          color: #eee;
        }
        .profile-edit-form {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
        }
        .profile-edit-layout-rows {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
        }
        .form-row-box, .avatar-studio-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          background: rgba(0,0,0,0.18);
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid var(--glass-border);
          width: 100%;
        }
        .form-row-box.no-bg {
          background: transparent;
          border: none;
          padding: 0;
        }
        .avatar-studio-box {
          grid-template-columns: 180px 1fr;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .form-group.full-width {
          grid-column: span 2;
        }
        .form-group label {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #555;
          letter-spacing: 0.05em;
        }
        .avatar-input-group {
          display: flex;
          gap: 0.5rem;
        }
        .upload-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.2rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: #ccc;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .upload-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          color: white;
          border-color: #888;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input, select {
          padding: 0.8rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
          background: rgba(255,255,255,0.03);
          color: white;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }
        input:focus, select:focus {
          border-color: var(--primary);
        }
        .btn-primary {
          padding: 1rem;
          border-radius: 8px;
          background: var(--primary);
          color: white;
          border: none;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }
        .btn-primary:hover {
          background: #d42222;
        }
        .btn-primary:active {
          transform: translateY(1px);
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
