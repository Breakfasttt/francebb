"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteForum } from "@/app/forum/actions";
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
      <button 
        onClick={() => setIsModalOpen(true)}
        className="widget-button" 
        style={{ background: '#333', color: '#ff4444', border: '1px solid #ff4444' }}
      >
        <Trash2 size={18} />
        <span>Supprimer forum</span>
      </button>

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
