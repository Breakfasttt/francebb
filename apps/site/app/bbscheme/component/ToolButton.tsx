"use client";

/**
 * Bouton d'outil de BBScheme (carte 100) : une icône seule, son nom lu par les lecteurs d'écran et affiché en
 * info-bulle au survol (sur ordinateur). 44 pixels de côté sur téléphone (taille d'une cible au pouce), 40 sur
 * ordinateur, où la barre d'outils doit tenir sur une ligne.
 * `active` fait du bouton un bouton à deux états (outil choisi, option allumée) : l'état est annoncé par
 * `aria-pressed` et affiché sur le fond de la couleur d'accent du thème.
 */
import type { ReactNode } from "react";
import { Button, Tooltip, cn } from "@bbfrance/ui";

interface ToolButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  /** Bouton à deux états : vrai si l'outil ou l'option est choisi. Absent pour une simple action. */
  active?: boolean;
  disabled?: boolean;
  /** Action destructrice (« Tout vider ») : icône en couleur de danger. */
  danger?: boolean;
  className?: string;
}

export default function ToolButton({ label, icon, onClick, active, disabled, danger, className }: ToolButtonProps) {
  return (
    <Tooltip content={label} side="bottom">
      <Button
        type="button"
        variant="quiet"
        size="tap-icon"
        aria-label={label}
        aria-pressed={active === undefined ? undefined : active}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "shrink-0 lg:size-10",
          danger && "text-bb-danger-text",
          active && "bg-bb-accent text-bb-on-accent hover:bg-bb-accent-hover hover:text-bb-on-accent",
          className
        )}
      >
        {icon}
      </Button>
    </Tooltip>
  );
}
