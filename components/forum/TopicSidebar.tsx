"use client";

import Link from "next/link";
import { 
  MessageSquare, 
  ArrowUp, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Pin,
  PinOff,
  Trash2,
  Move,
  Type,
  ChevronsDown,
  Mail,
  Check,
  Eye
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";
import { togglePinTopic, deleteTopicPermanent } from "@/app/forum/actions";
import Modal from "@/components/Modal";
import MoveTopicModal from "./MoveTopicModal";
import EditTopicTitleModal from "./EditTopicTitleModal";
import SidebarPagination from "./SidebarPagination";

interface TopicSidebarProps {
  topicId: string;
  currentPage: number;
  totalPages: number;
  isModerator?: boolean;
  isPinned?: boolean;
  lastPostId?: string;
  lastPage?: number;
  allForums?: { id: string; name: string; }[];
  topicTitle?: string;
  authorId?: string;
  currentUserId?: string;
  views?: number;
}

export default function TopicSidebar({ 
  topicId, 
  currentPage, 
  totalPages,
  isModerator = false,
  isPinned = false,
  lastPostId = "",
  lastPage = 1,
  allForums = [],
  topicTitle = "",
  authorId = "",
  currentUserId = "",
  views = 0
}: TopicSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);


  const handleTogglePin = () => {
    startTransition(async () => {
      try {
        await togglePinTopic(topicId);
      } catch (error) {
        alert(error instanceof Error ? error.message : "Erreur lors du changement d'épinglage");
      }
    });
  };

  const handleDeleteTopic = () => {
    startTransition(async () => {
      try {
        await deleteTopicPermanent(topicId, topicTitle);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Ignore Next.js redirect errors as they are handled by the framework
        if (errorMessage.includes("NEXT_REDIRECT")) return;

        alert(errorMessage);
        setShowDeleteModal(false);
      }
    });
  };


  const handleGoToLast = (e: React.MouseEvent) => {
    if (currentPage === lastPage) {
      e.preventDefault();
      const el = document.getElementById(`post-${lastPostId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  const canEditTitle = isModerator || (currentUserId === authorId);

  return (
    <aside className="forum-sidebar">
      <div className="sidebar-sticky-inner">
        <div className="sidebar-widget-container">
          
          {/* 1. Pages Block */}
          {totalPages > 1 && (
            <SidebarPagination 
              currentPage={currentPage}
              totalPages={totalPages}
            />
          )}

          {/* 2. Topic Actions Block */}
          <div className="sidebar-widget topic-widget" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Sujet
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#666', fontSize: '0.75rem', fontWeight: 600 }} title={`${views.toLocaleString("fr-FR")} vues`}>
                 <Eye size={13} />
                 <span>{views.toLocaleString("fr-FR")}</span>
              </div>
            </div>

            <button onClick={() => document.getElementById('quick-reply-area')?.scrollIntoView({ behavior: 'smooth' })}
              className="widget-button" style={{ background: 'var(--primary)', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '8px 12px' }}>
              <MessageSquare size={16} /><span>Répondre</span>
            </button>
            
            {canEditTitle && (
              <button 
                onClick={() => setShowEditTitleModal(true)}
                className="widget-button secondary-btn" 
                style={{ textAlign: 'left', padding: '8px 12px' }}
              >
                <Type size={16} />
                <span>Modifier le titre</span>
              </button>
            )}

            <a 
              href={`${pathname}?page=${lastPage}#post-${lastPostId}`}
              onClick={handleGoToLast}
              className="widget-button secondary-btn" 
              style={{ textAlign: 'left', padding: '8px 12px' }}
            >
              <ChevronsDown size={16} /><span>Dernier message</span>
            </a>


            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="widget-button secondary-btn" style={{ textAlign: 'left', padding: '8px 12px' }}>
              <ArrowUp size={16} /><span>Haut de page</span>
            </button>

            {/* Moderator Actions */}
            {isModerator && (
              <div style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.65rem', color: '#555', textTransform: 'uppercase', fontWeight: 800 }}>Modération</span>
                
                <button 
                  onClick={handleTogglePin}
                  disabled={isPending}
                  className="widget-button secondary-btn" 
                  style={{ textAlign: 'left', color: isPinned ? '#eab308' : 'white', padding: '8px 12px' }}
                >
                  {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                  <span>{isPinned ? "Désépingler" : "Épingler"}</span>
                </button>

                <button 
                  onClick={() => setShowMoveModal(true)}
                  disabled={isPending}
                  className="widget-button secondary-btn" 
                  style={{ textAlign: 'left', padding: '8px 12px' }}
                >
                  <Move size={16} />
                  <span>Déplacer</span>
                </button>

                <button 
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isPending}
                  className="widget-button secondary-btn" 
                  style={{ textAlign: 'left', color: '#ff6666', padding: '8px 12px' }}
                >
                  <Trash2 size={16} />
                  <span>Supprimer sujet</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Suppression du sujet">
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ marginBottom: '1rem', color: 'white', fontSize: '1.1rem' }}>
            Supprimer le sujet : <br/>
            <strong style={{ color: 'var(--primary)' }}>{topicTitle}</strong> ?
          </p>
          <div style={{ 
            background: 'rgba(224, 68, 68, 0.1)', 
            border: '1px solid rgba(224, 68, 68, 0.2)', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem' 
          }}>
            <p style={{ margin: 0, color: '#ff6666', fontSize: '0.9rem' }}>
              <strong>Attention :</strong> Tous les messages seront définitivement supprimés.<br/>
              L'action est irréversible.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => setShowDeleteModal(false)} className="widget-button secondary-btn">Annuler</button>
            <button onClick={handleDeleteTopic} disabled={isPending} className="widget-button" style={{ background: '#e04444' }}>Confirmer la suppression</button>
          </div>
        </div>
      </Modal>

      <MoveTopicModal isOpen={showMoveModal} onClose={() => setShowMoveModal(false)} topicId={topicId} allForums={allForums} />
      <EditTopicTitleModal isOpen={showEditTitleModal} onClose={() => setShowEditTitleModal(false)} topicId={topicId} initialTitle={topicTitle} />
    </aside>
  );
}
