"use client";

import React, { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteArticle } from "@/app/articles/actions";
import toast from "react-hot-toast";

interface DeleteArticleButtonProps {
  articleId: string;
}

export default function DeleteArticleButton({ articleId }: DeleteArticleButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Voulez-vous vraiment supprimer cet article de façon définitive ?")) {
      startTransition(async () => {
        const result = await deleteArticle(articleId);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Article supprimé avec succès.");
          // Le redirect est géré par l'action ou par NextJS si on utilise redirect() dans l'action, 
          // mais ici on a un return dans deleteArticle.
          // On peut forcer une redirection si besoin, mais l'action fait déjà un redirect ou un revalidate.
          // En fait deleteArticle fait un revalidatePath.
          window.location.href = "/articles";
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      className="action-button delete" 
      disabled={isPending}
      title="Supprimer définitivement cet article"
    >
      <Trash2 size={18} /> {isPending ? "Suppression..." : "Supprimer"}
    </button>
  );
}
