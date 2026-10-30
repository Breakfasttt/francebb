"use client";

/**
 * Formulaire qui envoie ses champs à une action serveur et affiche son refus dans une notification (carte 064).
 *
 * L'action renvoie `{ success: false, error }` (type `ActionResult`) quand elle refuse, et redirige elle-même
 * vers la page suivante quand elle réussit. Les champs saisis restent en place après une erreur : le membre
 * corrige et renvoie, sans tout retaper. S'utilise à la place de `<form action={monAction}>`, y compris depuis
 * une page côté serveur.
 */

import { useTransition, type ComponentProps, type FormEvent } from "react";
import { toast } from "@bbfrance/ui";
import type { ActionResult } from "@/lib/actionResult";

interface ActionFormProps extends Omit<ComponentProps<"form">, "action" | "onSubmit"> {
  /** Action serveur appelée avec les champs du formulaire. */
  action: (formData: FormData) => Promise<ActionResult>;
  /** Message affiché si l'action refuse sans donner de raison. */
  fallbackError?: string;
}

export default function ActionForm({ action, fallbackError = "L'enregistrement a échoué.", ...formProps }: ActionFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Pas d'envoi classique : il viderait les champs, même en cas de refus
    event.preventDefault();
    // Un second clic pendant l'envoi créerait un doublon
    if (isPending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      // Après une réussite, l'action a déjà redirigé : il n'y a parfois aucun résultat à lire
      if (result && !result.success) toast.error(result.error || fallbackError);
    });
  };

  return <form {...formProps} onSubmit={handleSubmit} aria-busy={isPending} />;
}
