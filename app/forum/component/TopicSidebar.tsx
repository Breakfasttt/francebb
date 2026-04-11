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
  CheckCircle,
  XCircle,
  Shield,
  Check,
  Lock as LockIcon,
  Trophy,
  Eye,
  Bookmark,
  AlertTriangle,
  ChevronsDown,
  Mail
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";
import { togglePinTopic, deleteTopicPermanent, toggleArchiveTopic, isFollowingTopic, toggleFollowTopic, toggleTournamentRegistrations } from "@/app/forum/actions";
import Modal from "@/common/components/Modal/Modal";
import MoveTopicModal from "@/app/forum/component/MoveTopicModal";
import EditTopicTitleModal from "@/app/forum/component/EditTopicTitleModal";
import Pagination from "@/common/components/Pagination/Pagination";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";

import LockButton from "@/app/forum/component/LockButton";
import ReportModal from "@/common/components/ReportModal/ReportModal";

interface TopicSidebarProps {
  topicId: string;
  currentPage: number;
  totalPages: number;
  isModerator?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
  isForumLocked?: boolean;
  lastPostId?: string;
  lastPage?: number;
  allForums?: { id: string; name: string; }[];
  topicTitle?: string;
  authorId?: string;
  currentUserId?: string;
  views?: number;
  isArchived?: boolean;
  isTournament?: boolean;
  tournamentId?: string;
  canEditTournament?: boolean;
  isFinished?: boolean;
  isCancelled?: boolean;
  registrationsLocked?: boolean;
}

import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import { finishTournament, cancelTournament } from "@/app/tournaments/actions";
import toast from "react-hot-toast";

export default function TopicSidebar({ 
  topicId, 
  currentPage, 
  totalPages,
  isModerator = false,
  isPinned = false,
  isLocked = false,
  isForumLocked = false,
  lastPostId = "",
  lastPage = 1,
  allForums = [],
  topicTitle = "",
  authorId = "",
  currentUserId = "",
  views = 0,
  isArchived = false,
  isTournament = false,
  tournamentId,
  canEditTournament = false,
  isFinished = false,
  isCancelled = false,
  registrationsLocked = false
}: TopicSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<any>;
    isDanger?: boolean;
    label?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: async () => {},
  });

  const handleEditTitleClick = () => {
    if (isTournament && tournamentId) {
      router.push(`/forum/edit-tournament/${tournamentId}`);
    } else {
      setShowEditTitleModal(true);
    }
  };

  const openConfirm = (title: string, message: string, action: () => Promise<any>, isDanger = false, label = "Confirmer") => {
    setConfirmConfig({ isOpen: true, title, message, action, isDanger, label });
  };

  const handleFinish = () => {
    openConfirm(
      "Terminer le tournoi",
      "Voulez-vous marquer ce tournoi comme TERMINÉ ? Cela coupera les inscriptions et le marquera comme passé.",
      async () => {
        const res = await finishTournament(tournamentId!);
        if (res?.success) {
          toast.success("Tournoi terminé !");
          router.refresh();
        }
      },
      false,
      "Terminer"
    );
  };

  const handleCancel = () => {
    openConfirm(
      "Annuler le tournoi",
      "🚨 ATTENTION : Voulez-vous vraiment ANNULER ce tournoi ? Cette action est définitive.",
      async () => {
        const res = await cancelTournament(tournamentId!);
        if (res?.success) {
          toast.success("Tournoi annulé");
          router.refresh();
        }
      },
      true,
      "Annuler le tournoi"
    );
  };

  const handleToggleRegistrations = () => {
    const actionLabel = registrationsLocked ? "réouvrir" : "bloquer";
    openConfirm(
      `${registrationsLocked ? 'Réouvrir' : 'Bloquer'} les inscriptions`,
      `Voulez-vous vraiment ${actionLabel} les inscriptions pour ce tournoi ?`,
      async () => {
        const res = await toggleTournamentRegistrations(tournamentId!);
        if (res?.success) {
          toast.success(res.locked ? "Inscriptions bloquées" : "Inscriptions réouvertes");
          router.refresh();
        }
      },
      !registrationsLocked,
      registrationsLocked ? "Réouvrir" : "Bloquer les inscriptions"
    );
  };


  const handleToggleArchive = () => {
    startTransition(async () => {
      try {
        await toggleArchiveTopic(topicId);
        router.refresh();
      } catch (error: any) {
        alert(error.message);
      }
    });
  };

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

  useEffect(() => {
    let isMounted = true;
    async function loadFollowStatus() {
      if (!currentUserId) {
        if (isMounted) setIsFollowing(false);
        return;
      }

      const next = await isFollowingTopic(topicId);
      if (isMounted) setIsFollowing(next);
    }

    loadFollowStatus();
    return () => {
      isMounted = false;
    };
  }, [topicId, currentUserId]);

  const handleToggleFollow = () => {
    startTransition(async () => {
      const res = await toggleFollowTopic(topicId);
      if (!res.success) {
        alert(res.error || "Impossible de mettre à jour le suivi.");
        return;
      }

      setIsFollowing(res.isFollowing);
      router.refresh();
    });
  };

  return (
    <aside className="forum-sidebar">
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={async () => {
          startTransition(async () => {
            await confirmConfig.action();
            setConfirmConfig({ ...confirmConfig, isOpen: false });
          });
        }}
        isDanger={confirmConfig.isDanger}
        confirmLabel={confirmConfig.label}
      />
      
      <div className="sidebar-sticky-inner">
        <div className="sidebar-widget-container">
          
          {/* 1. Pages Block */}
          {(totalPages && totalPages > 1) && (
            <PremiumCard className="sidebar-widget pagination-widget" style={{ padding: '1rem' }}>
              <Pagination 
                currentPage={currentPage || 1}
                totalPages={totalPages}
                variant="sidebar"
                baseUrl={`/forum/topic/${topicId}`}
              />
            </PremiumCard>
          )}

          {/* 2. Topic Actions Block */}
          <div className="sidebar-widget topic-widget" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Sujet
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }} title={`${views.toLocaleString("fr-FR")} vues`}>
                 <Eye size={13} />
                 <span>{views.toLocaleString("fr-FR")}</span>
              </div>
            </div>

            {(isLocked || isForumLocked) && (
              <div style={{ 
                padding: '0.8rem', 
                background: 'rgba(var(--danger-rgb, 158, 29, 29), 0.1)', 
                border: '1px solid var(--danger)', 
                borderRadius: '8px',
                color: 'var(--danger)',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <LockIcon size={14} />
                <span>{isForumLocked ? "Forum verrouillé" : "Sujet verrouillé"}</span>
              </div>
            )}

            {(!(isLocked || isForumLocked) || isModerator) && (
              <button onClick={() => document.getElementById('quick-reply-area')?.scrollIntoView({ behavior: 'smooth' })}
                className="widget-button primary-btn">
                <MessageSquare size={16} /><span>Répondre</span>
              </button>
            )}
            
            {currentUserId && (
              <button
                onClick={handleToggleFollow}
                disabled={isPending}
                className="widget-button secondary-btn"
                style={{
                  borderColor: isFollowing ? 'var(--accent)' : 'var(--glass-border)',
                  color: isFollowing ? 'var(--accent)' : 'var(--foreground)',
                }}
              >
                <Bookmark size={16} style={{ opacity: isFollowing ? 1 : 0.85 }} />
                <span>{isFollowing ? "Arrêter de suivre" : "Suivre le sujet"}</span>
              </button>
            )}

            {!isTournament && canEditTitle && (
              <button 
                onClick={handleEditTitleClick}
                className="widget-button secondary-btn" 
              >
                <Type size={16} />
                <span>Modifier le titre</span>
              </button>
            )}

            {currentUserId && currentUserId !== authorId && (
              <button 
                onClick={() => setShowReportModal(true)}
                className="widget-button secondary-btn" 
              >
                <AlertTriangle size={16} />
                <span>Signaler</span>
              </button>
            )}

            <a 
              href={`${pathname}?page=${lastPage}#post-${lastPostId}`}
              onClick={handleGoToLast}
              className="widget-button secondary-btn" 
            >
              <ChevronsDown size={16} /><span>Dernier message</span>
            </a>

            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="widget-button secondary-btn">
              <ArrowUp size={16} /><span>Haut de page</span>
            </button>

            {/* 3. Tournament Administration Section */}
            {isTournament && canEditTournament && !isCancelled && (
              <div style={{ marginTop: '0.4rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={14} /> Gestion Tournoi
                </h3>
                
                <button 
                  onClick={handleEditTitleClick}
                  className="widget-button secondary-btn" 
                >
                  <Type size={16} />
                  <span>Modifier le tournoi</span>
                </button>

                {isFinished ? (
                  <Link 
                    href={`/forum/tournament/${tournamentId}/results`}
                    className="widget-button secondary-btn" 
                  >
                    <Trophy size={16} style={{ color: 'var(--accent)' }} />
                    <span>Publier les résultats</span>
                  </Link>
                ) : (
                  <>
                    <button 
                      onClick={handleFinish}
                      disabled={isPending}
                      className="widget-button secondary-btn" 
                    >
                      <CheckCircle size={16} />
                      <span>Terminer le tournoi</span>
                    </button>
                    
                    <button 
                      onClick={handleToggleRegistrations}
                      disabled={isPending}
                      className="widget-button secondary-btn" 
                      style={{ color: registrationsLocked ? 'var(--accent)' : 'var(--foreground)' }}
                    >
                      {registrationsLocked ? <Check size={16} /> : <LockIcon size={16} />}
                      <span>{registrationsLocked ? "Réouvrir inscriptions" : "Bloquer inscriptions"}</span>
                    </button>

                    <button 
                      onClick={handleCancel}
                      disabled={isPending}
                      className="widget-button secondary-btn" 
                      style={{ textAlign: 'left', color: 'var(--danger)', padding: '8px 12px' }}
                    >
                      <XCircle size={16} />
                      <span>Annuler le tournoi</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Moderator Actions */}
            {isModerator && (
              <div style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Modération</span>
                
                
                <button 
                  onClick={handleTogglePin}
                  disabled={isPending}
                  className="widget-button secondary-btn" 
                  style={{ color: isPinned ? 'var(--unread-marker)' : 'var(--foreground)' }}
                >
                  {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                  <span>{isPinned ? "Désépingler" : "Épingler"}</span>
                </button>

                <button 
                  onClick={() => setShowMoveModal(true)}
                  disabled={isPending}
                  className="widget-button secondary-btn" 
                >
                  <Move size={16} />
                  <span>Déplacer</span>
                </button>

                {/* Archivage */}
                <button 
                  onClick={handleToggleArchive}
                  disabled={isPending}
                  className="widget-button secondary-btn"
                  style={{ 
                    borderColor: isArchived ? 'var(--accent)' : 'var(--glass-border)',
                    color: isArchived ? 'var(--accent)' : 'var(--foreground)'
                  }}
                >
                  <Eye size={16} style={{ opacity: isArchived ? 1 : 0.7 }} />
                  <span>{isArchived ? "Désarchiver" : "Archiver"}</span>
                </button>

                <LockButton 
                  id={topicId} 
                  type="topic" 
                  isLocked={isLocked} 
                />

                <button 
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isPending}
                  className="widget-button secondary-btn" 
                  style={{ color: 'var(--danger)' }}
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
          <p style={{ marginBottom: '1rem', color: 'var(--foreground)', fontSize: '1.1rem' }}>
            Supprimer le sujet : <br/>
            <strong style={{ color: 'var(--primary)' }}>{topicTitle}</strong> ?
          </p>
          <div style={{ 
            background: 'var(--primary-transparent)', 
            border: '1px solid var(--primary)', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem' 
          }}>
            <p style={{ margin: 0, color: 'var(--danger)', fontSize: '0.9rem' }}>
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
      <ReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        targetId={topicId} 
        targetType="TOPIC" 
        itemTitle={topicTitle} 
      />
    </aside>
  );
}
