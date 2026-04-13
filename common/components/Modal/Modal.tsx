"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ClassicButton from "../Button/ClassicButton";
import CTAButton from "../Button/CTAButton";
import DangerButton from "../Button/DangerButton";
import AdminButton from "../Button/AdminButton";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "admin";
  maxWidth?: string;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  children,
  confirmText,
  cancelText,
  variant = "primary",
  maxWidth = "550px"
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const renderConfirmButton = () => {
    if (!onConfirm) return null;

    if (variant === 'danger') {
      return (
        <DangerButton onClick={onConfirm}>
          {confirmText || "Confirmer"}
        </DangerButton>
      );
    }

    if (variant === 'admin') {
      return (
        <AdminButton onClick={onConfirm}>
          {confirmText || "Confirmer"}
        </AdminButton>
      );
    }

    return (
      <CTAButton onClick={onConfirm}>
        {confirmText || "Confirmer"}
      </CTAButton>
    );
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        {message && <p>{message}</p>}
        {children}
        
        <div className="modal-actions">
          <ClassicButton onClick={onClose}>
            {cancelText || "Annuler"}
          </ClassicButton>
          {renderConfirmButton()}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }

        .modal-content {
          background: var(--card-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 2.5rem;
          max-width: ${maxWidth};
          width: 100%;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          animation: modalAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        h2 {
          color: var(--primary);
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          border-bottom: 2px solid var(--primary-transparent);
          padding-bottom: 0.8rem;
          display: inline-block;
        }

        p {
          color: var(--foreground);
          margin-bottom: 2rem;
          line-height: 1.6;
          font-size: 1rem;
          opacity: 0.9;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        @keyframes modalAppear {
          from { transform: scale(0.95) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
}
