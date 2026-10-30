"use client";

/**
 * Champ du titre d'un sujet (nouveau sujet, nouveau tournoi, modification du titre) : bouton pour insérer un smiley
 * et aperçu en direct du titre tel qu'il sera affiché (smileys et balises de titre convertis).
 * Le champ garde id="title" : la page l'associe à son libellé « Titre du sujet ». Couleurs de la refonte (carte 087).
 */
import { useRef, useState } from "react";
import { Smile } from "lucide-react";
import { Button, Input, cn } from "@bbfrance/ui";
import { parseInlineBBCode } from "@/lib/bbcode";
import SmileyGrid from "@/common/components/SmileyGrid/SmileyGrid";

interface TitleInputWithSmileyProps {
  initialValue?: string;
  name?: string;
  placeholder?: string;
}

export default function TitleInputWithSmiley({
  initialValue = "",
  name = "title",
  placeholder = "Ex: Rechercher des joueurs, Stratégies Elfes..."
}: TitleInputWithSmileyProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [titleValue, setTitleValue] = useState(initialValue);
  const [isSmileyOpen, setIsSmileyOpen] = useState(false);

  const handleSmileySelect = (code: string) => {
    if (!inputRef.current) return;

    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const currentVal = inputRef.current.value;

    const newVal = currentVal.substring(0, start) + code + currentVal.substring(end);
    inputRef.current.value = newVal;
    setTitleValue(newVal);

    inputRef.current.focus();
    const newPos = start + code.length;
    inputRef.current.setSelectionRange(newPos, newPos);
    setIsSmileyOpen(false); // La grille se referme après le choix
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-stretch gap-2">
        <Button
          type="button"
          variant="secondary"
          size="tap-icon"
          title="Insérer un smiley"
          aria-label="Insérer un smiley dans le titre"
          aria-expanded={isSmileyOpen}
          onClick={() => setIsSmileyOpen(!isSmileyOpen)}
          className={cn("shrink-0", isSmileyOpen && "border-bb-accent-text bg-bb-accent-soft text-bb-accent-text")}
        >
          <Smile size={20} aria-hidden="true" />
        </Button>
        <Input
          type="text"
          id="title"
          name={name}
          required
          ref={inputRef}
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
      </div>

      {isSmileyOpen && (
        <div className="rounded-bb-md border border-bb-border bg-bb-surface p-2">
          <SmileyGrid onSelect={handleSmileySelect} />
        </div>
      )}

      {/* Aperçu du titre en direct */}
      {titleValue && titleValue.trim() !== "" && (
        <div className="rounded-bb-md border-l-4 border-bb-accent bg-bb-accent-soft px-4 py-3 text-bb-text">
          <span className="mb-1 block text-xs font-bold tracking-wide text-bb-text-muted uppercase">Aperçu du titre :</span>
          <div className="text-lg leading-snug font-extrabold break-words">
            <span dangerouslySetInnerHTML={{ __html: parseInlineBBCode(titleValue) }} />
          </div>
        </div>
      )}
    </div>
  );
}
