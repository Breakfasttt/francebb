"use client";

import { useState, useTransition } from "react";
import Modal from "@/common/components/Modal/Modal";
import { moveTopic } from "@/app/forum/actions";

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
        
        <select
          value={selectedForumId}
          onChange={(e) => setSelectedForumId(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            color: 'white',
            padding: '0.8rem',
            marginBottom: '1.5rem',
            outline: 'none'
          }}
        >
          <option value="" disabled style={{ background: '#1a1a20' }}>Choisir un forum...</option>
          {allForums.map(f => (
            <option key={f.id} value={f.id} style={{ background: '#1a1a20' }}>{f.name}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            className="widget-button secondary-btn"
            style={{ width: 'auto', padding: '0.5rem 1.5rem' }}
          >
            Annuler
          </button>
          <button 
            onClick={handleMove}
            disabled={isPending || !selectedForumId}
            className="widget-button"
            style={{ width: 'auto', padding: '0.5rem 1.5rem' }}
          >
            {isPending ? "Déplacement..." : "Confirmer le déplacement"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
