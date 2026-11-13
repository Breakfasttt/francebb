"use client";

/**
 * Champs de formulaire de la refonte : libellé, champ texte, zone de texte et liste déroulante native.
 * Hauteur tactile de 44 px et texte à 16 px (évite le zoom automatique de l'iPhone au focus).
 * Police du site imposée sur chaque champ : sans elle, le navigateur écrit une zone de texte en police à chasse fixe
 * (toutes les lettres de la même largeur), là où le preflight de Tailwind n'est pas actif (carte 101).
 * « use client » : `Field` transmet l'état du champ par un contexte React (carte 194), qui n'existe que dans le
 * navigateur. Les pages serveur peuvent toujours afficher ces composants.
 */
import * as React from "react";
import { cn } from "./cn";

const control =
  "w-full rounded-bb-md border border-bb-border bg-bb-surface-2 px-3 font-bb-sans text-base text-bb-text placeholder:text-bb-text-muted focus-visible:border-bb-focus focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-bb-focus disabled:opacity-60";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-sm font-semibold text-bb-text", className)} {...props} />;
}

/**
 * Ce que `Field` transmet au champ qu'il contient (carte 194) : l'identifiant du texte d'aide ou d'erreur,
 * et si le champ est en erreur. Le champ en tire `aria-describedby` (le lecteur d'écran lit ce texte en arrivant
 * sur le champ) et `aria-invalid` (il annonce « invalide »). Hors d'un `Field`, rien n'est ajouté.
 */
const FieldContext = React.createContext<{ messageId?: string; invalid: boolean }>({ invalid: false });

/**
 * Attributs d'accessibilité venus du `Field` parent ; ceux passés directement au champ restent prioritaires.
 * À poser aussi sur un champ qui n'est pas un `Input`, `Textarea` ou `Select` (éditeur BBCode…).
 */
export function useFieldAria(props: { "aria-describedby"?: string; "aria-invalid"?: React.AriaAttributes["aria-invalid"] }) {
  const { messageId, invalid } = React.useContext(FieldContext);
  return {
    "aria-describedby": props["aria-describedby"] ?? messageId,
    "aria-invalid": props["aria-invalid"] ?? (invalid || undefined),
  };
}

// Bord rouge d'un champ en erreur
const invalidControl = "aria-invalid:border-bb-danger";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(control, invalidControl, "min-h-11", className)} {...props} {...useFieldAria(props)} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(control, invalidControl, "min-h-28 py-2.5 leading-relaxed", className)} {...props} {...useFieldAria(props)} />;
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  const aria = useFieldAria(props);
  // Brique de base partagée : c'est elle que la règle demande d'utiliser à la place d'une <select> native
  // eslint-disable-next-line react/forbid-elements
  return <select className={cn(control, invalidControl, "min-h-11 cursor-pointer [color-scheme:var(--bb-scheme)]", className)} {...props} {...aria} />;
}

/**
 * Bloc libellé + champ + aide ou erreur, empilés.
 * `error` affiche l'erreur de saisie juste sous le champ, à la place de l'aide, et la relie au champ pour les
 * lecteurs d'écran (carte 194) : une erreur de saisie s'affiche ici, pas dans une notification.
 */
export function Field({ label, htmlFor, hint, error, className, children }: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const messageId = error || hint ? `${htmlFor}-message` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      <FieldContext.Provider value={{ messageId, invalid: !!error }}>{children}</FieldContext.Provider>
      {error ? (
        <p id={messageId} role="alert" className="m-0 text-sm text-bb-danger-text">{error}</p>
      ) : hint ? (
        <p id={messageId} className="m-0 text-sm text-bb-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
