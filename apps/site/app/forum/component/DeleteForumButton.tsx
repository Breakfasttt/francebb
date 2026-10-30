"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteForum } from "@/app/forum/actions";
import { toast } from "@bbfrance/ui";
import Modal from "@/common/components/Modal/Modal";
import DangerButton from "@/common/components/Button/DangerButton";

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
      <DangerButton 
        onClick={() => setIsModalOpen(true)}
        icon={Trash2}
        fullWidth
      >
        Supprimer forum
      </DangerButton>

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
