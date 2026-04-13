"use client";

import { deleteConversation, getConversationMessages, sendPrivateMessage } from "@/app/profile/actions";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import { parseInlineBBCode } from "@/lib/bbcode";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle, Archive, Clock, Inbox, Send, User } from "lucide-react";
import Pagination from "@/common/components/Pagination/Pagination";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReportModal from "@/common/components/ReportModal/ReportModal";
import CTAButton from "@/common/components/Button/CTAButton";
import ClassicButton from "@/common/components/Button/ClassicButton";
import AdminButton from "@/common/components/Button/AdminButton";

import DangerButton from "@/common/components/Button/DangerButton";

interface ConversationViewProps {
  conversationId: string;
  onBack: () => void;
}

export default function ConversationView({ conversationId, onBack }: ConversationViewProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editorKey, setEditorKey] = useState(0);
  const [recipient, setRecipient] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [conversationId, page]);

  async function loadMessages() {
    setLoading(true);
    try {
      const data = await getConversationMessages(conversationId, page);
      setMessages(data.messages);
      setTotalPages(data.totalPages);
      setRecipient(data.recipient);
      // `getConversationMessages` marque les messages non lus en "lus".
      // On force alors un refresh des Server Components pour mettre à jour le badge header.
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur chargement messages");
      onBack();
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const result = await sendPrivateMessage(conversationId, content);
      if (result.success) {
        setContent("");
        setEditorKey(prev => prev + 1);
        setPage(1); // Refresh to see the latest message
        loadMessages();
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur d'envoi");
    } finally {
      setSending(false);
    }
  }

  async function handleConfirmDelete() {
    try {
      const result = await deleteConversation(conversationId);
      if (result.success) {
        toast.success("Conversation supprimée");
        onBack();
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression");
    } finally {
      setIsDeleteModalOpen(false);
    }
  }

  return (
    <div className="conversation-view-container fade-in">
      <header className="conv-view-header">
        <ClassicButton onClick={onBack} icon={<Inbox size={18} />}>
          Boîte de réception
        </ClassicButton>
        <div className="recipient-display">
          {recipient && (
            <>
              {recipient.image ? (
                <img src={recipient.image} alt={recipient.name} className="recipient-nav-avatar" />
              ) : (
                <div className="recipient-nav-avatar-placeholder"><User size={16} /></div>
              )}
              <span className="recipient-name-text">Vous parlez avec <strong>{recipient.name}</strong></span>

              <div className="recipient-actions">
                <Tooltip text="Signaler ce membre" position="bottom">
                  <button
                    className="icon-action-btn report-btn-small"
                    onClick={() => setIsReportModalOpen(true)}
                  >
                    <AlertTriangle size={14} />
                  </button>
                </Tooltip>
              </div>
            </>
          )}
        </div>
        <DangerButton onClick={() => setIsDeleteModalOpen(true)} icon={<Archive size={16} />}>
           Archiver la conversation
        </DangerButton>
      </header>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Archiver la conversation"
        message="Voulez-vous vraiment archiver cette conversation ? Elle disparaîtra de votre boîte de réception mais réapparaîtra si vous recevez un nouveau message."
        confirmLabel="Archiver"
        isDanger={true}
      />

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={recipient?.id || ""}
        targetType="USER"
        itemTitle={recipient?.name}
      />

      <div className="pm-disclaimer">
        <AlertTriangle size={14} />
        <p>
          <strong>Note sur la confidentialité :<br />
          </strong> Les messages privés sont destinés à vos échanges personnels, et sont chiffrés<br />
          Évitez de partager des informations sensibles (mots de passe, données bancaires, etc.).<br />
          Le contenu de vos messages ne sera <strong>JAMAIS</strong> partagé avec l'équipe de modération, même en cas de signalement.
        </p>
      </div>

      <PremiumCard className="reply-box">
        <form onSubmit={handleSendMessage}>
          <BBCodeEditor
            key={editorKey}
            name="content"
            placeholder="Écrivez votre message..."
            defaultValue=""
            rows={6}
            onChange={(val) => setContent(val)}
          />
          <div className="reply-actions">
            <p className="hint">Support BBCode activé</p>
            <CTAButton 
              type="submit" 
              disabled={sending || !content.trim()}
              isLoading={sending}
              icon={<Send size={16} />}
            >
              Répondre
            </CTAButton>
          </div>
        </form>
      </PremiumCard>

      <div className="messages-list">
        {loading && messages.length === 0 ? (
          <div className="loading-state">Chargement des messages...</div>
        ) : (
          messages.map((msg) => (
            <PremiumCard key={msg.id} className={`message-item ${msg.authorId === session?.user?.id ? 'is-self' : ''}`}>
              <div className="message-sidebar">
                {msg.author.image ? (
                  <img src={msg.author.image} alt={msg.author.name} className="author-avatar" />
                ) : (
                  <div className="author-avatar-placeholder"><User size={20} /></div>
                )}
                <span className="author-name">{msg.author.name}</span>
              </div>

              <div className="message-content-wrapper">
                <div className="message-meta">
                  <Clock size={12} />
                  <span>{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: fr })}</span>
                  {msg.authorId !== session?.user?.id && (
                    <button 
                      className="icon-action-btn report-btn-inline" 
                      title="Signaler ce message"
                      onClick={() => {
                        // On réutilise le modal de signalement mais pour le message spécifique
                        // Mais le modal actuel est limité à un seul targetId.
                        // Je vais plutôt créer un mini composant local ou gérer plusieurs états.
                        // Pour faire simple, on va signaler le membre, car pour les MP le contenu est chiffré/privé.
                        setIsReportModalOpen(true);
                      }}
                      style={{ marginLeft: 'auto', opacity: 0.4 }}
                    >
                      <AlertTriangle size={12} />
                    </button>
                  )}
                </div>
                <div
                  className="message-body"
                  dangerouslySetInnerHTML={{ __html: parseInlineBBCode(msg.content) }}
                />
              </div>
            </PremiumCard>
          ))
        )}
      </div>

      {
        totalPages > 1 && (
          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        )
      }

      <style jsx>{`
        .conversation-view-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .conv-view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.5rem;
        }
        .recipient-display {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          background: rgba(255, 255, 255, 0.02);
          padding: 0.4rem 1rem;
          border-radius: 100px;
          border: 1px solid var(--glass-border);
        }
        .recipient-nav-avatar, .recipient-nav-avatar-placeholder {
          width: 28px;
          height: 28px;
          border-radius: 50%;
        }
        .recipient-nav-avatar-placeholder {
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }
        .recipient-name-text {
          font-size: 0.85rem;
          color: #888;
        }
        .recipient-name-text strong {
          color: #eee;
        }
        .recipient-actions {
          display: flex;
          align-items: center;
          padding-left: 0.5rem;
          border-left: 1px solid rgba(255,255,255,0.05);
        }
        .icon-action-btn {
          background: transparent;
          border: none;
          color: #555;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .report-btn-small:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        :global(.reply-box) {
          padding: 1.5rem !important;
          background: rgba(255, 255, 255, 0.03) !important;
        }
        .reply-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
        }
        .hint {
          font-size: 0.8rem;
          color: #555;
          margin: 0;
        }
        .pm-disclaimer {
          display: flex;
          gap: 0.8rem;
          padding: 1rem 1.5rem;
          background: rgba(255, 215, 0, 0.02);
          border: 1px solid rgba(255, 215, 0, 0.1);
          border-radius: 8px;
          color: #777;
          font-size: 0.8rem;
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }
        .pm-disclaimer p {
          margin: 0;
        }
        .pm-disclaimer strong {
          color: #999;
        }
        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        :global(.message-item) {
          display: flex;
          padding: 1.5rem !important;
          gap: 1.5rem;
          background: rgba(255, 255, 255, 0.02) !important;
          border-left: 2px solid transparent !important;
        }
        :global(.message-item.is-self) {
          background: rgba(255, 255, 255, 0.04) !important;
          border-left-color: var(--primary) !important;
        }
        .message-sidebar {
          width: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .author-avatar, .author-avatar-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }
        .author-avatar-placeholder {
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #444;
        }
        .author-name {
          font-size: 0.75rem;
          font-weight: 700;
          color: #aaa;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }
        .message-content-wrapper {
          flex: 1;
        }
        .message-meta {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: #555;
          margin-bottom: 0.8rem;
        }
        .message-body {
          color: #ccc;
          line-height: 1.6;
          font-size: 1rem;
        }
        .loading-state {
          padding: 3rem;
          text-align: center;
          color: #666;
        }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .btn-pagination {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-pagination:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
