"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, ShieldAlert, Loader2 } from "lucide-react";
import { createReportAction } from "@/app/moderation/actions";
import { toast } from "react-hot-toast";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import ClassicButton from "@/common/components/Button/ClassicButton";
import DangerButton from "@/common/components/Button/DangerButton";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: string;
  itemTitle?: string;
}

const REPORT_REASONS = [
  "Spam / Publicité",
  "Harcèlement / Insultes",
  "Contenu inapproprié / NSFW",
  "Bot",
  "Autre (préciser ci-dessous)"
];

export default function ReportModal({ isOpen, onClose, targetId, targetType, itemTitle }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = () => {
    if (!reason) {
      toast.error("Veuillez choisir une raison");
      return;
    }

    startTransition(async () => {
      const res = await createReportAction({
        reason,
        details,
        targetId,
        targetType
      });

      if (res.success) {
        toast.success("Signalement envoyé à l'équipe");
        onClose();
        setReason("");
        setDetails("");
      } else {
        toast.error(res.error || "Une erreur est survenue");
      }
    });
  };

  return createPortal(
    <div className="modal-overlay">
      <PremiumCard className="report-modal">
        <div className="modal-header">
          <div className="title-with-icon">
            <ShieldAlert size={20} color="var(--primary)" />
            <h3>Signaler un contenu</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
            Vous signalez : <strong style={{ color: 'var(--primary)' }}>{itemTitle || `${targetType} (${targetId.substring(0, 8)})`}</strong>
          </p>

          <div className="form-group">
            <label>Raison du signalement</label>
            <div className="reasons-grid">
              {REPORT_REASONS.map((r) => (
                <button 
                  key={r} 
                  className={`reason-btn ${reason === r ? 'active' : ''}`}
                  onClick={() => setReason(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>Précisions optionnelles</label>
            <textarea 
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Détaillez votre signalement si nécessaire..."
              rows={3}
              className="report-textarea"
            />
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <ClassicButton onClick={onClose} disabled={isPending}>
            Annuler
          </ClassicButton>
          <DangerButton onClick={handleSubmit} isLoading={isPending}>
            Envoyer le signalement
          </DangerButton>
        </div>
      </PremiumCard>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1.5rem;
        }
        :global(.report-modal) {
          width: 100%;
          max-width: 550px;
          padding: 2rem !important;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .title-with-icon {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: 0.2s;
        }
        .close-btn:hover { color: var(--text); transform: rotate(90deg); }
        h3 { margin: 0; font-size: 1.4rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        label { display: block; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--primary); margin-bottom: 0.8rem; opacity: 0.9; }
        
        .reasons-grid {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .reason-btn {
          text-align: left;
          padding: 0.8rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: var(--text);
          cursor: pointer;
          transition: 0.2s;
          font-size: 0.95rem;
        }
        .reason-btn:hover { background: rgba(255, 255, 255, 0.08); border-color: var(--primary); }
        .reason-btn.active { background: var(--primary-transparent); border-color: var(--primary); color: var(--primary); font-weight: 700; }
        
        .report-textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 0.8rem;
          color: var(--text);
          font-family: inherit;
          resize: none;
        }
        .report-textarea:focus { outline: none; border-color: var(--primary); background: rgba(0, 0, 0, 0.4); }

        :global(.danger-btn) {
          background: var(--danger) !important;
          color: white !important;
        }
        :global(.danger-btn:hover) {
          filter: brightness(1.2) !important;
          box-shadow: 0 4px 12px rgba(255, 68, 68, 0.4) !important;
        }
      `}</style>
    </div>,
    document.body
  );
}
