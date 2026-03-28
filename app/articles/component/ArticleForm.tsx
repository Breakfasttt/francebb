"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Info } from "lucide-react";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { createArticle, updateArticle } from "@/app/articles/actions";
import toast from "react-hot-toast";
import "./ArticleForm.css";

interface ArticleFormProps {
  initialData?: {
    id?: string;
    title: string;
    content: string;
    tags: string[];
  };
  isEdit?: boolean;
}

export default function ArticleForm({ initialData, isEdit = false }: ArticleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [tags, setTags] = useState(initialData?.tags.join(", ") || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error("Veuillez remplir le titre et le contenu.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("tags", tags);

    try {
      let result;
      if (isEdit && initialData?.id) {
        result = await updateArticle(initialData.id, formData);
        if (result.success) {
          toast.success("Article mis à jour !");
          router.push(`/articles/${initialData.id}`);
        } else {
          toast.error(result.error || "Une erreur est survenue.");
        }
      } else {
        result = await createArticle(formData);
        if (result.success) {
          toast.success("Article publié !");
          router.push(`/articles/${result.id}`);
        } else {
          toast.error(result.error || "Une erreur est survenue.");
        }
      }
    } catch (error) {
      console.error("Form Submit Error:", error);
      toast.error("Une erreur critique est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="article-form">
      <PremiumCard className="form-card">
        <div className="form-group">
          <label htmlFor="title">Titre de l'article</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Guide stratégique - Les Orques au tournoi NAF"
            className="title-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (séparés par des virgules)</label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Ex: Stratégie, Guide, Orques"
            className="tags-input"
          />
          <small className="form-info">
            <Info size={12} /> Les nouveaux tags seront créés automatiquement.
          </small>
        </div>

        <div className="form-group editor-group">
          <label>Contenu</label>
          <BBCodeEditor 
            name="content"
            defaultValue={content} 
            onChange={setContent} 
            placeholder="Rédigez votre article ici..."
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => router.back()}
            disabled={loading}
          >
            <X size={18} /> Annuler
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            <Save size={18} /> 
            {loading ? "Traitement..." : isEdit ? "Mettre à jour" : "Publier l'article"}
          </button>
        </div>
      </PremiumCard>
    </form>
  );
}
