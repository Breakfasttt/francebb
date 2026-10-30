"use client";

/**
 * Bouton « Supprimer le forum » de la colonne du forum (modérateurs), avec une fenêtre de confirmation.
 * La suppression emporte les sous-forums, les sujets et les messages. Style de la refonte (ADR 0006, carte 085).
 */
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteForum } from "@/app/forum/actions";
import { Button, toast } from "@bbfrance/ui";
import Modal from "@/common/components/Modal/Modal";

interface DeleteForumButtonProps {
  forumId: string;
  forumName: string;
}

export default function DeleteForumButton({ forumId, forumName }: DeleteForumButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        // En cas de succès, l'action redirige vers la liste des forums : on n'arrive ici qu'en cas de refus.
        const res = await deleteForum(forumId, forumName);
        if (!res.success) {
          toast.error(res.error || "Erreur lors de la suppression du forum");
          setIsModalOpen(false);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("NEXT_REDIRECT")) return;

        toast.error("Erreur lors de la suppression du forum");
        setIsModalOpen(false);
      }
    });
  };

  return (
    <>
      <Button type="button" variant="danger" size="tap" className="w-full justify-start" onClick={() => setIsModalOpen(true)}>
        <Trash2 size={18} aria-hidden="true" /> Supprimer le forum
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isPending && setIsModalOpen(false)}
        onConfirm={handleDelete}
        title={`Supprimer le forum : ${forumName}`}
        message={`Êtes-vous sûr de vouloir supprimer le forum "${forumName}" ? Cette action est irréversible et supprimera TOUS les sujets et messages associés.`}
      />
    </>
  );
}
