/**
 * Champs de formulaire de la refonte : libellé, champ texte, zone de texte et liste déroulante native.
 * Hauteur tactile de 44 px et texte à 16 px (évite le zoom automatique de l'iPhone au focus).
 */
import * as React from "react";
import { cn } from "./cn";

const control =
  "w-full rounded-bb-md border border-bb-border bg-bb-surface-2 px-3 text-base text-bb-text placeholder:text-bb-text-muted focus-visible:border-bb-focus focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-bb-focus disabled:opacity-60";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-sm font-semibold text-bb-text", className)} {...props} />;
}

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(control, "min-h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  // Brique de base partagée : c'est elle que la règle demande d'utiliser à la place d'une <select> native
  // eslint-disable-next-line react/forbid-elements
  return <select className={cn(control, "min-h-11 cursor-pointer [color-scheme:var(--bb-scheme)]", className)} {...props} />;
}

/** Bloc libellé + champ + aide ou erreur, empilés. */
export function Field({ label, htmlFor, hint, error, className, children }: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="m-0 text-sm text-bb-danger-text">{error}</p>
      ) : hint ? (
        <p className="m-0 text-sm text-bb-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
