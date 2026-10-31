"use client";

/**
 * Réglages de la liste des ressources `/ressources` (refonte, carte 096, ADR 0006), sur le modèle de `/tournois`,
 * `/ligues` et `/articles` :
 * - `ResourceFilterAside` : la colonne « Filtres » de l'ordinateur (tags, « Réinitialiser ») ;
 * - `ResourceListControls` : la barre au-dessus des résultats (recherche dans le titre et la description, bouton
 *   « Filtres » du téléphone, affichage en grille ou en liste), les pastilles des tags choisis, chacune avec une croix
 *   qui retire ce tag, et le panneau « Filtrer les ressources » du téléphone.
 * Contrairement aux articles, ces réglages ne sont pas écrits dans l'adresse de la page : la liste est chargée dans la
 * page par l'action serveur `getResources`, comme avant la refonte. La page garde l'état et le passe à ces composants.
 * Avant la refonte, ces réglages étaient dans une colonne `ResourceFilterSidebar`, rangée sur téléphone derrière le
 * bouton flottant de `MobileFilterWrapper`.
 */
import { useState, type ReactNode } from "react";
import { LayoutGrid, LayoutList, Search, SlidersHorizontal, X } from "lucide-react";
import { Button, CountBadge, Input, Label, Sheet, SheetContent, cn } from "@bbfrance/ui";
import TagSelector from "@/common/components/TagSelector/TagSelector";

export type ResourceView = "grid" | "list";

interface TagFilterProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: string[];
}

/** Le filtre par tags. `prefix` rend l'identifiant du champ unique (colonne ou panneau). */
function TagFilter({ prefix, tags, onTagsChange, availableTags }: TagFilterProps & { prefix: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`${prefix}-tag`}>Tags</Label>
      <TagSelector
        id={`${prefix}-tag`}
        aria-label="Rechercher par tag"
        value={tags}
        onChange={onTagsChange}
        suggestions={availableTags}
        placeholder="Ex : Outil, Guide…"
      />
      <p className="m-0 text-sm text-bb-text-muted">Une ressource qui porte l&apos;un des tags choisis est affichée.</p>
    </div>
  );
}

/** Colonne des filtres de l'ordinateur (masquée sur téléphone, où le panneau « Filtrer les ressources » la remplace). */
export function ResourceFilterAside(props: TagFilterProps) {
  return (
    <aside aria-label="Filtres des ressources" className="hidden lg:block">
      <div className="sticky top-20 flex flex-col gap-4 rounded-bb-lg border border-bb-border bg-bb-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="m-0 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">Filtres</h2>
          <Button type="button" variant="quiet" size="tap" className="px-2 text-sm" disabled={props.tags.length === 0} onClick={() => props.onTagsChange([])}>
            Réinitialiser
          </Button>
        </div>
        <TagFilter prefix="aside" {...props} />
      </div>
    </aside>
  );
}

interface ResourceListControlsProps extends TagFilterProps {
  total: number;
  query: string;
  onQueryChange: (query: string) => void;
  view: ResourceView;
  onViewChange: (view: ResourceView) => void;
}

export function ResourceListControls({ total, query, onQueryChange, view, onViewChange, ...tagProps }: ResourceListControlsProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { tags, onTagsChange } = tagProps;

  const viewButton = (value: ResourceView, label: string, icon: ReactNode) => (
    <Button
      type="button"
      variant="quiet"
      size="tap-icon"
      aria-label={label}
      aria-pressed={view === value}
      title={label}
      onClick={() => onViewChange(value)}
      className={cn("rounded-[10px]", view === value && "bg-bb-surface-2 text-bb-text")}
    >
      {icon}
    </Button>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bb-text-muted" />
          <Input
            type="text"
            aria-label="Rechercher une ressource (titre ou description)"
            placeholder="Rechercher un outil, un guide…"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            enterKeyHint="search"
            className="pl-10"
          />
        </div>
        <div className="flex min-w-0 items-center gap-2">
          {/* Téléphone : les tags sont dans un panneau */}
          <Button type="button" variant="secondary" size="tap" className="shrink-0 px-3 lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={18} aria-hidden="true" />
            Filtres
            <CountBadge count={tags.length} aria-label={`${tags.length} actif${tags.length > 1 ? "s" : ""}`} />
          </Button>
          <div role="group" aria-label="Affichage" className="ml-auto flex shrink-0 rounded-bb-md border border-bb-border bg-bb-surface p-0.5">
            {viewButton("grid", "Affichage en grille", <LayoutGrid size={18} aria-hidden="true" />)}
            {viewButton("list", "Affichage en liste", <LayoutList size={18} aria-hidden="true" />)}
          </div>
        </div>
      </div>

      {tags.length > 0 && (
        <ul aria-label="Filtres actifs" className="m-0 flex list-none flex-wrap gap-2 p-0">
          {tags.map((tag) => (
            <li key={tag} className="min-w-0 max-w-full">
              <Button
                type="button"
                variant="quiet"
                aria-label={`Retirer le filtre Tag : ${tag}`}
                onClick={() => onTagsChange(tags.filter((item) => item !== tag))}
                className="min-h-11 max-w-full gap-1.5 rounded-full border border-bb-border bg-bb-surface-2 py-1 pr-2 pl-3 text-sm font-semibold text-bb-text hover:border-bb-text-muted lg:min-h-9"
              >
                <span className="min-w-0 truncate">Tag : {tag}</span>
                <X size={16} aria-hidden="true" className="shrink-0 text-bb-text-muted" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent title="Filtrer les ressources">
          <div className="flex flex-col gap-4 pt-2">
            <TagFilter prefix="sheet" {...tagProps} />
            <div className="flex gap-2 border-t border-bb-border pt-3 pb-1">
              <Button type="button" variant="secondary" size="tap" disabled={tags.length === 0} onClick={() => onTagsChange([])}>
                Réinitialiser
              </Button>
              <Button type="button" variant="primary" size="tap" className="flex-1" onClick={() => setFiltersOpen(false)}>
                Voir {total} ressource{total > 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
