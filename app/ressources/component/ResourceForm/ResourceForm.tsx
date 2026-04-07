"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, Link as LinkIcon, Image as ImageIcon, Send } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { siteConfig } from "@/lib/siteConfig";
import "./ResourceForm.css";

interface ResourceFormProps {
  initialData?: {
    title: string;
    description: string;
    imageUrl?: string | null;
    link: string;
    tags: string[];
  };
  onSubmit: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  isSubmitting: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

export default function ResourceForm({ 
  initialData, 
  onSubmit, 
  isSubmitting, 
  submitLabel = "Soumettre la ressource",
  onCancel
}: ResourceFormProps) {
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${siteConfig.api.imgbb.apiKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setImageUrl(data.data.url);
      } else {
        alert("Erreur lors de l'upload: " + (data.error?.message || "Inconnue"));
      }
    } catch (error) {
      alert("Erreur réseau lors de l'upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form 
      action={async (formData) => {
        await onSubmit(formData);
      }} 
      className="resource-form"
    >
      <PremiumCard className="form-card">
        <div className="form-group">
          <label htmlFor="title">Titre de la ressource</label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={initialData?.title}
            placeholder="Ex: Blood Bowl Team Builder"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Courte description 
            <span className={`char-count ${description.length > 200 ? 'danger' : ''}`}>
              ({description.length}/200)
            </span>
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value.substring(0, 200))}
            placeholder="Décrivez brièvement l'utilité de cette ressource..."
            required
            className="form-textarea"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="link">Lien vers la ressource (URL)</label>
          <div className="input-with-icon">
            <LinkIcon size={18} className="input-icon" />
            <input
              type="url"
              id="link"
              name="link"
              defaultValue={initialData?.link}
              placeholder="https://..."
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">URL de l'image (optionnel)</label>
          <div className="input-with-action">
            <div className="input-with-icon flex-1">
              <ImageIcon size={18} className="input-icon" />
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://.../image.png"
                className="form-input"
              />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
              accept="image/*" 
            />
            <button
              type="button"
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              <span>{isUploading ? "..." : "Upload"}</span>
            </button>
          </div>
          <p className="form-hint">Vous pouvez uploader une image directement sur ImgBB ou coller une URL.</p>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (séparés par des virgules)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            defaultValue={initialData?.tags.join(", ")}
            placeholder="Ex: Équipes, Calendrier, Tournoi"
            className="form-input"
          />
        </div>

        <div className="form-actions">
          {onCancel && (
            <button type="button" className="cancel-form-btn" onClick={onCancel}>
              Annuler
            </button>
          )}
          <button type="submit" className="submit-form-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 size={20} className="animate-spin" /> Traitement...</>
            ) : (
              <><Send size={20} /> {submitLabel}</>
            )}
          </button>
        </div>
      </PremiumCard>
    </form>
  );
}
