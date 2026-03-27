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
    <PremiumCard className="fade-in" style={{ padding: '2rem', border: '1px solid rgba(239,68,68,0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: '#ef4444' }}>
        <OctagonAlert size={32} />
        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Zone de Danger Absolu</h3>
      </div>
      
      <p style={{ color: '#aaa', lineHeight: 1.6, marginBottom: '2rem' }}>
        Vous êtes sur le point d'accéder à la fonction de <strong style={{color:"white"}}>Remise à Zéro Totale</strong> du site. 
        Cette action n'est pas un nettoyage du cache. C'est la suppression de <strong>tout le contenu et de tous les utilisateurs</strong> (sauf vous).
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
        .nuke-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1rem 2rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 800;
          font-size: 1rem;
          text-transform: uppercase;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }
        .nuke-btn:hover {
          background: #dc2626;
          box-shadow: 0 0 40px rgba(239, 68, 68, 0.8);
          transform: scale(1.05);
        }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
        }

        .nuke-modal {
          background: #111;
          border: 2px solid #ef4444;
          border-radius: 12px;
          padding: 2.5rem;
          width: 90%;
          max-width: 600px;
          box-shadow: 0 0 50px rgba(239, 68, 68, 0.2);
        }

        .nuke-title {
          color: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-top: 0;
          margin-bottom: 2rem;
        }

        .nuke-checklist {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #eee;
          font-size: 1rem;
          cursor: pointer;
          user-select: none;
        }
        
        .checkbox-container input { width: 20px; height: 20px; accent-color: #ef4444; cursor: pointer; }

        .nuke-input-group {
          background: rgba(239, 68, 68, 0.05);
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px dashed rgba(239, 68, 68, 0.3);
          margin-bottom: 2rem;
        }
        
        .nuke-input-group p { margin-top: 0; color: #ccc; }

        .nuke-input {
          width: 100%;
          background: rgba(0,0,0,0.5);
          border: 1px solid #ef4444;
          color: #ef4444;
          font-weight: 800;
          font-size: 1.2rem;
          padding: 1rem;
          border-radius: 4px;
          text-align: center;
          letter-spacing: 2px;
        }

        .nuke-actions {
          display: flex;
          gap: 1rem;
        }

        .cancel-btn {
          flex: 1;
          padding: 1.2rem;
          background: #333;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }
        
        .confirm-nuke-btn {
          flex: 2;
          padding: 1.2rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .confirm-nuke-btn:disabled {
          background: #444;
          color: #888;
          cursor: not-allowed;
        }

        .confirm-nuke-btn:not(:disabled):hover {
          background: #b91c1c;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </PremiumCard>
  );
}
