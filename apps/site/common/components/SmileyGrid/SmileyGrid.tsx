"use client";

/**
 * Grille des smileys du forum (éditeur BBCode et titre d'un sujet). Un appui insère le code texte du smiley
 * (par exemple « :) »), que le site affiche ensuite en émoji. Cases de 44 pixels, la taille d'un pouce (carte 087).
 */
import { Button } from "@bbfrance/ui";
import { smileysMap } from "@/lib/bbcode";

interface SmileyGridProps {
  onSelect: (code: string) => void;
}

export default function SmileyGrid({ onSelect }: SmileyGridProps) {
  return (
    <div className="grid max-h-56 w-full grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-1 overflow-y-auto">
      {Object.entries(smileysMap).map(([code, emoji]) => (
        <Button
          key={code}
          type="button"
          variant="quiet"
          size="tap-icon"
          title={code}
          className="w-full text-2xl font-normal"
          onClick={(e) => {
            e.preventDefault();
            onSelect(code);
          }}
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
}
