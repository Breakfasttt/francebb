"use client";

/**
 * Formulaire de création de forum réactif.
 * Gère la mise à jour dynamique des forums parents et de l'ordre d'insertion
 * en fonction de la catégorie sélectionnée.
 */

import { FolderPlus } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import ClassicButton from "@/common/components/Button/ClassicButton";
import AdminButton from "@/common/components/Button/AdminButton";
import ClassicSelect from "@/common/components/Form/ClassicSelect";
import ActionForm from "@/common/components/Form/ActionForm";
import type { ActionResult } from "@/lib/actionResult";
import "./NewForumForm.css";
import "./NewForumForm-mobile.css";

interface Forum {
  id: string;
  name: string;
  categoryId: string | null;
  parentForumId: string | null;
  order: number;
}

interface Category {
  id: string;
  name: string;
}

interface NewForumFormProps {
  categories: Category[];
  allForums: Forum[];
  initialCategoryId?: string;
  initialParentForumId?: string;
  createAction: (formData: FormData) => Promise<ActionResult>;
}

export default function NewForumForm({ 
  categories, 
  allForums, 
  initialCategoryId, 
  initialParentForumId,
  createAction 
}: NewForumFormProps) {
  const [selectedCat, setSelectedCat] = useState(initialCategoryId || "");
  const [selectedParent, setSelectedParent] = useState(initialParentForumId || "");

  // Forums disponibles comme parents (doivent être dans la même catégorie et être de niveau 1)
  const availableParents = useMemo(() => {
    if (!selectedCat) return [];
    return allForums.filter(f => f.categoryId === selectedCat && !f.parentForumId);
  }, [selectedCat, allForums]);

  // Forums frères (pour choisir "Insérer après")
  const siblings = useMemo(() => {
    if (selectedParent) {
      // Si un parent est sélectionné, les frères sont les enfants de ce parent
      return allForums.filter(f => f.parentForumId === selectedParent);
    }
    if (selectedCat) {
      // Sinon, ce sont les forums racines de la catégorie
      return allForums.filter(f => f.categoryId === selectedCat && !f.parentForumId);
    }
    return [];
  }, [selectedCat, selectedParent, allForums]);

  return (
    <div className="new-forum-card">
      <ActionForm action={createAction} fallbackError="La création du forum a échoué." className="new-forum-form">
        <div className="form-group">
          <label htmlFor="name" className="new-forum-label">Nom du forum</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Ex: Discussions générales, Archives..."
            className="new-forum-field"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="new-forum-label">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Décrivez brièvement le contenu de ce forum"
            className="new-forum-field"
          ></textarea>
        </div>

        <div className="form-group">
          <label className="new-forum-label">Type et Emplacement</label>
          <div className="new-forum-placement">
            <ClassicSelect
              label="Catégorie principale"
              id="categoryId"
              name="categoryId"
              value={selectedCat}
              onChange={(e) => {
                setSelectedCat(e.target.value);
                setSelectedParent(""); // Reset parent quand on change de catégorie
              }}
            >
              <option value="">-- Aucune (Sous-forum) --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </ClassicSelect>

            <ClassicSelect
              label="Forum parent (optionnel)"
              id="parentForumId"
              name="parentForumId"
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
            >
              <option value="">-- Aucun (Top-level) --</option>
              {availableParents.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </ClassicSelect>
          </div>
        </div>

        <ClassicSelect
          label="Insérer après"
          id="afterId"
          name="afterId"
          defaultValue={siblings.length > 0 ? siblings[siblings.length - 1].id : "START"}
          key={`${selectedCat}-${selectedParent}`} // Force le re-render du select quand on change d'endroit
        >
          <option value="START">-- Au début --</option>
          {siblings.map(s => (
            <option key={s.id} value={s.id}>Après: {s.name}</option>
          ))}
        </ClassicSelect>



        <div className="new-forum-actions">
          <AdminButton
            type="submit"
            icon={FolderPlus}
          >
            Créer le forum
          </AdminButton>
          <ClassicButton
            href="/forum"
          >
            Annuler
          </ClassicButton>
        </div>
      </ActionForm>
    </div>
  );
}
