"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, Image as ImageIcon, X } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import Toast from "@/common/components/Toast/Toast";

interface LigueBlasonUploadProps {
  initialImage?: string | null;
  ligueName: string;
}

export default function LigueBlasonUpload({ initialImage, ligueName }: LigueBlasonUploadProps) {
  const [image, setImage] = useState(initialImage || "");
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const IMGBB_API_KEY = siteConfig.api.imgbb.apiKey;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation basique
    if (!file.type.startsWith("image/")) {
      setToast({ message: "Veuillez sélectionner une image valide.", type: "error" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setImage(data.data.url);
        setToast({ message: "Blason uploadé avec succès !", type: "success" });
      } else {
        setToast({ message: `Erreur : ${data.error?.message || "Échec de l'upload"}`, type: "error" });
      }
    } catch (error) {
      setToast({ message: "Erreur lors de l'upload de l'image.", type: "error" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    setImage("");
    setToast({ message: "Blason supprimé (pensez à enregistrer)", type: "success" });
  };

  return (
    <PremiumCard className="blason-upload-card">
      <div className="blason-header">
        <ImageIcon size={20} className="text-primary" />
        <h4>Blason de la Ligue</h4>
      </div>

      <div className="blason-content">
        <div className="blason-preview-container">
          {image ? (
            <div className="blason-preview">
              <img src={image} alt={`Blason ${ligueName}`} />
              <button type="button" className="remove-blason" onClick={removeImage}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="blason-placeholder" onClick={() => fileInputRef.current?.click()}>
              <Upload size={24} className="opacity-20" />
              <span>Cliquer pour uploader</span>
            </div>
          )}
        </div>

        <div className="blason-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
            id="blason-input"
          />
          <button 
            type="button" 
            className="btn-upload-blason"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {image ? "Changer le blason" : "Uploader un blason"}
          </button>
          <p className="blason-hint">Format carré recommandé. PNG ou JPG.</p>
        </div>
      </div>

      <input type="hidden" name="image" value={image} />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <style jsx>{`
        .blason-upload-card {
          padding: 1.5rem !important;
        }
        .blason-header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 1.5rem;
        }
        .blason-header h4 {
          margin: 0;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 800;
        }
        .blason-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        .blason-preview-container {
          width: 150px;
          height: 150px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.2);
          border: 2px dashed var(--glass-border);
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .blason-preview-container:hover {
          border-color: var(--primary-transparent);
        }
        .blason-preview {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .blason-preview img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 0.5rem;
        }
        .remove-blason {
          position: absolute;
          top: 5px;
          right: 5px;
          background: var(--danger);
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .remove-blason:hover {
          opacity: 1;
        }
        .blason-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.8rem;
          color: var(--text-muted);
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .btn-upload-blason {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.6rem 1.2rem;
          background: var(--input-bg);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: var(--foreground);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-upload-blason:hover {
          background: var(--glass-border);
          border-color: var(--primary-transparent);
        }
        .blason-hint {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 0.8rem;
          text-align: center;
        }
        .hidden { display: none; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </PremiumCard>
  );
}
