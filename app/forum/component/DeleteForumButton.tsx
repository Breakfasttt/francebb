"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteForum } from "@/app/forum/actions";
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
        await deleteForum(forumId, forumName);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("NEXT_REDIRECT")) return;

        alert(errorMessage);
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
