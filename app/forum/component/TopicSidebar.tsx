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
import CTAButton from "@/common/components/Button/CTAButton";
import ClassicButton from "@/common/components/Button/ClassicButton";
import AdminButton from "@/common/components/Button/AdminButton";
import DangerButton from "@/common/components/Button/DangerButton";

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

            {currentUserId && (!(isLocked || isForumLocked) || isModerator) && (
              <CTAButton onClick={() => document.getElementById('quick-reply-area')?.scrollIntoView({ behavior: 'smooth' })} icon={MessageSquare}>
                Répondre
              </CTAButton>
            )}
            
            {currentUserId && (
              <ClassicButton
                onClick={handleToggleFollow}
                isLoading={isPending}
                icon={Bookmark}
                style={{
                  borderColor: isFollowing ? 'var(--accent)' : undefined,
                  color: isFollowing ? 'var(--accent)' : undefined,
                }}
              >
                {isFollowing ? "Arrêter de suivre" : "Suivre le sujet"}
              </ClassicButton>
            )}

            {!isTournament && canEditTitle && (
              <ClassicButton 
                onClick={handleEditTitleClick}
                icon={Type}
              >
                Modifier le titre
              </ClassicButton>
            )}

            {currentUserId && currentUserId !== authorId && (
              <ClassicButton 
                onClick={() => setShowReportModal(true)}
                icon={AlertTriangle}
              >
                Signaler
              </ClassicButton>
            )}

            <ClassicButton 
              href={`${pathname}?page=${lastPage}#post-${lastPostId}`}
              onClick={handleGoToLast}
              icon={ChevronsDown}
            >
              Dernier message
            </ClassicButton>

            <ClassicButton 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              icon={ArrowUp}
            >
              Haut de page
            </ClassicButton>

            {/* 3. Tournament Administration Section */}
            {isTournament && canEditTournament && !isCancelled && (
              <div style={{ marginTop: '0.4rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={14} /> Gestion Tournoi
                </h3>
                
                <AdminButton 
                  onClick={handleEditTitleClick}
                  icon={Type}
                >
                  Modifier le tournoi
                </AdminButton>

                {isFinished ? (
                  <AdminButton 
                    href={`/forum/tournament/${tournamentId}/results`}
                    icon={Trophy}
                  >
                    Publier les résultats
                  </AdminButton>
                ) : (
                  <>
                    <AdminButton 
                      onClick={handleFinish}
                      isLoading={isPending}
                      icon={CheckCircle}
                    >
                      Terminer le tournoi
                    </AdminButton>
                    
                    <AdminButton 
                      onClick={handleToggleRegistrations}
                      isLoading={isPending}
                      icon={registrationsLocked ? Check : LockIcon}
                      style={{ color: registrationsLocked ? 'var(--accent)' : undefined }}
                    >
                      {registrationsLocked ? "Réouvrir inscriptions" : "Bloquer inscriptions"}
                    </AdminButton>

                    <DangerButton 
                      onClick={handleCancel}
                      isLoading={isPending}
                      icon={XCircle}
                    >
                      Annuler le tournoi
                    </DangerButton>
                  </>
                )}
              </div>
            )}

            {/* Moderator Actions */}
            {isModerator && (
              <div style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Modération</span>
                
                
                <AdminButton 
                  onClick={handleTogglePin}
                  isLoading={isPending}
                  icon={isPinned ? PinOff : Pin}
                  style={{ color: isPinned ? 'var(--unread-marker)' : undefined }}
                >
                  {isPinned ? "Désépingler" : "Épingler"}
                </AdminButton>

                <AdminButton 
                  onClick={() => setShowMoveModal(true)}
                  isLoading={isPending}
                  icon={Move}
                >
                  Déplacer
                </AdminButton>

                {/* Archivage */}
                <AdminButton 
                  onClick={handleToggleArchive}
                  isLoading={isPending}
                  icon={Eye}
                  style={{ color: isArchived ? 'var(--accent)' : undefined }}
                >
                  {isArchived ? "Désarchiver" : "Archiver"}
                </AdminButton>

                <LockButton 
                  id={topicId} 
                  type="topic" 
                  isLocked={isLocked} 
                />

                <DangerButton 
                  onClick={() => setShowDeleteModal(true)}
                  isLoading={isPending}
                  icon={Trash2}
                >
                  Supprimer sujet
                </DangerButton>
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
            <ClassicButton onClick={() => setShowDeleteModal(false)}>Annuler</ClassicButton>
            <DangerButton onClick={handleDeleteTopic} isLoading={isPending}>Confirmer la suppression</DangerButton>
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
