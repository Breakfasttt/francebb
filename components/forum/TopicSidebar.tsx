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
  ChevronsDown
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
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
        router.push(getPageHref(p));
      } else {
        setInputPage(String(currentPage)); // Re-sync if invalid
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
    width: '28px', height: '28px', borderRadius: '5px', flexShrink: 0,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
    color: disabled ? '#444' : 'white',
    textDecoration: 'none', opacity: disabled ? 0.35 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  });

  const pageBtn = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '28px', height: '28px', padding: '0 4px', borderRadius: '5px', flexShrink: 0,
    background: active ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
    border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
    color: 'white', fontSize: '0.8rem', fontWeight: active ? 700 : 400,
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
        await deleteTopicPermanent(topicId);
      } catch (error) {
        alert(error instanceof Error ? error.message : "Erreur lors de la suppression");
        setShowDeleteModal(false);
      }
    });
  };

  const handleGoToLast = () => {
    if (lastPostId) {
      router.push(`${pathname}?page=${lastPage}#post-${lastPostId}`);
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const canEditTitle = isModerator || (currentUserId === authorId);

  return (
    <aside className="forum-sidebar">
      <div className="sidebar-sticky-inner">
        <div className="sidebar-widget-container">
          {/* Topic Actions */}
          <div className="sidebar-widget topic-widget" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <MessageSquare size={16} className="text-secondary" />
              Sujet
            </h3>
            <button onClick={() => document.getElementById('quick-reply-area')?.scrollIntoView({ behavior: 'smooth' })}
              className="widget-button" style={{ background: 'var(--primary)', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <MessageSquare size={18} /><span>Répondre</span>
            </button>
            
            {canEditTitle && (
              <button 
                onClick={() => setShowEditTitleModal(true)}
                className="widget-button secondary-btn" 
                style={{ textAlign: 'left' }}
              >
                <Type size={18} />
                <span>Modifier le titre</span>
              </button>
            )}

            <button onClick={handleGoToLast}
              className="widget-button secondary-btn" style={{ textAlign: 'left' }}>
              <ChevronsDown size={18} /><span>Aller au dernier message</span>
            </button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="widget-button secondary-btn" style={{ textAlign: 'left' }}>
              <ArrowUp size={18} /><span>Haut de page</span>
            </button>

            {/* Moderator Actions */}
            {isModerator && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', fontWeight: 700 }}>Modération</span>
                
                <button 
                  onClick={handleTogglePin}
                  disabled={isPending}
                  className="widget-button secondary-btn" 
                  style={{ textAlign: 'left', color: isPinned ? '#eab308' : 'white' }}
                >
                  {isPinned ? <PinOff size={18} /> : <Pin size={18} />}
                  <span>{isPinned ? "Désépingler" : "Épingler"}</span>
                </button>

                <button 
                  onClick={() => setShowMoveModal(true)}
                  disabled={isPending}
                  className="widget-button secondary-btn" 
                  style={{ textAlign: 'left' }}
                >
                  <Move size={18} />
                  <span>Déplacer</span>
                </button>

                <button 
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isPending}
                  className="widget-button secondary-btn" 
                  style={{ textAlign: 'left', color: '#ff6666' }}
                >
                  <Trash2 size={18} />
                  <span>Supprimer sujet</span>
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="sidebar-widget" style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <h3 style={{ fontSize: '0.9rem', margin: 0, color: '#aaa' }}>Pages</h3>

              {/* Single navigation row */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'nowrap' }}>
                {/* First */}
                <Link href={getPageHref(1)} style={navBtn(currentPage === 1)} title="Première page">
                  <ChevronsLeft size={13} />
                </Link>
                {/* Prev */}
                <Link href={getPageHref(currentPage - 1)} style={navBtn(currentPage === 1)} title="Page précédente">
                  <ChevronLeft size={13} />
                </Link>

                {/* Smart tokens */}
                {tokens.map((t, i) =>
                  t === '...'
                    ? <span key={`d${i}`} style={{ color: '#555', fontSize: '0.75rem', lineHeight: '28px' }}>…</span>
                    : <Link key={t} href={getPageHref(t)} style={pageBtn(t === currentPage)}>{t}</Link>
                )}

                {/* Next */}
                <Link href={getPageHref(currentPage + 1)} style={navBtn(currentPage === totalPages)} title="Page suivante">
                  <ChevronRight size={13} />
                </Link>
                {/* Last */}
                <Link href={getPageHref(totalPages)} style={navBtn(currentPage === totalPages)} title="Dernière page">
                  <ChevronsRight size={13} />
                </Link>
              </div>

              {/* Jump-to input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#888' }}>
                <span style={{ whiteSpace: 'nowrap' }}>Page</span>
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
                    width: '40px', background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '5px',
                    color: 'white', textAlign: 'center', fontSize: '0.78rem',
                    padding: '3px 4px', outline: 'none',
                  }}
                />
                <span>/ {totalPages}</span>
              </div>
            </div>
          )}

          {/* Forum index */}
          <div className="sidebar-widget">
            <Link href="/forum" className="widget-button secondary-btn">
              <MessageSquare size={18} /><span>Index du Forum</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer le sujet"
      >
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ marginBottom: '1.5rem', color: '#ddd' }}>
            Êtes-vous sûr de vouloir supprimer définitivement ce sujet et tous ses messages ?
            Cette action est irréversible.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="widget-button secondary-btn"
              style={{ width: 'auto', padding: '0.5rem 1.5rem' }}
            >
              Annuler
            </button>
            <button 
              onClick={handleDeleteTopic}
              disabled={isPending}
              className="widget-button"
              style={{ width: 'auto', padding: '0.5rem 1.5rem', background: '#e04444' }}
            >
              {isPending ? "Suppression..." : "Confirmer la suppression"}
            </button>
          </div>
        </div>
      </Modal>

      <MoveTopicModal 
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        topicId={topicId}
        allForums={allForums}
      />

      <EditTopicTitleModal 
        isOpen={showEditTitleModal}
        onClose={() => setShowEditTitleModal(false)}
        topicId={topicId}
        initialTitle={topicTitle}
      />
    </aside>
  );
}
