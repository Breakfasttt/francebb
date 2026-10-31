/**
 * Formulaire de modification d'une question (`/bbquizz/editer?edit=…`) : envoie les changements à l'action
 * `updateQuizQuestion`, puis ramène à la liste des questions.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@bbfrance/ui";
import QuizForm, { type QuizFormData } from "../component/QuizForm";
import { updateQuizQuestion } from "../actions";

interface EditQuestionProps {
  question: {
    id: string;
    category: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export default function EditQuestion({ question }: EditQuestionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (formData: QuizFormData) => {
    setIsLoading(true);
    const res = await updateQuizQuestion(question.id, formData);
    setIsLoading(false);

    if (res) {
      toast.success("Question mise à jour");
      router.push("/bbquizz/editer");
      router.refresh();
    } else {
      toast.error("Une erreur est survenue");
    }
  };

  return (
    <QuizForm
      initialData={question}
      submitLabel="Enregistrer les modifications"
      shortSubmitLabel="Enregistrer"
      cancelHref="/bbquizz/editer"
      note="La question modifiée est utilisée dès la prochaine partie, sans nouvelle validation."
      onSubmit={handleUpdate}
      isLoading={isLoading}
    />
  );
}
