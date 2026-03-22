"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/profile/actions";
import Toast from "@/components/Toast";
import BBCodeEditor from "./BBCodeEditor";

interface ProfileEditProps {
  user: any;
}

export default function ProfileEdit({ user }: ProfileEditProps) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    image: user.image || "",
    nafNumber: user.nafNumber || "",
    region: user.region || "",
    league: user.league || "",
    signature: user.signature || "",
  });
  
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    startTransition(async () => {
      try {
        const result = await updateProfile(data);
        if (result.success) {
          setToast({ message: "Profil mis à jour !", type: "success" });
        }
      } catch (err) {
        setToast({ message: "Erreur lors de la mise à jour", type: "error" });
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
            <input name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
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
