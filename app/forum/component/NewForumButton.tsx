"use client";

import { useState } from "react";
import { PlusCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
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
      <Link 
        href={href}
        onClick={handleClick}
        className="widget-button secondary-btn" 
        style={{ background: 'var(--glass-bg)' }}
      >
        <PlusCircle size={18} />
        <span>Nouveau forum</span>
      </Link>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Limite atteinte"
      >
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <AlertCircle size={48} color="var(--primary)" style={{ marginBottom: "1rem" }} />
          <p style={{ color: "var(--foreground)", fontSize: "1.1rem", marginBottom: "1.5rem" }}>
            Le nombre maximum de sous-forums (<strong>{LIMIT}</strong>) a été atteint pour ce forum.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "2rem" }}>
            Veuillez supprimer ou réorganiser les sous-forums existants avant d'en créer un nouveau.
          </p>
          <button 
            onClick={() => setIsModalOpen(false)} 
            className="widget-button" 
            style={{ width: "100%", background: "var(--primary)" }}
          >
            Compris
          </button>
        </div>
      </Modal>
    </>
  );
}
