"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import ReportModal from "@/common/components/ReportModal/ReportModal";

interface ReportPostButtonProps {
  postId: string;
  authorName: string;
}

export default function ReportPostButton({ postId, authorName }: ReportPostButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="action-icon-btn"
        title="Signaler ce message"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <AlertTriangle size={16} />
      </button>

      <ReportModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        targetId={postId}
        targetType="POST"
        itemTitle={`Message de ${authorName}`}
      />
    </>
  );
}
