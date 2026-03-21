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
  Check
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";
import { togglePinTopic, deleteTopicPermanent } from "@/app/forum/actions";
import Modal from "@/components/Modal";
import MoveTopicModal from "./MoveTopicModal";
import EditTopicTitleModal from "./EditTopicTitleModal";

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
  currentUserId = ""
}: TopicSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputPage, setInputPage] = useState(String(currentPage));
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);

  // Synchronize state when the prop changes (e.g. navigation)
  useEffect(() => {
    setInputPage(String(currentPage));
  }, [currentPage]);

  const getPageHref = (page: number) => `${pathname}?page=${page}`;

  function handlePageKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const p = parseInt(inputPage, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        if (p !== currentPage) {
           window.location.assign(getPageHref(p));
        } else {
           inputRef.current?.blur();
        }
      } else {
        setInputPage(String(currentPage));
      }
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setInputPage(String(currentPage));
      inputRef.current?.blur();
    }
  }

  // Build compact tokens: always 1, current, last — insert '…' between non-consecutive
  function buildTokens(): (number | '...')[] {
    const pages = [...new Set([1, currentPage, totalPages])].sort((a, b) => a - b);
    const result: (number | '...')[] = [];
    for (let i = 0; i < pages.length; i++) {
      if (i > 0 && pages[i] - pages[i - 1] > 1) result.push('...');
      result.push(pages[i]);
    }
    return result;
  }

  const tokens = buildTokens();

  const navBtn = (disabled: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '24px', height: '24px', borderRadius: '4px', flexShrink: 0,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
    color: disabled ? '#444' : 'white',
    textDecoration: 'none', opacity: disabled ? 0.35 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  });

  const pageBtn = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '24px', height: '24px', padding: '0 4px', borderRadius: '4px', flexShrink: 0,
    background: active ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
    border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
    color: 'white', fontSize: '0.75rem', fontWeight: active ? 700 : 400,
    textDecoration: 'none',
  });

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
            <div className="sidebar-widget" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.85rem', margin: 0, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pages</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inputPage}
                    onChange={e => {
                      const v = e.target.value.replace(/[^0-9]/g, '');
                      setInputPage(v);
                    }}
                    onKeyDown={handlePageKeyDown}
                    onFocus={() => setInputPage('')}
                    onBlur={() => setInputPage(String(currentPage))}
                    title="Entrée pour naviguer"
                    style={{
                      width: '30px', background: 'rgba(50,50,50,0.5)',
                      border: '1px solid rgba(255,255,255,0.15)', borderRadius: '3px',
                      color: 'white', textAlign: 'center', fontSize: '0.75rem',
                      padding: '2px 0', outline: 'none', fontWeight: 700
                    }}
                  />
                  <span style={{ color: '#555', fontWeight: 600 }}>/ {totalPages}</span>
                </div>
              </div>

              {/* Pinned Navigation: arrows on edges, page numbers centered */}
              <div style={{ 
                display: 'grid', gridTemplateColumns: 'min-content 1fr min-content', 
                gap: '8px', alignItems: 'center', width: '100%' 
              }}>
                {/* Left group: fixed positions */}
                <div style={{ display: 'flex', gap: '2px' }}>
                  <Link href={getPageHref(1)} style={navBtn(currentPage === 1)} title="Première page">
                    <ChevronsLeft size={11} />
                  </Link>
                  <Link href={getPageHref(currentPage - 1)} style={navBtn(currentPage === 1)} title="Page précédente">
                    <ChevronLeft size={11} />
                  </Link>
                </div>

                {/* Center group: dynamic but the columns balance it */}
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center', justifyContent: 'center' }}>
                  {tokens.map((t, i) =>
                    t === '...'
                      ? <span key={`d${i}`} style={{ color: '#444', fontSize: '0.7rem' }}>…</span>
                      : <Link key={t} href={getPageHref(t)} style={pageBtn(t === currentPage)}>{t}</Link>
                  )}
                </div>

                {/* Right group: fixed positions */}
                <div style={{ display: 'flex', gap: '2px' }}>
                  <Link href={getPageHref(currentPage + 1)} style={navBtn(currentPage === totalPages)} title="Page suivante">
                    <ChevronRight size={11} />
                  </Link>
                  <Link href={getPageHref(totalPages)} style={navBtn(currentPage === totalPages)} title="Dernière page">
                    <ChevronsRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 2. Topic Actions Block */}
          <div className="sidebar-widget topic-widget" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', fontSize: '0.85rem', color: '#aaa', textTransform: 'uppercase' }}>
              Sujet
            </h3>
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
