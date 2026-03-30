"use client";

import React, { useTransition, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteArticle } from "@/app/articles/actions";
import toast from "react-hot-toast";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";

interface DeleteArticleButtonProps {
  articleId: string;
}

export default function DeleteArticleButton({ articleId }: DeleteArticleButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirmDelete = async () => {
    setIsModalOpen(false);
    startTransition(async () => {
      const result = await deleteArticle(articleId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Article supprimé avec succès.");
        window.location.href = "/articles";
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="action-button delete" 
        disabled={isPending}
        title="Supprimer définitivement cet article"
      >
        <Trash2 size={18} /> {isPending ? "Suppression..." : "Supprimer"}
      </button>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'article"
        message="Voulez-vous vraiment supprimer cet article de façon définitive ?"
        confirmLabel="Supprimer"
        isDanger={true}
      />
    </>
  );
}
