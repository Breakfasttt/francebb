"use client";

import { useState, useTransition } from "react";
import { OctagonAlert, Trash2, TriangleAlert } from "lucide-react";
import { resetDatabase } from "../actions";
import Modal from "@/common/components/Modal/Modal";
import toast from "react-hot-toast";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";

export default function ResetTab() {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Les 4 confirmations
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isNukeReady = check1 && check2 && check3 && confirmText === "JE COMPRENDS LES RISQUES";

  const handleNuke = () => {
    startTransition(async () => {
      const res = await resetDatabase(confirmText);
      if (res.success) {
        toast.success("Site réinitialisé ! Que Dieu nous pardonne...");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        toast.error("Échec de la réinitialisation : " + res.error);
        setShowModal(false);
      }
    });
  };

  return (
    <PremiumCard className="fade-in nuke-container" style={{ padding: '2.5rem', border: '1px solid var(--danger-transparent, rgba(239,68,68,0.3))' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem', color: 'var(--danger)' }}>
        <div style={{ background: 'var(--danger-transparent)', padding: '0.8rem', borderRadius: '12px', display: 'flex' }}>
          <OctagonAlert size={32} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Zone de Danger Absolu</h3>
          <p style={{ color: 'var(--danger)', margin: '0.2rem 0 0', fontSize: '0.9rem', opacity: 0.8 }}>Actions irréversibles.</p>
        </div>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem', fontSize: '1rem' }}>
        Vous êtes sur le point d'accéder à la fonction de <strong style={{color:"var(--danger)"}}>Remise à Zéro Totale</strong> du site. 
        Cette action n'est pas un nettoyage du cache. C'est la suppression de <strong style={{color:"var(--foreground)"}}>tout le contenu et de tous les utilisateurs</strong> (sauf vous).
      </p>

      <button 
        onClick={() => {
          setCheck1(false); setCheck2(false); setCheck3(false); setConfirmText("");
          setShowModal(true);
        }}
        className="action-button nuke-btn"
      >
        <Trash2 size={20} />
        INITIALISER LE PROTOCOLE DE PURGE
      </button>

      {/* MODAL GEANTE DE CONFIRMATION */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content nuke-modal">
            <h2 className="nuke-title"><TriangleAlert size={28} /> CONFIRMATION DE DESTRUCTION</h2>
            <div className="nuke-checklist">
              <label className="checkbox-container">
                <input type="checkbox" checked={check1} onChange={e => setCheck1(e.target.checked)} />
                <span className="checkmark"></span>
                Je comprends que tous les messages, MP et sujets seront détruits.
              </label>
              <label className="checkbox-container">
                <input type="checkbox" checked={check2} onChange={e => setCheck2(e.target.checked)} />
                <span className="checkmark"></span>
                Je comprends que tous les coachs vont perdre leurs accès et données (sauf SUPERADMIN).
              </label>
              <label className="checkbox-container">
                <input type="checkbox" checked={check3} onChange={e => setCheck3(e.target.checked)} />
                <span className="checkmark"></span>
                Je confirme avoir fait une sauvegarde au préalable (Back-up complet téléchargé).
              </label>
            </div>

            <div className="nuke-input-group">
              <p>Pour déverrouiller le bouton final, tapez exactement : <br/><strong>JE COMPRENDS LES RISQUES</strong></p>
              <input 
                type="text" 
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="Tapez la phrase ici..."
                className="nuke-input"
              />
            </div>

            <div className="nuke-actions">
              <button 
                onClick={() => setShowModal(false)}
                className="cancel-btn"
                disabled={isPending}
              >
                ANNULER (SÉCURITÉ)
              </button>
              <button 
                onClick={handleNuke}
                className="confirm-nuke-btn"
                disabled={!isNukeReady || isPending}
              >
                {isPending ? "PURGE EN COURS..." : "💥 TOUT DÉTRUIRE DÉFINITIVEMENT"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .nuke-container {
           position: relative;
           overflow: hidden;
        }
        .nuke-btn {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem 2.5rem;
          background: var(--danger, #ef4444);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 800;
          font-size: 1rem;
          text-transform: uppercase;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 20px var(--danger-transparent);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .nuke-btn:hover {
          background: var(--danger-hover, #dc2626);
          box-shadow: 0 15px 40px var(--danger-transparent);
          transform: scale(1.02) translateY(-4px);
        }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
        }

        .nuke-modal {
          background: var(--card-bg, var(--background));
          border: 2px solid var(--danger);
          border-radius: 20px;
          padding: 3rem;
          width: 90%;
          max-width: 650px;
          box-shadow: 0 0 60px var(--danger-transparent);
          position: relative;
          overflow: hidden;
        }
        
        .nuke-modal::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: repeating-linear-gradient(
            45deg,
            var(--danger),
            var(--danger) 10px,
            var(--background) 10px,
            var(--background) 20px
          );
        }

        .nuke-title {
          color: var(--danger);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-top: 0.5rem;
          margin-bottom: 2.5rem;
          font-size: 1.6rem;
          font-weight: 900;
        }

        .nuke-checklist {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          color: var(--text-secondary);
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          user-select: none;
          transition: color 0.2s;
        }
        .checkbox-container:hover { color: var(--foreground); }
        
        .checkbox-container input { width: 22px; height: 22px; accent-color: var(--danger); cursor: pointer; }

        .nuke-input-group {
          background: var(--danger-transparent);
          padding: 1.8rem;
          border-radius: 16px;
          border: 1px dashed var(--danger);
          margin-bottom: 2.5rem;
        }
        
        .nuke-input-group p { margin-top: 0; color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; }

        .nuke-input {
          width: 100%;
          background: var(--glass-bg);
          border: 2px solid var(--danger);
          color: var(--danger);
          font-weight: 900;
          font-size: 1.3rem;
          padding: 1.2rem;
          border-radius: 12px;
          text-align: center;
          letter-spacing: 2px;
          outline: none;
          transition: all 0.2s;
        }
        .nuke-input:focus { box-shadow: 0 0 15px var(--danger-transparent); }

        .nuke-actions {
          display: flex;
          gap: 1.2rem;
        }

        .cancel-btn {
          flex: 1;
          padding: 1.2rem;
          background: var(--glass-bg);
          color: var(--foreground);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cancel-btn:hover { background: var(--primary-transparent); transform: translateY(-2px); }
        
        .confirm-nuke-btn {
          flex: 2;
          padding: 1.2rem;
          background: var(--danger);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 5px 15px var(--danger-transparent);
        }
        
        .confirm-nuke-btn:disabled {
          background: var(--glass-border);
          color: var(--text-muted);
          cursor: not-allowed;
          box-shadow: none;
          opacity: 0.5;
        }
        
        .confirm-nuke-btn:not(:disabled):hover {
          background: var(--danger-hover);
          transform: translateY(-4px);
          box-shadow: 0 10px 25px var(--danger-transparent);
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </PremiumCard>
  );
}
