"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteForum } from "@/app/forum/actions";
import Modal from "@/components/Modal";

interface DeleteForumButtonProps {
  forumId: string;
  forumName: string;
}

export default function DeleteForumButton({ forumId, forumName }: DeleteForumButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteForum(forumId);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression.");
      setIsDeleting(false);
      setIsModalOpen(false);
    }
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
        onClose={() => !isDeleting && setIsModalOpen(false)}
        onConfirm={handleDelete}
        title={`Supprimer le forum : ${forumName}`}
        message={`Êtes-vous sûr de vouloir supprimer le forum "${forumName}" ? Cette action est irréversible et supprimera TOUS les sujets et messages associés.`}
      />
    </>
  );
}
