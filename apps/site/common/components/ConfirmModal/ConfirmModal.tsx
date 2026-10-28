"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import ClassicButton from "@/common/components/Button/ClassicButton";
import DangerButton from "@/common/components/Button/DangerButton";
import AdminButton from "@/common/components/Button/AdminButton";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  isDanger?: boolean;
  children?: React.ReactNode;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirmer", isDanger = false, children }: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="confirm-modal-overlay">
      <PremiumCard className="confirm-modal-content">
        <div className="confirm-icon-wrapper">
          <AlertTriangle size={30} />
        </div>

        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>

        {children && (
          <div className="confirm-extra-content">
            {children}
          </div>
        )}

        <div className="confirm-actions">
          <ClassicButton type="button" onClick={onClose} className="full-mobile">
            Annuler
          </ClassicButton>
          {isDanger ? (
            <DangerButton 
              type="button" 
              onClick={onConfirm}
              className="full-mobile"
            >
              {confirmLabel}
            </DangerButton>
          ) : (
            <AdminButton 
              type="button" 
              onClick={onConfirm}
              style={{ background: 'var(--primary)', color: 'white', borderColor: 'transparent' }}
              className="full-mobile"
            >
              {confirmLabel}
            </AdminButton>
          )}
        </div>
      </PremiumCard>

      <style jsx>{`
        .confirm-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: var(--z-index-modal-bottom, 8000);
          padding: 1rem;
        }

        :global(.confirm-modal-content) {
          max-width: 400px;
          width: 100%;
          padding: 2rem !important;
          position: relative;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .confirm-icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(var(--primary-rgb, 194, 29, 29), 0.1)'};
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: ${isDanger ? 'var(--danger)' : 'var(--primary)'};
        }

        .confirm-title {
          margin-bottom: 1rem;
          color: var(--foreground);
        }

        .confirm-message {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .confirm-extra-content {
          margin-bottom: 1.5rem;
          text-align: left;
          width: 100%;
        }

        .confirm-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          width: 100%;
        }

        @media (max-width: 600px) {
          .confirm-actions {
            flex-direction: column;
            gap: 0.8rem;
          }
          
          :global(.full-mobile) {
            width: 100% !important;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
