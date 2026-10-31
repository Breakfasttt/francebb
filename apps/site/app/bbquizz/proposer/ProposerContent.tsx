/**
 * Contenu client de la page de proposition d'une question : envoie le formulaire à l'action `suggestQuizQuestion`,
 * puis ramène au jeu.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@bbfrance/ui";
import QuizForm, { type QuizFormData } from "../component/QuizForm";
import { suggestQuizQuestion } from "../actions";

export default function ProposerContent() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: QuizFormData) => {
    setIsLoading(true);
    const res = await suggestQuizQuestion(formData);
    setIsLoading(false);

    if (res) {
      toast.success("Question proposée avec succès ! Merci de votre contribution.");
      router.push("/bbquizz");
    } else {
      toast.error("Une erreur est survenue lors de l'envoi de votre proposition.");
    }
  };

  return (
    <QuizForm
      submitLabel="Envoyer la proposition"
      shortSubmitLabel="Envoyer"
      cancelHref="/bbquizz"
      note="Votre question sera relue par un modérateur avant d'entrer dans le jeu."
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
}
