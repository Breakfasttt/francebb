"use client";

/**
 * Saisie d'étiquettes (tags), refaite avec les composants de `packages/ui` par la carte 095 (articles, seuls
 * utilisateurs de ce composant). Le coach tape un tag puis appuie sur Entrée (ou sur le bouton « + ») pour l'ajouter ;
 * jusqu'à cinq tags existants qui contiennent la saisie sont proposés sous le champ et s'ajoutent d'un appui. Les tags
 * choisis sont affichés au-dessus du champ, chacun avec une croix pour le retirer ; la touche d'effacement, dans le
 * champ vide, retire le dernier.
 * Toutes les cibles font au moins 44 pixels de haut sur téléphone et le champ est en 16 pixels (pas de zoom
 * automatique de l'iPhone).
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Plus, Tag as TagIcon, X } from "lucide-react";
import { Button, Input, cn } from "@bbfrance/ui";

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
  /** Identifiant du champ, pour le relier à un libellé (`<Label htmlFor>`). */
  id?: string;
  /** Nom du champ lu par les lecteurs d'écran quand il n'a pas de libellé visible. */
  "aria-label"?: string;
}

const EMPTY_ARRAY: string[] = [];

export default function TagSelector({
  value,
  onChange,
  suggestions = EMPTY_ARRAY,
  placeholder = "Ajouter un tag...",
  className,
  id,
  "aria-label": ariaLabel,
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Suggestions : tags existants qui contiennent la saisie et ne sont pas déjà choisis (cinq au plus)
  const typed = inputValue.trim().toLowerCase();
  const filtered = typed
    ? suggestions.filter((tag) => tag.toLowerCase().includes(typed) && !value.includes(tag)).slice(0, 5)
    : [];
  const showSuggestions = open && filtered.length > 0;

  // Un appui ailleurs ferme la liste des suggestions
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInputValue("");
    setOpen(false);
  };

  const removeTag = (tag: string) => onChange(value.filter((item) => item !== tag));

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag(inputValue);
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative flex w-full flex-col gap-2", className)}>
      {value.length > 0 && (
        <ul aria-label="Tags choisis" className="m-0 flex list-none flex-wrap gap-2 p-0">
          {value.map((tag) => (
            <li key={tag} className="min-w-0 max-w-full">
              <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-bb-accent-text bg-bb-accent-soft py-0.5 pr-0.5 pl-3 text-sm font-semibold text-bb-accent-text">
                <span className="min-w-0 truncate">{tag}</span>
                <Button
                  type="button"
                  variant="quiet"
                  size="tap-icon"
                  aria-label={`Retirer le tag ${tag}`}
                  title="Retirer le tag"
                  onClick={() => removeTag(tag)}
                  className="size-11 shrink-0 rounded-full text-bb-accent-text lg:size-8 lg:min-h-8 lg:min-w-8"
                >
                  <X size={16} aria-hidden="true" />
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <TagIcon size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bb-text-muted" />
        <Input
          id={id}
          type="text"
          aria-label={ariaLabel}
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          enterKeyHint="done"
          autoComplete="off"
          className={cn("pl-10", inputValue.trim() && "pr-12")}
        />
        {inputValue.trim() && (
          <Button
            type="button"
            variant="quiet"
            size="tap-icon"
            aria-label="Ajouter ce tag"
            title="Ajouter ce tag"
            onClick={() => addTag(inputValue)}
            className="absolute top-0 right-0 text-bb-accent-text"
          >
            <Plus size={18} aria-hidden="true" />
          </Button>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-bb-md border border-bb-border bg-bb-surface p-1 shadow-bb">
          <p className="m-0 px-3 pt-1 pb-1 text-xs font-semibold text-bb-text-muted">Tags existants</p>
          {filtered.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant="quiet"
              size="tap"
              onClick={() => addTag(tag)}
              className="w-full justify-start px-3 font-normal text-bb-text"
            >
              <TagIcon size={16} aria-hidden="true" className="text-bb-text-muted" />
              {tag}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
