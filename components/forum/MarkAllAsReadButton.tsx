"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { markAllTopicsAsRead } from "@/app/forum/actions";
import Modal from "@/components/Modal";

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
      <button 
        className="widget-button" 
        onClick={() => setIsConfirming(true)}
        title="Tout marquer comme lu"
        style={{ width: 'auto', padding: '0.8rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CheckCheck size={18} />
      </button>

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
