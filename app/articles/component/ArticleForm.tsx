"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Info, Shield } from "lucide-react";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { createArticle, updateArticle } from "@/app/articles/actions";
import toast from "react-hot-toast";
import LigueSearch from "@/common/components/LigueSearch/LigueSearch";
import TagSelector from "@/common/components/TagSelector/TagSelector";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import "./ArticleForm.css";
import "./ArticleForm-mobile.css";


interface ArticleFormProps {
  initialData?: {
    id?: string;
    title: string;
    content: string;
    tags: string[];
    ligueId?: string | null;
    ligueCustom?: string | null;
  };
  isEdit?: boolean;
}

export default function ArticleForm({ initialData, isEdit = false }: ArticleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [ligueId, setLigueId] = useState(initialData?.ligueId || "");
  const [ligueCustom, setLigueCustom] = useState(initialData?.ligueCustom || "");

  // Charger les suggestions de tags au montage
  React.useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch("/api/articles/tags");
        if (res.ok) {
          const data = await res.json();
          setTagSuggestions(data.map((t: any) => t.name));
        }
      } catch (err) {
        console.error("Failed to fetch tags suggestions:", err);
      }
    }
    fetchTags();
  }, []);

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
    formData.append("tags", tags.join(","));
    formData.append("ligueId", ligueId);
    formData.append("ligueCustom", ligueCustom);

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
          <label htmlFor="tags">Tags de l'article</label>
          <TagSelector 
            value={tags}
            onChange={setTags}
            suggestions={tagSuggestions}
            placeholder="Ex: Stratégie, Guide, Orques..."
          />
          <small className="form-info">
            <Info size={12} /> Appuyez sur Entrée pour ajouter un tag. Les nouveaux tags seront créés automatiquement.
          </small>
        </div>

        <div className="form-group">
          <label>Ligue rattachée (Optionnel)</label>
          <LigueSearch 
            initialCustom={initialData?.ligueCustom}
            placeholder="Rechercher une ligue..."
            onChange={(lid, lcustom) => {
              setLigueId(lid || "");
              setLigueCustom(lcustom || "");
            }}
          />
          <small className="form-info">
            <Shield size={12} /> Liez cet article à une ligue spécifique.
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
          <ClassicButton 
            onClick={() => router.back()}
            disabled={loading}
            icon={<X size={18} />}
          >
            Annuler
          </ClassicButton>
          <CTAButton 
            type="submit" 
            isLoading={loading}
            icon={<Save size={18} />}
          >
            {isEdit ? "Mettre à jour" : "Publier l'article"}
          </CTAButton>
        </div>
      </PremiumCard>
    </form>
  );
}
