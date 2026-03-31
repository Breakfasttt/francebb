"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  isDanger?: boolean;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirmer", isDanger = false }: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '2rem'
    }}>
      <PremiumCard style={{ maxWidth: '400px', width: '100%', padding: '2rem', position: 'relative', textAlign: 'center' }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          background: isDanger ? 'rgba(255, 102, 102, 0.1)' : 'rgba(var(--primary-rgb), 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: isDanger ? '#ff6666' : 'var(--primary)'
        }}>
          <AlertTriangle size={30} />
        </div>

        <h3 style={{ marginBottom: '1rem', color: '#eee' }}>{title}</h3>
        <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '2rem' }}>{message}</p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button type="button" onClick={onClose} className="widget-button secondary-btn" style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>
            Annuler
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            className="widget-button" 
            style={{ 
              width: 'auto', 
              padding: '0.6rem 2rem', 
              background: isDanger ? '#cc3333' : 'var(--primary)', 
              color: 'white', 
              border: 'none',
              fontWeight: 700
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </PremiumCard>
    </div>,
    document.body
  );
}
