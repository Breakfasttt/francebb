"use client";

import { useState, useTransition } from "react";
import Modal from "@/common/components/Modal/Modal";
import { updateTopicTitle } from "@/app/forum/actions";
import TitleInputWithSmiley from "@/app/forum/component/TitleInputWithSmiley";
import ClassicButton from "@/common/components/Button/ClassicButton";
import AdminButton from "@/common/components/Button/AdminButton";

interface EditTopicTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  initialTitle: string;
}

export default function EditTopicTitleModal({ isOpen, onClose, topicId, initialTitle }: EditTopicTitleModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTitle = formData.get("title") as string;

    if (!newTitle.trim()) return;

    startTransition(async () => {
      try {
        await updateTopicTitle(topicId, newTitle);
        onClose();
      } catch (error) {
        alert(error instanceof Error ? error.message : "Erreur lors de la modification");
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le titre du sujet">
      <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
        <p style={{ marginBottom: '1rem', color: '#888', fontSize: '0.9rem' }}>
          Entrez le nouveau titre pour ce sujet :
        </p>
        
        <TitleInputWithSmiley initialValue={initialTitle} name="title" />

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <ClassicButton type="button" onClick={onClose}>
            Annuler
          </ClassicButton>
          <AdminButton 
            type="submit"
            isLoading={isPending}
          >
            Enregistrer
          </AdminButton>
        </div>
      </form>
    </Modal>
  );
}
