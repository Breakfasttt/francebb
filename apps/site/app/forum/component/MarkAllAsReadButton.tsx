"use client";

/**
 * Bouton « Tout marquer comme lu » (accueil du forum et liste des non-lus), avec une fenêtre de confirmation.
 * Style de la refonte (ADR 0006, carte 085) ; `className` permet à la colonne latérale de l'élargir.
 */
import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { markAllTopicsAsRead } from "@/app/forum/actions";
import { Button, toast } from "@bbfrance/ui";
import Modal from "@/common/components/Modal/Modal";

export default function MarkAllAsReadButton({ className }: { className?: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    setIsLoading(true);
    const result = await markAllTopicsAsRead();
    if (result.success) {
      setIsConfirming(false);
    } else {
      toast.error(result.error || "Une erreur est survenue.");
    }
    setIsLoading(false);
  }

  return (
    <>
      <Button type="button" variant="secondary" size="tap" onClick={() => setIsConfirming(true)} className={className}>
        <CheckCheck size={18} aria-hidden="true" /> Tout marquer comme lu
      </Button>

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
