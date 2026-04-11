"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Upload, Link as LinkIcon, Image as ImageIcon, Send } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import TagSelector from "@/common/components/TagSelector/TagSelector";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import { siteConfig } from "@/lib/siteConfig";
import { getResourceTags } from "../../actions";
import "./ResourceForm.css";
import "./ResourceForm-mobile.css";


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
  isSystem?: boolean;
}

export default function ResourceForm({ 
  initialData, 
  onSubmit, 
  isSubmitting, 
  submitLabel = "Soumettre la ressource",
  onCancel,
  isSystem = false
}: ResourceFormProps) {
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadSuggestions() {
      const allTags = await getResourceTags();
      setSuggestions(allTags);
    }
    loadSuggestions();
  }, []);

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
        // Ajouter les tags au formData avant l'envoi
        formData.set("tags", tags.join(","));
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
            className={`form-input ${isSystem ? 'readonly' : ''}`}
            readOnly={isSystem}
          />
          {isSystem && <p className="form-hint">Le titre d'un outil système ne peut pas être modifié.</p>}
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
              className={`form-input ${isSystem ? 'readonly' : ''}`}
              readOnly={isSystem}
            />
          </div>
          {isSystem && <p className="form-hint">Le lien d'un outil système est fixe.</p>}
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
            <ClassicButton
              type="button"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploading}
              icon={Upload}
              size="sm"
            >
              Upload
            </ClassicButton>
          </div>
          <p className="form-hint">Vous pouvez uploader une image directement sur ImgBB ou coller une URL.</p>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <TagSelector
            value={tags}
            onChange={setTags}
            suggestions={suggestions}
            placeholder={isSystem ? "Les tags système sont verrouillés" : "Ajouter un tag..."}
            className={isSystem ? 'readonly' : ''}
          />
          {isSystem && <p className="form-hint">Les tags système sont gérés par l'administration.</p>}
        </div>

        <div className="form-actions">
          {onCancel && (
            <ClassicButton type="button" onClick={onCancel}>
              Annuler
            </ClassicButton>
          )}
          <CTAButton 
            type="submit" 
            isLoading={isSubmitting}
            icon={Send}
            style={{ minWidth: '220px' }}
          >
            {submitLabel}
          </CTAButton>
        </div>
      </PremiumCard>
    </form>
  );
}
