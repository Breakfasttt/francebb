"use client";

import { useState } from "react";
import { CheckCheck, MessageSquare } from "lucide-react";
import { markAllTopicsAsRead } from "@/app/forum/actions";

export default function MarkAllAsReadButton() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    setIsLoading(true);
    const result = await markAllTopicsAsRead();
    if (result.success) {
      setIsConfirming(false);
    } else {
      alert(result.error || "Une erreur est survenue.");
    }
    setIsLoading(false);
  }

  return (
    <>
      <button 
        className="widget-button" 
        onClick={() => setIsConfirming(true)}
        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ccc', cursor: 'pointer', marginTop: '0.5rem' }}
      >
        <CheckCheck size={18} />
        <span>Tout marquer comme lu</span>
      </button>

      {isConfirming && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--background)',
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid var(--glass-border)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCheck size={20} className="text-secondary" />
              Confirmation
            </h3>
            <p style={{ color: '#ccc', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Êtes-vous sûr de vouloir marquer tous les sujets du forum comme lus ? Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setIsConfirming(false)} 
                disabled={isLoading}
                style={{
                  background: 'transparent',
                  border: '1px solid #444',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                Annuler
              </button>
              <button 
                onClick={handleConfirm} 
                disabled={isLoading}
                style={{
                  background: 'var(--primary)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                {isLoading ? "En cours..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
