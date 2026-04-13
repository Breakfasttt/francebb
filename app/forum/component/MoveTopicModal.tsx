"use client";

import { useState, useTransition } from "react";
import Modal from "@/common/components/Modal/Modal";
import { moveTopic } from "@/app/forum/actions";
import ClassicButton from "@/common/components/Button/ClassicButton";
import AdminButton from "@/common/components/Button/AdminButton";
import ClassicSelect from "@/common/components/Form/ClassicSelect";

interface MoveTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  allForums: { id: string; name: string; }[];
}

export default function MoveTopicModal({ isOpen, onClose, topicId, allForums }: MoveTopicModalProps) {
  const [selectedForumId, setSelectedForumId] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleMove = () => {
    if (!selectedForumId) return;
    startTransition(async () => {
      try {
        await moveTopic(topicId, selectedForumId);
        onClose();
      } catch (error) {
        alert(error instanceof Error ? error.message : "Erreur lors du déplacement");
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Déplacer le sujet">
      <div style={{ padding: '1.5rem' }}>
        <p style={{ marginBottom: '1rem', color: '#888', fontSize: '0.9rem' }}>
          Sélectionnez le forum de destination pour ce sujet :
        </p>
        
        <ClassicSelect
          value={selectedForumId}
          onChange={(e) => setSelectedForumId(e.target.value)}
          containerStyle={{ marginBottom: "1.5rem" }}
        >
          <option value="" disabled>Choisir un forum...</option>
          {allForums.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </ClassicSelect>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <ClassicButton onClick={onClose}>
            Annuler
          </ClassicButton>
          <AdminButton 
            onClick={handleMove}
            isLoading={isPending}
            disabled={!selectedForumId}
          >
            Confirmer le déplacement
          </AdminButton>
        </div>
      </div>
    </Modal>
  );
}
