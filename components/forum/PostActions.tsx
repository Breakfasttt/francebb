"use client";

import { MessageSquare, Pencil, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { moderatePost, unmoderatePost, deletePost } from "@/app/forum/actions";
import { useState } from "react";
import ModerationModal from "./ModerationModal";
import ConfirmModal from "./ConfirmModal";

interface PostActionsProps {
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  currentUserId?: string;
  isModerator?: boolean;
  topicId: string;
  onQuote?: (quote: string) => void;
  isModerated?: boolean;
}

export default function PostActions({ postId, authorId, authorName, content, currentUserId, isModerator, topicId, onQuote, isModerated }: PostActionsProps) {
  const canEdit = currentUserId === authorId || isModerator;
  const isAuthor = currentUserId === authorId;

  const [isModModalOpen, setIsModModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const handleQuote = () => {
    const quoteContent = `[quote=${authorId}|${postId}]${content}[/quote]\n`;
    const quickReply = document.getElementById('quick-reply-area');
    if (quickReply) {
      window.dispatchEvent(new CustomEvent('bbcode-insert-text', { detail: quoteContent }));
      quickReply.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/forum/topic/${topicId}/reply?quotePostId=${postId}`;
    }
  };

  const onConfirmModerate = async (reason: string) => {
    await moderatePost(postId, reason);
    window.location.reload();
  };

  const handleUnmoderate = async () => {
    try {
      await unmoderatePost(postId);
      window.location.reload();
    } catch (error) {
      alert("Erreur lors de la restauration.");
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(postId);
      window.location.reload();
    } catch (error: any) {
      alert(error.message || "Erreur lors de la suppression.");
    }
  };

  const btnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    textDecoration: 'none',
    border: '1px solid var(--glass-border)'
  };

  return (
    <>
      <div className="post-actions" style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {isModerator && (
          <>
            {!isModerated ? (
              <button 
                onClick={() => setIsModModalOpen(true)}
                className="secondary-btn" 
                title="Modérer ce message"
                style={{ ...btnStyle, background: 'rgba(194, 29, 29, 0.1)', color: '#ff6666', borderColor: 'rgba(194, 29, 29, 0.3)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(194, 29, 29, 0.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(194, 29, 29, 0.1)')}
              >
                <ShieldAlert size={14} />
                Modérer
              </button>
            ) : (
              <button 
                onClick={() => setIsRestoreModalOpen(true)}
                className="secondary-btn" 
                title="Restaurer ce message"
                style={{ ...btnStyle, background: 'rgba(46, 125, 50, 0.1)', color: '#81c784', borderColor: 'rgba(46, 125, 50, 0.3)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(46, 125, 50, 0.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(46, 125, 50, 0.1)')}
              >
                <ShieldCheck size={14} />
                Restaurer
              </button>
            )}
          </>
        )}

        {isAuthor && (
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="secondary-btn" 
            title="Supprimer mon message"
            style={{ ...btnStyle, background: 'rgba(255,255,255,0.05)', color: '#ff8888' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(194, 29, 29, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            <Trash2 size={14} />
            Supprimer
          </button>
        )}

        {canEdit && (
          <Link 
            href={`/forum/post/${postId}/edit`} 
            className="widget-button" 
            title="Modifier le message"
            style={{ ...btnStyle, background: 'var(--primary)', color: 'white', border: 'none' }}
          >
            <Pencil size={14} />
            Modifier
          </Link>
        )}
        
        <button 
          onClick={handleQuote}
          className="secondary-btn" 
          title="Citer ce message"
          style={{ ...btnStyle, background: 'rgba(255,255,255,0.05)', color: '#eee' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          <MessageSquare size={14} />
          Citer
        </button>
      </div>

      <ModerationModal 
        isOpen={isModModalOpen} 
        onClose={() => setIsModModalOpen(false)} 
        onConfirm={onConfirmModerate}
        authorName={authorName}
      />

      <ConfirmModal 
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={handleUnmoderate}
        title="Restaurer le message"
        message="Voulez-vous vraiment annuler la modération de ce message ? Le contenu sera à nouveau visible par tous."
        confirmLabel="Restaurer"
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le message"
        message="Voulez-vous vraiment supprimer définitivement votre message ? Cette action est irréversible."
        confirmLabel="Supprimer"
        isDanger={true}
      />
    </>
  );
}
