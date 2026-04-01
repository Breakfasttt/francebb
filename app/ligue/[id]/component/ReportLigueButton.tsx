"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import ReportModal from "@/common/components/ReportModal/ReportModal";

interface ReportLigueButtonProps {
  ligueId: string;
  ligueName: string;
}

export default function ReportLigueButton({ ligueId, ligueName }: ReportLigueButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button className="btn-report" onClick={() => setShowModal(true)}>
        <AlertTriangle size={16} /> Signaler la ligue
      </button>

      <ReportModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        targetId={ligueId}
        targetType="LIGUE"
        itemTitle={ligueName}
      />
      
      <style jsx>{`
        .btn-report {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          background: rgba(var(--danger-rgb, 194, 29, 29), 0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          padding: 0.8rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-report:hover {
          background: rgba(var(--danger-rgb, 194, 29, 29), 0.1);
          border-color: var(--danger);
          color: var(--danger);
          transform: translateY(-1px);
        }
      `}</style>
    </>
  );
}
