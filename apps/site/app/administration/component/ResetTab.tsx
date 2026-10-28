"use client";

import { useState, useTransition } from "react";
import { OctagonAlert, Trash2, TriangleAlert } from "lucide-react";
import { resetDatabase } from "../actions";
import Modal from "@/common/components/Modal/Modal";
import toast from "react-hot-toast";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { useIsMobile } from "@/common/hooks/useIsMobile";

export default function ResetTab() {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isMobile = useIsMobile();

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
        toast.success("Site réinitialisé !");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        toast.error("Échec : " + res.error);
        setShowModal(false);
      }
    });
  };

  return (
    <PremiumCard className="fade-in nuke-container" style={{ padding: isMobile ? '1.5rem' : '2.5rem', border: '1px solid var(--danger-transparent)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem', color: 'var(--danger)', flexDirection: isMobile ? 'column' : 'row', textAlign: isMobile ? 'center' : 'left' }}>
        <div style={{ background: 'var(--danger-transparent)', padding: '0.8rem', borderRadius: '12px', display: 'flex' }}>
          <OctagonAlert size={isMobile ? 24 : 32} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 800 }}>Zone de Danger</h3>
          <p style={{ color: 'var(--danger)', margin: '0.2rem 0 0', fontSize: '0.85rem', opacity: 0.8 }}>Actions irréversibles.</p>
        </div>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem', fontSize: isMobile ? '0.9rem' : '1rem' }}>
        Vous allez <strong style={{color:"var(--danger)"}}>Remettre à Zéro</strong> le site. 
        Suppression de <strong style={{color:"var(--foreground)"}}>tout le contenu</strong>.
      </p>

      <button 
        onClick={() => {
          setCheck1(false); setCheck2(false); setCheck3(false); setConfirmText("");
          setShowModal(true);
        }}
        className="action-button nuke-btn"
        style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
      >
        <Trash2 size={20} />
        {isMobile ? "PURGE TOTALE" : "INITIALISER LE PROTOCOLE DE PURGE"}
      </button>

      {/* MODAL GEANTE DE CONFIRMATION */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content nuke-modal" style={{ padding: isMobile ? '1.5rem' : '3rem' }}>
            <h2 className="nuke-title" style={{ fontSize: isMobile ? '1.2rem' : '1.6rem' }}><TriangleAlert size={isMobile ? 20 : 28} /> PURGE</h2>
            <div className="nuke-checklist" style={{ gap: isMobile ? '1rem' : '1.5rem' }}>
              <label className="checkbox-container" style={{ fontSize: isMobile ? '0.85rem' : '1.05rem' }}>
                <input type="checkbox" checked={check1} onChange={e => setCheck1(e.target.checked)} />
                <span className="checkmark"></span>
                Destruction Messages/MP.
              </label>
              <label className="checkbox-container" style={{ fontSize: isMobile ? '0.85rem' : '1.05rem' }}>
                <input type="checkbox" checked={check2} onChange={e => setCheck2(e.target.checked)} />
                <span className="checkmark"></span>
                Perte données Coachs.
              </label>
              <label className="checkbox-container" style={{ fontSize: isMobile ? '0.85rem' : '1.05rem' }}>
                <input type="checkbox" checked={check3} onChange={e => setCheck3(e.target.checked)} />
                <span className="checkmark"></span>
                Backup effectué.
              </label>
            </div>

            <div className="nuke-input-group" style={{ padding: isMobile ? '1rem' : '1.8rem' }}>
              <p style={{ fontSize: isMobile ? '0.8rem' : '0.95rem' }}>Tapez exactement : <br/><strong>JE COMPRENDS LES RISQUES</strong></p>
              <input 
                type="text" 
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="..."
                className="nuke-input"
                style={{ fontSize: isMobile ? '1rem' : '1.3rem', padding: isMobile ? '0.8rem' : '1.2rem' }}
              />
            </div>

            <div className="nuke-actions" style={{ flexDirection: isMobile ? 'column' : 'row' }}>
              <button 
                onClick={() => setShowModal(false)}
                className="cancel-btn"
                disabled={isPending}
              >
                ANNULER
              </button>
              <button 
                onClick={handleNuke}
                className="confirm-nuke-btn"
                disabled={!isNukeReady || isPending}
              >
                {isPending ? "PURGE..." : isMobile ? "DÉTRUIRE" : "💥 TOUT DÉTRUIRE"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .nuke-container { position: relative; overflow: hidden; }
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
          transition: all 0.3s;
          box-shadow: 0 10px 20px var(--danger-transparent);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .nuke-btn:hover { background: var(--danger-hover, #dc2626); transform: translateY(-4px); }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
          padding: 1rem;
        }

        .nuke-modal {
          background: var(--card-bg, var(--background));
          border: 2px solid var(--danger);
          border-radius: 20px;
          padding: 3rem;
          width: 100%;
          max-width: 650px;
          box-shadow: 0 0 60px var(--danger-transparent);
          position: relative;
          overflow: hidden;
        }

        .nuke-title {
          color: var(--danger);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          font-weight: 900;
        }

        .nuke-checklist { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2.5rem; }
        .checkbox-container { display: flex; align-items: center; gap: 1.2rem; color: var(--text-secondary); font-weight: 600; cursor: pointer; }
        .checkbox-container input { width: 22px; height: 22px; accent-color: var(--danger); cursor: pointer; }

        .nuke-input-group {
          background: var(--danger-transparent);
          padding: 1.8rem;
          border-radius: 16px;
          border: 1px dashed var(--danger);
          margin-bottom: 2rem;
        }
        .nuke-input-group p { margin-top: 0; color: var(--text-secondary); line-height: 1.5; }

        .nuke-input {
          width: 100%;
          background: var(--glass-bg);
          border: 2px solid var(--danger);
          color: var(--danger);
          font-weight: 900;
          border-radius: 12px;
          text-align: center;
          outline: none;
          transition: all 0.2s;
        }

        .nuke-actions { display: flex; gap: 1rem; }
        .cancel-btn { flex: 1; padding: 1.2rem; background: var(--glass-bg); color: var(--foreground); border: 1px solid var(--glass-border); border-radius: 12px; font-weight: 800; cursor: pointer; }
        .confirm-nuke-btn { flex: 2; padding: 1.2rem; background: var(--danger); color: white; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; transition: all 0.3s; }
        .confirm-nuke-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </PremiumCard>
  );
}
