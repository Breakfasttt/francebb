/**
 * Contenu client pour la page de proposition de question.
 */
"use client";

import React, { useState } from "react";
import QuizForm from "../component/QuizForm/QuizForm";
import { suggestQuizQuestion } from "../actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProposerContent() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: any) => {
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
    <div className="proposer-content">
      <QuizForm 
        title="Nouvelle Proposition"
        submitLabel="Envoyer la proposition"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={() => router.push("/bbquizz")}
      />
    </div>
  );
}
