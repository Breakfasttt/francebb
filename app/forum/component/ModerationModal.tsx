"use client";

import { useState } from "react";
import { X, ShieldAlert, Loader2 } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";

interface ModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  authorName: string;
}

export default function ModerationModal({ isOpen, onClose, onConfirm, authorName }: ModerationModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      onClose();
    } catch (error) {
      alert("Erreur lors de la modération.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
      zIndex: 1000,
      padding: '2rem'
    }}>
      <PremiumCard style={{ maxWidth: '500px', width: '100%', padding: '2rem', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', color: '#ff6666' }}>
          <ShieldAlert size={24} />
          Modérer le message de {authorName}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label htmlFor="reason" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#eee' }}>Raison de la modération</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Contenu inapproprié, irrespectueux, spam..."
              required
              rows={4}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '1rem',
                color: 'white',
                outline: 'none focus:border-var(--primary)'
              }}
            />
          </div>

          <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>
            Le contenu original du message sera masqué pour les membres réguliers, mais restera visible pour vous et l'auteur.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="widget-button secondary-btn" style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !reason.trim()}
              className="widget-button" 
              style={{ width: 'auto', padding: '0.6rem 2rem', background: 'var(--primary)', color: 'white', border: 'none' }}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Confirmer la modération"}
            </button>
          </div>
        </form>
      </PremiumCard>
    </div>
  );
}
