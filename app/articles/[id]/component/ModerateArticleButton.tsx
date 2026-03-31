/**
 * Bouton de modération pour les articles
 * Gère l'ouverture des modales de modération et de restauration
 */
"use client";

import React, { useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { moderateArticle, unmoderateArticle } from "@/app/articles/actions";
import ModerationModal from "@/app/forum/component/ModerationModal";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import toast from "react-hot-toast";

interface ModerateArticleButtonProps {
  articleId: string;
  isModerated: boolean;
  authorName: string;
}

export default function ModerateArticleButton({ 
  articleId, 
  isModerated, 
  authorName 
}: ModerateArticleButtonProps) {
  const [isModModalOpen, setIsModModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const handleModerate = async (reason: string) => {
    const result = await moderateArticle(articleId, reason);
    if (result.success) {
      toast.success("Article modéré avec succès");
      setIsModModalOpen(false);
    } else {
      toast.error(result.error || "Erreur lors de la modération");
    }
  };

  const handleUnmoderate = async () => {
    const result = await unmoderateArticle(articleId);
    if (result.success) {
      toast.success("Modération annulée");
      setIsRestoreModalOpen(false);
    } else {
      toast.error(result.error || "Erreur lors de l'annulation");
    }
  };

  return (
    <>
      {!isModerated ? (
        <button 
          onClick={() => setIsModModalOpen(true)}
          className="action-button moderate"
        >
          <ShieldAlert size={18} /> Modérer l'article
        </button>
      ) : (
        <button 
          onClick={() => setIsRestoreModalOpen(true)}
          className="action-button moderate restore"
          style={{ background: "rgba(46, 125, 50, 0.1)", color: "#2E7D32", borderColor: "#2E7D32" }}
        >
          <ShieldCheck size={18} /> Annuler la modération
        </button>
      )}

      <ModerationModal
        isOpen={isModModalOpen}
        onClose={() => setIsModModalOpen(false)}
        onConfirm={handleModerate}
        authorName={authorName}
      />

      <ConfirmModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={handleUnmoderate}
        title="Annuler la modération"
        message="Voulez-vous vraiment annuler la modération de cet article ? Le contenu original sera à nouveau visible par tous."
        confirmLabel="Restaurer"
      />
    </>
  );
}
