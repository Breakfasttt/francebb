"use client";

/**
 * Bouton d'envoi d'un formulaire qui montre que l'envoi est en cours (carte 193).
 *
 * Pendant l'envoi, le bouton est désactivé (un second appui ne renvoie pas le formulaire) et son icône est
 * remplacée par un indicateur de chargement. Il sait que l'envoi est en cours de deux façons :
 * - dans un `ActionForm`, par le contexte `FormPendingContext` que celui-ci fournit ;
 * - dans un `<form action={…}>` classique, par `useFormStatus` de React.
 *
 * L'indicateur ne tourne que si le système du membre n'a pas demandé de réduire les animations (`motion-safe`).
 */

import { createContext, useContext, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@bbfrance/ui";

/** Vaut `true` pendant l'envoi d'un `ActionForm` ; fourni par `ActionForm`, lu par `SubmitButton`. */
export const FormPendingContext = createContext(false);

interface SubmitButtonProps extends Omit<ButtonProps, "type" | "asChild"> {
  /** Icône affichée devant le libellé, remplacée par l'indicateur de chargement pendant l'envoi. */
  icon?: ReactNode;
}

export default function SubmitButton({ icon, children, disabled, variant = "primary", size = "tap", ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const actionFormPending = useContext(FormPendingContext);
  const isSending = pending || actionFormPending;

  return (
    <Button type="submit" variant={variant} size={size} disabled={disabled || isSending} aria-busy={isSending} {...props}>
      {isSending ? <Loader2 size={18} aria-hidden="true" className="motion-safe:animate-spin" /> : icon}
      {children}
    </Button>
  );
}
