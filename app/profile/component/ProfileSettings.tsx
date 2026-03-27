import { useTransition, useState } from "react";
import { ShieldAlert, Trash2, Mail, LogOut, KeyRound } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { deleteAccount } from "../actions";
import Modal from "@/common/components/Modal/Modal";
import toast from "react-hot-toast";

interface ProfileSettingsProps {
  user: any;
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const [isDeleting, startDeletion] = useTransition();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);

  const handleDeleteAccount = () => {
    startDeletion(async () => {
      const result = await deleteAccount();
      if (result.success) {
        toast.success("Compte supprimé avec succès. Vous allez être redirigé...");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        toast.error("Erreur : " + result.error);
      }
    });
  };

  return (
    <PremiumCard className="profile-settings-view fade-in">
      <div className="section-header-pm" style={{ marginBottom: '2rem' }}>
        <ShieldAlert size={20} className="header-icon" />
        <h3 className="activity-box-title">Gestion du compte & Sécurité</h3>
      </div>

      <div className="settings-section">
        <h4 className="settings-subtitle"><KeyRound size={16} /> Authentification</h4>
        <div className="auth-providers-list">
          <div className="auth-item active">
            <Mail size={18} />
            <div className="auth-info">
              <span className="auth-label">Email de connexion</span>
              <span className="auth-value">{user.email || "Non renseigné"}</span>
            </div>
            <span className="auth-status">Actif</span>
          </div>

          <div className="auth-item discord-item disabled">
             <div className="auth-info">
              <span className="auth-label">Discord</span>
              <span className="auth-value">Non lié</span>
            </div>
             <button className="link-btn">Lier</button>
          </div>

          <div className="auth-item google-item disabled">
             <div className="auth-info">
              <span className="auth-label">Google</span>
              <span className="auth-value">Non lié</span>
            </div>
             <button className="link-btn">Lier</button>
          </div>
        </div>
      </div>

      <div className="settings-section danger-zone">
        <h4 className="settings-subtitle danger"><Trash2 size={16} /> Zone de danger</h4>
        <div className="danger-box">
          <div className="danger-text">
             <p><strong>Suppression irréversible du compte</strong></p>
             <p>Cette action supprimera toutes vos données personnelles (messages privés, suivis, paramètres). Vos messages publics seront anonymisés.</p>
          </div>
          <button 
            className="delete-account-btn" 
            onClick={() => setShowConfirmModal(true)}
            disabled={isDeleting}
          >
            <Trash2 size={18} />
            <span>Supprimer mon compte</span>
          </button>
        </div>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          setShowConfirmModal(false);
          setShowFinalModal(true);
        }}
        title="Clôture du compte - Étape 1/2"
        message="Êtes-vous absolument sûr de vouloir supprimer votre compte ? Cette action est irréversible et conforme à vos droits RGPD."
        confirmText="Continuer"
        variant="danger"
      />

      <Modal
        isOpen={showFinalModal}
        onClose={() => setShowFinalModal(false)}
        onConfirm={handleDeleteAccount}
        title="Clôture du compte - Confirmation FINALE"
        message="Dernière étape : toutes vos données seront effacées. Êtes-vous certain de vouloir procéder ?"
        confirmText="Tout supprimer définitivement"
        variant="danger"
      />

      <style jsx>{`
        :global(.profile-settings-view) {
          padding: 2rem !important;
        }
        .section-header-pm {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 2rem;
        }
        .header-icon {
          color: var(--primary);
        }
        .activity-box-title {
          margin: 0;
          font-size: 1.2rem;
          color: var(--foreground);
        }
        .settings-section {
          margin-bottom: 3.5rem;
        }
        .settings-section:last-of-type {
          margin-bottom: 0;
        }
        .settings-subtitle {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          font-weight: 800;
        }
        .settings-subtitle.danger {
          color: var(--danger);
        }
        .auth-providers-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .auth-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          transition: all 0.2s;
        }
        .auth-item.active {
          border-color: rgba(34, 197, 94, 0.3);
          background: rgba(34, 197, 94, 0.05);
        }
        .auth-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .auth-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
        }
        .auth-value {
          font-size: 0.95rem;
          color: var(--foreground);
        }
        .auth-status {
          font-size: 0.7rem;
          background: #22c55e;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 800;
        }
        .link-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: not-allowed;
          opacity: 0.5;
        }
        .danger-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: rgba(var(--danger-rgb), 0.05);
          border: 1px solid rgba(var(--danger-rgb), 0.2);
          border-radius: 12px;
        }
        .danger-text p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .danger-text strong {
          color: var(--danger);
          font-size: 1rem;
          display: block;
          margin-bottom: 4px;
        }
        .delete-account-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--danger);
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .delete-account-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(var(--danger-rgb), 0.2);
        }
        .delete-account-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </PremiumCard>
  );
}
