"use client";

import { useState, useTransition } from "react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import { Mail, Send, AlertTriangle, Eye, Loader2, CheckCircle2 } from "lucide-react";
import { sendGlobalInfoMail } from "../actions";
import toast from "react-hot-toast";
import { parseBBCode } from "@/lib/bbcode";
import Modal from "@/common/components/Modal/Modal";

/**
 * Onglet d'envoi de mails d'information à tous les utilisateurs.
 * Ce type de mail ignore les préférences utilisateur (newsletter, etc.)
 */
export default function InfoMailsTab() {
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count: number; total: number } | null>(null);

  const handleSend = () => {
    if (!subject || !content) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    setShowConfirm(true);
  };

  const confirmSend = () => {
    setShowConfirm(false);
    startTransition(async () => {
      try {
        const res = await sendGlobalInfoMail(subject, content);
        if (res.success) {
          setResult({ success: true, count: res.count || 0, total: res.total || 0 });
          toast.success(`Mail envoyé à ${res.count} utilisateurs !`);
          setSubject("");
          setContent("");
        } else {
          toast.error(res.error || "Erreur lors de l'envoi.");
        }
      } catch (e: any) {
        toast.error(e.message || "Erreur critique.");
      }
    });
  };

  if (result) {
    return (
      <PremiumCard className="admin-tab-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <CheckCircle2 size={64} color="var(--success)" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ color: 'var(--foreground)', marginBottom: '1rem' }}>Diffusion terminée !</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
          L'email d'information a été envoyé avec succès à <strong style={{color: 'var(--foreground)'}}>{result.count} / {result.total}</strong> utilisateurs.
        </p>
        <ClassicButton onClick={() => setResult(null)}>Envoyer une nouvelle annonce</ClassicButton>
      </PremiumCard>
    );
  }

  return (
    <div className="info-mails-tab">
      <PremiumCard className="admin-tab-card">
        <div className="tab-header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--accent-transparent)', color: 'var(--accent)', padding: '0.8rem', borderRadius: '12px' }}>
            <Mail size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--foreground)', margin: 0 }}>Annonces Email</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Diffuser une information critique à tous les coachs</p>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(var(--accent-rgb, 212, 163, 115), 0.1)', 
          border: '1px solid var(--accent)', 
          padding: '1.2rem', 
          borderRadius: '12px', 
          marginBottom: '2.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={24} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--foreground)' }}>
            <strong>Attention :</strong> Ces emails ignorent les préférences de notification des utilisateurs. 
            Utilisez cet outil <strong>uniquement</strong> pour des informations capitales (maintenance, tournoi majeur, changement de règles, etc.).
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            OBJET DU MAIL
          </label>
          <input 
            type="text" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: [IMPORT] Maintenance du serveur demain à 20h"
            style={{ 
              width: '100%', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: '8px', 
              padding: '1rem', 
              color: 'var(--foreground)',
              outline: 'none'
            }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            MESSAGE (HTML / BBCODE SUPPORTÉ)
          </label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écrivez votre message ici..."
            style={{ 
              width: '100%', 
              minHeight: '250px',
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: '8px', 
              padding: '1rem', 
              color: 'var(--foreground)',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: '1.6'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <ClassicButton 
            onClick={() => setShowPreview(true)} 
            icon={<Eye size={18} />}
            disabled={!content}
          >
            Prévisualiser
          </ClassicButton>
          <CTAButton 
            onClick={handleSend} 
            icon={isPending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            isLoading={isPending}
            disabled={!subject || !content}
          >
            Diffuser aux coachs
          </CTAButton>
        </div>
      </PremiumCard>

      {/* Modal de Confirmation */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirmer la diffusion">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <AlertTriangle size={48} color="var(--danger)" style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ marginBottom: '1rem', color: 'white' }}>Êtes-vous sûr ?</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Vous allez envoyer un email à <strong>tous les utilisateurs</strong> du site.<br/>
            Cette action est irréversible et peut être perçue comme intrusive.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <ClassicButton onClick={() => setShowConfirm(false)}>Annuler</ClassicButton>
            <CTAButton onClick={confirmSend} style={{ background: 'var(--danger)', color: 'white', border: 'none' }}>Oui, diffuser</CTAButton>
          </div>
        </div>
      </Modal>

      {/* Modal de Preview */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Prévisualisation du mail">
        <div style={{ padding: '0 2rem 2rem 2rem' }}>
          <div style={{ 
            background: 'white', 
            color: '#1d3557', 
            borderRadius: '12px', 
            padding: '2rem', 
            marginTop: '1rem',
            overflowY: 'auto',
            maxHeight: '60vh',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ borderBottom: '2px solid #edeff2', paddingBottom: '1rem', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
              Gazette de BBFrance
            </h2>
            <div 
              style={{ lineHeight: '1.6', fontSize: '1rem' }}
              dangerouslySetInnerHTML={{ __html: parseBBCode(content) }} 
            />
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #edeff2', textAlign: 'center', color: '#888', fontSize: '0.8rem' }}>
              Email envoyé automatiquement par la plateforme BBFrance.
            </div>
          </div>
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
             <ClassicButton onClick={() => setShowPreview(false)}>Fermer la preview</ClassicButton>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .info-mails-tab {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
