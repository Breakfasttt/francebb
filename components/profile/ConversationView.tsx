"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Send, Trash2, Clock, User, MessageCircle, AlertCircle, Inbox } from "lucide-react";
import { getConversationMessages, sendPrivateMessage, deleteConversation } from "@/app/profile/pmActions";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { parseInlineBBCode } from "@/lib/bbcode";
import BBCodeEditor from "@/components/forum/BBCodeEditor";
import ConfirmModal from "@/components/forum/ConfirmModal";

interface ConversationViewProps {
  conversationId: string;
  onBack: () => void;
}

export default function ConversationView({ conversationId, onBack }: ConversationViewProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editorKey, setEditorKey] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [conversationId, page]);

  async function loadMessages() {
    setLoading(true);
    try {
      const data = await getConversationMessages(conversationId, page);
      setMessages(data.messages);
      setTotalPages(data.totalPages);
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
        <button className="back-btn" onClick={onBack}>
          <Inbox size={18} /> Boîte de réception
        </button>
        <button className="btn-primary delete-btn-new" onClick={() => setIsDeleteModalOpen(true)}>
          <Trash2 size={16} /> <span>Supprimer la conversation</span>
        </button>
      </header>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer la conversation"
        message="Voulez-vous vraiment supprimer cette conversation ? Cette action est irréversible."
        confirmLabel="Supprimer"
        isDanger={true}
      />

      <div className="reply-box premium-card">
        <form onSubmit={handleSendMessage}>
          <BBCodeEditor 
            key={editorKey}
            name="content"
            placeholder="Écrivez votre message..."
            defaultValue=""
            rows={4}
            onChange={(val) => setContent(val)}
          />
          <div className="reply-actions">
            <p className="hint">Support BBCode activé</p>
            <button type="submit" disabled={sending || !content.trim()} className="btn-primary">
              <Send size={16} /> {sending ? "Envoi..." : "Répondre"}
            </button>
          </div>
        </form>
      </div>

      <div className="messages-list">
        {loading && messages.length === 0 ? (
          <div className="loading-state">Chargement des messages...</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message-item premium-card ${msg.authorId === session?.user?.id ? 'is-self' : ''}`}>
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
                </div>
                <div 
                  className="message-body" 
                  dangerouslySetInnerHTML={{ __html: parseInlineBBCode(msg.content) }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-pagination">Précédent</button>
          <span>Page {page} sur {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-pagination">Suivant</button>
        </div>
      )}

      <style jsx>{`
        .conversation-view-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .conv-view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
        }
        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: #aaa;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.2s;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          height: auto;
          font-size: 0.85rem;
        }
        .back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
        .delete-btn-new {
          padding: 0.6rem 1.2rem;
          height: auto;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .reply-box {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
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
        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .message-item {
          display: flex;
          padding: 1.5rem;
          gap: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-left: 2px solid transparent;
        }
        .message-item.is-self {
          background: rgba(255, 255, 255, 0.04);
          border-left-color: var(--primary);
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
          border-radius: 8px;
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
