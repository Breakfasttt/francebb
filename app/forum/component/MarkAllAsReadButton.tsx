"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { markAllTopicsAsRead } from "@/app/forum/actions";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import Modal from "@/common/components/Modal/Modal";

export default function MarkAllAsReadButton() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    setIsLoading(true);
    const result = await markAllTopicsAsRead();
    if (result.success) {
      setIsConfirming(false);
    } else {
      alert(result.error || "Une erreur est survenue.");
    }
    setIsLoading(false);
  }

  return (
    <>
      <Tooltip text="Tout marquer comme lu">
        <button 
          className="widget-button" 
          onClick={() => setIsConfirming(true)}
          style={{ width: 'auto', padding: '0.8rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CheckCheck size={18} />
        </button>
      </Tooltip>

      <Modal
        isOpen={isConfirming}
        onClose={() => !isLoading && setIsConfirming(false)}
        onConfirm={handleConfirm}
        title="Tout marquer comme lu"
        message="Êtes-vous sûr de vouloir marquer tous les sujets du forum comme lus ? Cette action est irréversible."
      />
    </>
  );
}
