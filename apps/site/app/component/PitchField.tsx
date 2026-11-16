/**
 * Le terrain de Blood Bowl des deux accueils (carte 210), réduit à ses lignes depuis que le fond dessiné a été retiré
 * à la demande du responsable (cartes 214 et 210, 16 novembre 2026) :
 * - `PitchField` est le cadre des deux accueils, sur le fond du thème ;
 * - `END_ZONE` habille un bandeau en en-but : voile de la couleur d'accent, fermé par un trait d'accent ;
 * - `ScrimmageLine` trace la ligne de mêlée : horizontale sur téléphone, verticale sur ordinateur quand on la place
 *   dans une colonne de grille. Son texte facultatif (« contre ») est décoratif.
 * Toutes les couleurs viennent des variables du thème actif.
 */
import * as React from "react";
import { cn } from "@bbfrance/ui";

export function PitchField({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    // overflow-x-clip : la ligne de mêlée, tirée d'un bord à l'autre sur téléphone, ne crée jamais de défilement de côté
    <div className={cn("relative isolate w-full overflow-x-clip", className)}>
      {children}
    </div>
  );
}

/** Bandeau d'en-but : voile d'accent dégradé, fermé par un trait d'accent de 2 pixels. */
export const END_ZONE =
  "bg-[linear-gradient(color-mix(in_srgb,var(--bb-accent)_19%,transparent),color-mix(in_srgb,var(--bb-accent)_7%,transparent))] border-b-2 border-bb-accent";

/**
 * Ligne de mêlée. `vertical` la fait passer à la verticale sur ordinateur (dans une colonne étroite d'une grille) ;
 * elle reste horizontale sur téléphone.
 */
export function ScrimmageLine({ label, vertical = false, className }: { label?: string; vertical?: boolean; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("relative flex min-h-8 items-center justify-center", vertical && "lg:min-h-0", className)}>
      <span className={cn("absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-bb-text/65", vertical && "lg:inset-x-auto lg:inset-y-0 lg:top-0 lg:left-1/2 lg:h-auto lg:w-0.5 lg:-translate-x-1/2 lg:translate-y-0")} />
      {label && (
        <span className={cn("relative rounded-full border border-bb-text/65 bg-bb-bg px-2.5 py-0.5 text-bb-label font-extrabold tracking-[0.14em] text-bb-text uppercase", vertical && "lg:[writing-mode:vertical-rl]")}>
          {label}
        </span>
      )}
    </div>
  );
}
