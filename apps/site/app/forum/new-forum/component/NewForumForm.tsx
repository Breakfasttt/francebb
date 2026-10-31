"use client";

/**
 * Formulaire de création d'un forum, réservé aux modérateurs (refonte, carte 088).
 * Les listes « Forum parent » et « Insérer après » suivent la catégorie choisie : un forum parent est un forum
 * principal de cette catégorie, et « Insérer après » propose les forums qui seront ses voisins dans la liste.
 * Les noms des champs envoyés (name, description, categoryId, parentForumId, afterId) et l'action serveur
 * `createForum` sont ceux d'avant la refonte ; un refus du serveur s'affiche dans une notification (ActionForm).
 */

import { FolderPlus } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Button, Card, Field, Input, Select, Textarea } from "@bbfrance/ui";
import ActionForm from "@/common/components/Form/ActionForm";
import type { ActionResult } from "@/lib/actionResult";

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
    <Card className="p-4 lg:p-6">
      <ActionForm action={createAction} fallbackError="La création du forum a échoué." className="flex flex-col gap-5">
        <Field label="Nom du forum" htmlFor="name">
          <Input type="text" id="name" name="name" required placeholder="Ex : Discussions générales, Archives…" />
        </Field>

        <Field label="Description" htmlFor="description" hint="Une phrase qui dit ce qu'on trouve dans ce forum.">
          <Textarea id="description" name="description" rows={3} placeholder="Décrivez brièvement le contenu de ce forum" className="[font-family:inherit]" />
        </Field>

        <fieldset className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
          <legend className="mb-3 p-0 text-[0.8125rem] font-bold tracking-wider text-bb-text-muted uppercase">Emplacement</legend>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Catégorie principale" htmlFor="categoryId" hint="Sans catégorie, choisissez un forum parent.">
              <Select
                id="categoryId"
                name="categoryId"
                value={selectedCat}
                onChange={(e) => {
                  setSelectedCat(e.target.value);
                  setSelectedParent(""); // Le forum parent dépend de la catégorie : on le remet à zéro
                }}
              >
                <option value="">Aucune (sous-forum)</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>

            <Field label="Forum parent (facultatif)" htmlFor="parentForumId" hint="Laissez « Aucun » pour un forum principal.">
              <Select id="parentForumId" name="parentForumId" value={selectedParent} onChange={(e) => setSelectedParent(e.target.value)}>
                <option value="">Aucun (forum principal)</option>
                {availableParents.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Insérer après" htmlFor="afterId" hint="Position du nouveau forum parmi ses voisins.">
            <Select
              id="afterId"
              name="afterId"
              defaultValue={siblings.length > 0 ? siblings[siblings.length - 1].id : "START"}
              key={`${selectedCat}-${selectedParent}`} // La liste change avec l'emplacement : on repart de sa valeur par défaut
            >
              <option value="START">Au début</option>
              {siblings.map(s => (
                <option key={s.id} value={s.id}>Après : {s.name}</option>
              ))}
            </Select>
          </Field>
        </fieldset>

        <div className="flex flex-col-reverse gap-2 border-t border-bb-border pt-4 sm:flex-row sm:justify-end">
          <Button asChild variant="secondary" size="tap" className="no-underline">
            <Link href="/forum">Annuler</Link>
          </Button>
          <Button type="submit" variant="primary" size="tap">
            <FolderPlus size={18} aria-hidden="true" /> Créer le forum
          </Button>
        </div>
      </ActionForm>
    </Card>
  );
}
