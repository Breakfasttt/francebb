import { useState, useTransition, useRef } from "react";
import { updateProfile } from "@/app/profile/actions";
import Toast from "@/components/Toast";
import BBCodeEditor from "./BBCodeEditor";
import { siteConfig } from "@/lib/siteConfig";
import { Image as ImageIcon, Loader2, Upload } from "lucide-react";

const IMGBB_API_KEY = siteConfig.api.imgbb.apiKey;

interface ProfileEditProps {
  user: any;
  onUpdate?: () => void;
}

export default function ProfileEdit({ user, onUpdate }: ProfileEditProps) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    image: user.image || "",
    nafNumber: user.nafNumber || "",
    region: user.region || "",
    league: user.league || "",
    signature: user.signature || "",
  });
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    startTransition(async () => {
      try {
        const result = await updateProfile(data);
        if (result.success) {
          showToast("Profil mis à jour !", "success");
          if (onUpdate) onUpdate();
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

        <div className="form-grid">
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

          <div className="form-group full-width">
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
                className="upload-btn" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {isUploading ? "..." : "Upload"}
              </button>
            </div>
          </div>

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

        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Mettre à jour mon profil"}
        </button>
      </form>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <style jsx>{`
        .profile-edit-container {
          padding: 2rem;
        }
        .section-title {
          margin: 0 0 2rem 0;
          font-size: 1.2rem;
          color: #eee;
        }
        .profile-edit-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
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
