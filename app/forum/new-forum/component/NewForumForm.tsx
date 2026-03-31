"use client";

/**
 * Formulaire de création de forum réactif.
 * Gère la mise à jour dynamique des forums parents et de l'ordre d'insertion
 * en fonction de la catégorie sélectionnée.
 */

import { FolderPlus } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

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
  createAction: (formData: FormData) => Promise<void>;
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
    <div style={{ background: 'var(--card-bg)', backdropFilter: 'blur(10px)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
      <form action={createAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="form-group">
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nom du forum</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Ex: Discussions générales, Archives..."
            style={{ width: '100%', padding: '0.8rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--foreground)' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Décrivez brièvement le contenu de ce forum"
            style={{ width: '100%', padding: '0.8rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--foreground)' }}
          ></textarea>
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600 }}>Type et Emplacement</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="categoryId" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Catégorie principale</label>
              <select
                id="categoryId"
                name="categoryId"
                value={selectedCat}
                onChange={(e) => {
                  setSelectedCat(e.target.value);
                  setSelectedParent(""); // Reset parent quand on change de catégorie
                }}
                style={{ width: '100%', padding: '0.8rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--foreground)' }}
              >
                <option value="">-- Aucune (Sous-forum) --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="parentForumId" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Forum parent (optionnel)</label>
              <select
                id="parentForumId"
                name="parentForumId"
                value={selectedParent}
                onChange={(e) => setSelectedParent(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--foreground)' }}
              >
                <option value="">-- Aucun (Top-level) --</option>
                {availableParents.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="afterId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Insérer après</label>
          <select
            id="afterId"
            name="afterId"
            defaultValue={siblings.length > 0 ? siblings[siblings.length - 1].id : "START"}
            key={`${selectedCat}-${selectedParent}`} // Force le re-render du select quand on change d'endroit
            style={{ width: '100%', padding: '0.8rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--foreground)' }}
          >
            <option value="START">-- Au début --</option>
            {siblings.map(s => (
              <option key={s.id} value={s.id}>Après: {s.name}</option>
            ))}
          </select>
        </div>



        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <button type="submit" className="widget-button" style={{ flex: 1, background: 'var(--primary)', border: 'none', color: 'white', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <FolderPlus size={18} />
            Créer le forum
          </button>
          <Link href="/forum" className="widget-button secondary-btn" style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem' }}>
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
