"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { markAllTopicsAsRead } from "@/app/forum/actions";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import Modal from "@/common/components/Modal/Modal";
import ClassicButton from "@/common/components/Button/ClassicButton";

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
      <ClassicButton
        onClick={() => setIsConfirming(true)}
        style={{ color: 'var(--text-muted)', cursor: 'pointer', height: '100%' }}
        icon={CheckCheck}
      />
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
