"use client";

import { MessageSquare, Pencil, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import ClassicButton from "@/common/components/Button/ClassicButton";
import AdminButton from "@/common/components/Button/AdminButton";
import DangerButton from "@/common/components/Button/DangerButton";
import Link from "next/link";
import { moderatePost, unmoderatePost, deletePost } from "@/app/forum/actions";
import { useState } from "react";
import ModerationModal from "@/app/forum/component/ModerationModal";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import PostReactions from "@/app/forum/component/PostReactions";
import Tooltip from "@/common/components/Tooltip/Tooltip";

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
    const quoteContent = `[quote=${authorId}|${postId}|${authorName}]${content}[/quote]\n`;
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
      <div className="post-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
        
        {/* Left column: Moderation */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          {isModerator && (
            <div>
              {!isModerated ? (
                <Tooltip text="Modérer ce message">
                  <AdminButton 
                    onClick={() => setIsModModalOpen(true)}
                    icon={ShieldAlert}
                    size="sm"
                    style={{ background: 'rgba(var(--danger-rgb), 0.1)', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  >
                    Modérer
                  </AdminButton>
                </Tooltip>
              ) : (
                <Tooltip text="Restaurer ce message">
                  <AdminButton 
                    onClick={() => setIsRestoreModalOpen(true)}
                    icon={ShieldCheck}
                    size="sm"
                    style={{ background: 'rgba(var(--success-rgb), 0.1)', color: 'var(--success)', borderColor: 'var(--success)' }}
                  >
                    Restaurer
                  </AdminButton>
                </Tooltip>
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
          {currentUserId && (
            <Tooltip text="Citer">
              <ClassicButton 
                onClick={handleQuote}
                icon={MessageSquare}
                size="sm"
              />
            </Tooltip>
          )}

          {/* Modifier */}
          {canEdit && (
            <Tooltip text={isTournament && isFirstPost ? "Modifier tournoi" : "Modifier"}>
              <ClassicButton 
                href={isTournament && isFirstPost && tournamentId ? `/forum/edit-tournament/${tournamentId}` : `/forum/post/${postId}/edit`} 
                icon={Pencil}
                size="sm"
                style={{ background: 'var(--primary)', color: 'white', border: 'none' }}
              />
            </Tooltip>
          )}

          {/* Supprimer */}
          {isAuthor && (
            <Tooltip text="Supprimer">
              <DangerButton 
                onClick={() => setIsDeleteModalOpen(true)}
                icon={Trash2}
                size="sm"
              />
            </Tooltip>
          )}
        </div>
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
