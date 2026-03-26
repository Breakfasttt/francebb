"use client";

import { MessageSquare, Pencil, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { moderatePost, unmoderatePost, deletePost } from "@/app/forum/actions";
import { useState } from "react";
import ModerationModal from "@/app/forum/component/ModerationModal";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import PostReactions from "@/app/forum/component/PostReactions";

interface PostActionsProps {
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  initialReactions: any[];
  currentUserId?: string;
  isModerator?: boolean;
  topicId: string;
  onQuote?: (quote: string) => void;
  isModerated?: boolean;
  isTournament?: boolean;
  tournamentId?: string;
  isFirstPost?: boolean;
}

export default function PostActions({ 
  postId, 
  authorId, 
  authorName, 
  content, 
  initialReactions, 
  currentUserId, 
  isModerator, 
  topicId, 
  onQuote, 
  isModerated,
  isTournament = false,
  tournamentId,
  isFirstPost = false
}: PostActionsProps) {
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
      <div className="post-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Left column: Moderation */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          {isModerator && (
            <div>
              {!isModerated ? (
                <button 
                  onClick={() => setIsModModalOpen(true)}
                  className="secondary-btn" 
                  title="Modérer ce message"
                  style={{ ...btnStyle, background: 'rgba(var(--danger-rgb, 194, 29, 29), 0.1)', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                >
                  <ShieldAlert size={14} />
                  <span>Modérer</span>
                </button>
              ) : (
                <button 
                  onClick={() => setIsRestoreModalOpen(true)}
                  className="secondary-btn" 
                  title="Restaurer ce message"
                  style={{ ...btnStyle, background: 'rgba(var(--success-rgb, 46, 125, 50), 0.1)', color: 'var(--success)', borderColor: 'var(--success)' }}
                >
                  <ShieldCheck size={14} />
                  <span>Restaurer</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Center column: Reactions */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <PostReactions postId={postId} initialReactions={initialReactions} currentUserId={currentUserId} />
        </div>

        {/* Right column: Action trio */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
          
          {/* Citer */}
          <div className="tooltip-wrapper">
            <button 
              onClick={handleQuote}
              className="secondary-btn hover-brightness" 
              style={{ ...btnStyle, padding: '0.5rem', width: '32px', height: '32px', justifyContent: 'center', background: 'var(--glass-bg)', color: 'var(--foreground)' }}
            >
              <MessageSquare size={16} />
            </button>
            <span className="tooltip-text">Citer</span>
          </div>

          {/* Modifier */}
          {canEdit && (
            <div className="tooltip-wrapper">
              <Link 
                href={isTournament && isFirstPost && tournamentId ? `/forum/edit-tournament/${tournamentId}` : `/forum/post/${postId}/edit`} 
                className="widget-button hover-brightness" 
                style={{ ...btnStyle, padding: '0.5rem', width: '32px', height: '32px', justifyContent: 'center', background: 'var(--primary)', color: 'var(--header-foreground)', border: 'none' }}
              >
                <Pencil size={16} />
              </Link>
              <span className="tooltip-text">{isTournament && isFirstPost ? "Modifier tournoi" : "Modifier"}</span>
            </div>
          )}

          {/* Supprimer */}
          {isAuthor && (
            <div className="tooltip-wrapper">
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="secondary-btn hover-brightness" 
                style={{ ...btnStyle, padding: '0.5rem', width: '32px', height: '32px', justifyContent: 'center', background: 'var(--glass-bg)', color: 'var(--danger)' }}
              >
                <Trash2 size={16} />
              </button>
              <span className="tooltip-text">Supprimer</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .tooltip-wrapper {
          position: relative;
          display: inline-flex;
        }
        .tooltip-text {
          visibility: hidden;
          background-color: var(--footer-bg);
          color: var(--header-foreground);
          text-align: center;
          padding: 4px 10px;
          border-radius: 6px;
          position: absolute;
          z-index: 100;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 0.7rem;
          white-space: nowrap;
          box-shadow: var(--glass-shadow);
          border: 1px solid var(--glass-border);
          pointer-events: none;
        }
        .tooltip-wrapper:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }
      `}</style>

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
