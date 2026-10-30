/**
 * Surfaces de la refonte (ADR 0006) : carte pleine (sans verre dépoli par défaut) et ligne de liste cliquable.
 * `glass` active le verre dépoli seulement si le thème le permet (variable --bb-glass-blur).
 */
import * as React from "react";
import { cn } from "./cn";

export function Card({ className, glass, ...props }: React.ComponentProps<"div"> & { glass?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-bb-lg border border-bb-border bg-bb-surface text-bb-text",
        glass && "backdrop-blur-[var(--bb-glass-blur)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-2 border-b border-bb-border px-4 py-3", className)} {...props} />;
}

/** Titre de carte : sobre (ni majuscules ni italique hérités de l'ancien CSS des titres). */
export function CardTitle({ className, as: Tag = "h2", ...props }: React.ComponentProps<"h2"> & { as?: "h2" | "h3" | "h4" }) {
  return <Tag className={cn("m-0 flex-1 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-4", className)} {...props} />;
}

/**
 * Ligne d'une liste (sujet, forum, membre…) : hauteur tactile d'au moins 56 px, séparateur entre les lignes.
 * Le contenu est libre ; le parent fournit le lien ou le bouton qui l'enveloppe.
 */
export function ListRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-h-14 items-start gap-3 border-b border-bb-border px-4 py-3 last:border-b-0", className)}
      {...props}
    />
  );
}
