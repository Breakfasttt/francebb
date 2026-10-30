"use client";

/**
 * Bouton « Nouveau forum » de la colonne du forum (modérateurs). Dans un forum qui a déjà 5 sous-forums, il ouvre
 * la fenêtre « Limite atteinte » au lieu d'aller au formulaire. Style de la refonte (ADR 0006, carte 085).
 */
import { useState } from "react";
import Link from "next/link";
import { PlusCircle, AlertCircle } from "lucide-react";
import { Button } from "@bbfrance/ui";
import Modal from "@/common/components/Modal/Modal";

interface NewForumButtonProps {
  categoryId?: string;
  parentForumId?: string;
  subForumCount: number;
}

export default function NewForumButton({ 
  categoryId, 
  parentForumId, 
  subForumCount 
}: NewForumButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const LIMIT = 5;

  const handleClick = (e: React.MouseEvent) => {
    if (parentForumId && subForumCount >= LIMIT) {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const href = `/forum/new-forum?categoryId=${categoryId || ''}&parentForumId=${parentForumId || ''}`;

  return (
    <>
      <Button asChild variant="secondary" size="tap" className="w-full justify-start">
        <Link href={href} onClick={handleClick}>
          <PlusCircle size={18} aria-hidden="true" /> Nouveau forum
        </Link>
      </Button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Limite atteinte"
      >
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <AlertCircle size={48} aria-hidden="true" className="text-bb-accent-text" />
          <p className="m-0 text-lg text-bb-text">
            Le nombre maximum de sous-forums (<strong>{LIMIT}</strong>) a été atteint pour ce forum.
          </p>
          <p className="m-0 text-sm text-bb-text-muted">
            Veuillez supprimer ou réorganiser les sous-forums existants avant d&apos;en créer un nouveau.
          </p>
          <Button type="button" variant="primary" size="tap" className="w-full" onClick={() => setIsModalOpen(false)}>
            Compris
          </Button>
        </div>
      </Modal>
    </>
  );
}
