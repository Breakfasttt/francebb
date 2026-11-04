"use client";

/**
 * Outils d'un sujet du forum (refonte, carte 086 ; remplace l'ancienne colonne TopicSidebar).
 *
 * Un même contenu est affiché à deux endroits, selon la taille de l'écran, plus une barre propre au téléphone :
 * - sur ordinateur, une colonne à droite, collée en haut de l'écran pendant le défilement (`TopicToolsAside`) ;
 * - sur téléphone, un panneau « Outils du sujet » qui monte du bas, ouvert par un bouton de l'en-tête
 *   (`TopicToolsButton`) ;
 * - sur téléphone encore, une barre collée en bas de l'écran, au-dessus de la barre de navigation, avec la pagination
 *   compacte et le bouton « Répondre » (`TopicReplyBar`).
 *
 * `TopicToolsProvider` garde l'état commun à ces morceaux (panneau ouvert, suivi du sujet, fenêtres de confirmation)
 * et le leur transmet par un contexte React (un moyen de partager des données entre composants sans les passer
 * de parent en enfant). Les actions et leurs confirmations sont reprises telles quelles de TopicSidebar.
 *
 * Suppression d'un sujet (carte 165) : elle est douce et réservée aux modérateurs, avec une raison. Un sujet supprimé
 * n'est plus montré qu'aux modérateurs : `DeletedTopicBanner` l'annonce en haut de la page, avec « Restaurer le sujet »,
 * et les outils du sujet se réduisent à ce bouton.
 *
 * Scinder et fusionner (carte 169, modérateurs, sauf pour un sujet de tournoi) :
 * - « Scinder le sujet » passe la page en mode « scission » : une case « Déplacer » apparaît en tête de chaque message
 *   (sauf le premier, qui reste dans le sujet, `SplitPostCheckbox`). Le nombre de messages cochés, « Annuler » et
 *   « Scinder… » sont dans une barre collée en bas de l'écran sur téléphone, et dans le groupe « Modération » de la
 *   colonne, collée en haut, sur ordinateur. « Scinder… » ouvre la fenêtre qui demande le titre et le forum du nouveau
 *   sujet (TopicSplitMerge.tsx).
 * - « Fusionner avec un autre sujet » ouvre la fenêtre de recherche du sujet d'arrivée.
 */
import { createContext, useContext, useEffect, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArchiveRestore,
  ArrowUp,
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCircle,
  ChevronsDown,
  Eye,
  EyeOff,
  GitMerge,
  Lock as LockIcon,
  MessageSquare,
  Move,
  Pin,
  PinOff,
  RotateCcw,
  Scissors,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
  Trophy,
  Type,
  XCircle,
} from "lucide-react";
import { Button, Card, ConfirmDialog, Field, PageNav, Sheet, SheetContent, Textarea, cn, toast } from "@bbfrance/ui";
import { deleteTopic, isFollowingTopic, restoreTopic, toggleArchiveTopic, toggleFollowTopic, togglePinTopic, toggleTournamentRegistrations } from "@/app/forum/actions";
import { cancelTournament, finishTournament, unfinishTournament } from "@/app/tournois/actions";
import LockButton from "@/app/forum/component/LockButton";
import MoveTopicModal from "@/app/forum/component/MoveTopicModal";
import EditTopicTitleModal from "@/app/forum/component/EditTopicTitleModal";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import ReportModal from "@/common/components/ReportModal/ReportModal";
import { MergeTopicDialog, SplitTopicDialog, type SplitForumOption } from "@/app/forum/component/TopicSplitMerge";

export interface TopicToolsProps {
  topicId: string;
  currentPage: number;
  totalPages: number;
  isModerator: boolean;
  isPinned: boolean;
  isLocked: boolean;
  isForumLocked: boolean;
  lastPostId: string;
  /** Forums accessibles au modérateur : destination de « Déplacer » et de « Scinder ». */
  allForums: SplitForumOption[];
  /** Forum du sujet, proposé par défaut pour le nouveau sujet d'une scission. */
  forumId: string;
  topicTitle: string;
  authorId: string;
  currentUserId?: string;
  views: number;
  isArchived: boolean;
  /** Sujet supprimé (carte 165) : seul un modérateur voit la page, avec « Restaurer le sujet ». */
  isDeleted: boolean;
  isTournament: boolean;
  tournamentId?: string;
  canEditTournament: boolean;
  isFinished: boolean;
  isCancelled: boolean;
  registrationsLocked: boolean;
}

interface ConfirmConfig {
  isOpen: boolean;
  title: string;
  message: string;
  action: () => Promise<unknown>;
  isDanger?: boolean;
  label?: string;
}

interface ToolsContextValue extends TopicToolsProps {
  canReply: boolean;
  openSheet: () => void;
  /** Ferme le panneau du téléphone (s'il est ouvert). */
  closeSheet: () => void;
  /** Ferme le panneau du téléphone (s'il est ouvert) puis lance l'action : une fenêtre ne s'ouvre jamais par-dessus. */
  run: (action: () => void) => void;
  isPending: boolean;
  isFollowing: boolean;
  toggleFollow: () => void;
  scrollToReply: () => void;
  goToLast: (event: React.MouseEvent) => void;
  lastHref: string;
  open: {
    editTitle: () => void;
    report: () => void;
    move: () => void;
    deleteTopic: () => void;
    finish: () => void;
    unfinish: () => void;
    cancel: () => void;
    toggleRegistrations: () => void;
    togglePin: () => void;
    toggleArchive: () => void;
    restoreTopic: () => void;
    merge: () => void;
  };
  /** Mode « scission » (carte 169) : messages cochés pour partir dans un nouveau sujet. */
  split: {
    active: boolean;
    selected: string[];
    start: () => void;
    cancel: () => void;
    toggle: (postId: string) => void;
    openDialog: () => void;
  };
}

const ToolsContext = createContext<ToolsContextValue | null>(null);

function useTools(): ToolsContextValue {
  const value = useContext(ToolsContext);
  if (!value) throw new Error("Les outils du sujet doivent être placés dans TopicToolsProvider.");
  return value;
}

/** Adresse d'une page du sujet (le paramètre ?page= reste celui du site). */
const pageHref = (topicId: string, page: number) => `/forum/topic/${topicId}?page=${page}`;

export function TopicToolsProvider({ children, ...props }: TopicToolsProps & { children: ReactNode }) {
  const { topicId, currentPage, totalPages, lastPostId, isTournament, tournamentId, registrationsLocked, topicTitle, currentUserId } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [splitActive, setSplitActive] = useState(false);
  const [splitSelected, setSplitSelected] = useState<string[]>([]);
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({ isOpen: false, title: "", message: "", action: async () => {} });

  const canReply = !!currentUserId && !props.isDeleted && (!(props.isLocked || props.isForumLocked) || props.isModerator);

  // État du suivi, lu au chargement (comme dans l'ancienne colonne)
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

  const run = (action: () => void) => {
    setSheetOpen(false);
    action();
  };

  const openConfirm = (title: string, message: string, action: () => Promise<unknown>, isDanger = false, label = "Confirmer") => {
    setConfirmConfig({ isOpen: true, title, message, action, isDanger, label });
  };

  const handleEditTitleClick = () => {
    if (isTournament && tournamentId) {
      router.push(`/forum/edit-tournament/${tournamentId}`);
    } else {
      setShowEditTitleModal(true);
    }
  };

  const handleFinish = () =>
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

  const handleUnfinish = () =>
    openConfirm(
      "Réouvrir le tournoi",
      "Voulez-vous marquer ce tournoi comme ACTIF ? Cela réouvrira les inscriptions.",
      async () => {
        const res = await unfinishTournament(tournamentId!);
        if (res?.success) {
          toast.success("Tournoi réouvert !");
          router.refresh();
        }
      },
      false,
      "Réouvrir"
    );

  const handleCancel = () =>
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

  const handleToggleRegistrations = () => {
    const actionLabel = registrationsLocked ? "réouvrir" : "bloquer";
    openConfirm(
      `${registrationsLocked ? "Réouvrir" : "Bloquer"} les inscriptions`,
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
        const res = await toggleArchiveTopic(topicId);
        if (!res.success) {
          toast.error(res.error || "Erreur lors de l'archivage");
          return;
        }
        // Retour visible de l'action (carte 168) : avant, rien ne montrait que le sujet était archivé
        toast.success(props.isArchived ? "Sujet désarchivé" : "Sujet archivé");
        router.refresh();
      } catch {
        toast.error("Erreur lors de l'archivage");
      }
    });
  };

  const handleTogglePin = () => {
    startTransition(async () => {
      try {
        const res = await togglePinTopic(topicId);
        if (!res.success) {
          toast.error(res.error || "Erreur lors du changement d'épinglage");
          return;
        }
        // Retour visible de l'action et page relue, pour que le bouton change de libellé (carte 168)
        toast.success(props.isPinned ? "Sujet désépinglé" : "Sujet épinglé");
        router.refresh();
      } catch {
        toast.error("Erreur lors du changement d'épinglage");
      }
    });
  };

  const handleDeleteTopic = () => {
    if (!deleteReason.trim()) {
      toast.error("Indiquez la raison de la suppression.");
      return;
    }
    startTransition(async () => {
      try {
        // En cas de succès, l'action redirige vers le forum : on n'arrive ici qu'en cas de refus.
        const res = await deleteTopic(topicId, deleteReason);
        if (!res.success) {
          toast.error(res.error || "Erreur lors de la suppression du sujet");
          setShowDeleteModal(false);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        // La redirection de Next.js passe par une erreur spéciale, gérée par le framework lui-même
        if (errorMessage.includes("NEXT_REDIRECT")) return;
        toast.error("Erreur lors de la suppression du sujet");
        setShowDeleteModal(false);
      }
    });
  };

  const handleRestoreTopic = () => {
    startTransition(async () => {
      const res = await restoreTopic(topicId);
      setShowRestoreModal(false);
      if (!res.success) {
        toast.error(res.error || "Erreur lors de la restauration du sujet");
        return;
      }
      toast.success("Sujet restauré");
      router.refresh();
    });
  };

  const toggleFollow = () => {
    startTransition(async () => {
      const res = await toggleFollowTopic(topicId);
      if (!res.success) {
        toast.error(res.error || "Impossible de mettre à jour le suivi.");
        return;
      }
      setIsFollowing(res.isFollowing);
      router.refresh();
    });
  };

  const scrollToReply = () => document.getElementById("quick-reply-area")?.scrollIntoView({ behavior: "smooth" });

  // Sur la dernière page, « Dernier message » fait défiler jusqu'à lui au lieu de recharger la page
  const goToLast = (event: React.MouseEvent) => {
    setSheetOpen(false);
    if (currentPage === totalPages) {
      event.preventDefault();
      const el = document.getElementById(`post-${lastPostId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }
    }
  };

  const value: ToolsContextValue = {
    ...props,
    canReply,
    openSheet: () => setSheetOpen(true),
    closeSheet: () => setSheetOpen(false),
    run,
    isPending,
    isFollowing,
    toggleFollow,
    scrollToReply,
    goToLast,
    lastHref: `${pageHref(topicId, totalPages)}#post-${lastPostId}`,
    open: {
      editTitle: handleEditTitleClick,
      report: () => setShowReportModal(true),
      move: () => setShowMoveModal(true),
      deleteTopic: () => setShowDeleteModal(true),
      finish: handleFinish,
      unfinish: handleUnfinish,
      cancel: handleCancel,
      toggleRegistrations: handleToggleRegistrations,
      togglePin: handleTogglePin,
      toggleArchive: handleToggleArchive,
      restoreTopic: () => setShowRestoreModal(true),
      merge: () => setShowMergeDialog(true),
    },
    split: {
      active: splitActive,
      selected: splitSelected,
      start: () => {
        setSplitSelected([]);
        setSplitActive(true);
      },
      cancel: () => {
        setSplitActive(false);
        setSplitSelected([]);
      },
      toggle: (postId: string) =>
        setSplitSelected((current) => (current.includes(postId) ? current.filter((id) => id !== postId) : [...current, postId])),
      openDialog: () => {
        if (splitSelected.length === 0) {
          toast.error("Cochez au moins un message à déplacer.");
          return;
        }
        setShowSplitDialog(true);
      },
    },
  };

  return (
    <ToolsContext.Provider value={value}>
      {children}

      {/* Téléphone : panneau « Outils du sujet » */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent title="Outils du sujet">
          <ToolsSections />
        </SheetContent>
      </Sheet>

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

      <ConfirmDialog
        open={showDeleteModal}
        onOpenChange={(open) => {
          setShowDeleteModal(open);
          if (!open) setDeleteReason("");
        }}
        title="Supprimer le sujet"
        message={
          isTournament
            ? `Le sujet « ${topicTitle} » et son tournoi disparaîtront du forum et de la liste des tournois. Rien n'est effacé : un modérateur pourra restaurer le sujet. Un tournoi qui a des résultats publiés doit d'abord être annulé.`
            : `Le sujet « ${topicTitle} » et ses messages disparaîtront du forum pour les membres. Rien n'est effacé : un modérateur pourra restaurer le sujet.`
        }
        confirmLabel="Supprimer le sujet"
        danger
        pending={isPending}
        onConfirm={handleDeleteTopic}
      >
        <Field label="Raison de la suppression (obligatoire)" htmlFor="topic-delete-reason">
          <Textarea
            id="topic-delete-reason"
            value={deleteReason}
            onChange={(event) => setDeleteReason(event.target.value)}
            placeholder="Ex : spam, sujet en double…"
            rows={3}
            className="resize-none [font-family:inherit]"
          />
        </Field>
      </ConfirmDialog>

      <ConfirmDialog
        open={showRestoreModal}
        onOpenChange={setShowRestoreModal}
        title="Restaurer le sujet"
        message="Le sujet et tous ses messages seront de nouveau visibles par les membres, à leur place dans le forum."
        confirmLabel="Restaurer le sujet"
        pending={isPending}
        onConfirm={handleRestoreTopic}
      />

      <MoveTopicModal isOpen={showMoveModal} onClose={() => setShowMoveModal(false)} topicId={topicId} allForums={props.allForums} />
      <EditTopicTitleModal isOpen={showEditTitleModal} onClose={() => setShowEditTitleModal(false)} topicId={topicId} initialTitle={topicTitle} />
      <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} targetId={topicId} targetType="TOPIC" itemTitle={topicTitle} />
      {props.isModerator && !isTournament && (
        <>
          <SplitTopicDialog
            open={showSplitDialog}
            onOpenChange={setShowSplitDialog}
            topicId={topicId}
            postIds={splitSelected}
            forums={props.allForums}
            defaultForumId={props.forumId}
            onDone={() => {
              setSplitActive(false);
              setSplitSelected([]);
            }}
          />
          <MergeTopicDialog open={showMergeDialog} onOpenChange={setShowMergeDialog} topicId={topicId} topicTitle={topicTitle} />
        </>
      )}
    </ToolsContext.Provider>
  );
}

/** Titre discret d'un groupe d'outils. */
const groupTitle = "m-0 border-0 p-0 text-[0.8125rem] font-bold tracking-wider text-bb-text-muted uppercase not-italic";
const toolButton = "w-full justify-start";
const ico = (Icon: typeof Eye) => <Icon size={18} aria-hidden="true" />;

/** Un groupe d'outils : une carte dans la colonne de l'ordinateur, une section séparée par un filet dans les panneaux. */
function Group({ asCards, title, label, children }: { asCards: boolean; title: string; label: string; children: ReactNode }) {
  return asCards ? (
    <Card className="flex flex-col gap-2 p-4" role="group" aria-label={label}>
      <h2 className={groupTitle}>{title}</h2>
      {children}
    </Card>
  ) : (
    <section className="flex flex-col gap-2 border-b border-bb-border py-4 first:pt-1 last:border-b-0" aria-label={label}>
      <h2 className={groupTitle}>{title}</h2>
      {children}
    </section>
  );
}

/** Les groupes d'outils : Sujet, Gestion du tournoi, Modération. */
function ToolsSections({ asCards = false }: { asCards?: boolean }) {
  const t = useTools();

  const isAuthor = !!t.currentUserId && t.currentUserId === t.authorId;
  const canEditTitle = t.isModerator || isAuthor;

  // Sujet supprimé : seul un modérateur voit la page, et le seul outil utile est de le restaurer
  if (t.isDeleted) {
    return (
      <div className={cn("flex flex-col", asCards && "gap-4")}>
        <Group asCards={asCards} title="Modération" label="Modération du sujet">
          <Button type="button" variant="primary" size="tap" className={toolButton} onClick={() => t.run(t.open.restoreTopic)} disabled={t.isPending}>
            {ico(ArchiveRestore)} Restaurer le sujet
          </Button>
        </Group>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", asCards && "gap-4")}>
      <Group asCards={asCards} title="Sujet" label="Outils du sujet">
        <p className="m-0 flex items-center gap-2 text-sm text-bb-text-muted">
          <Eye size={16} aria-hidden="true" />
          <span>
            {t.views.toLocaleString("fr-FR")} vue{t.views > 1 ? "s" : ""}
          </span>
        </p>

        {(t.isLocked || t.isForumLocked) && (
          <p className="m-0 flex items-center gap-2 rounded-bb-md border border-bb-danger-text px-3 py-2 text-sm font-semibold text-bb-danger-text">
            <LockIcon size={16} aria-hidden="true" />
            <span>{t.isForumLocked ? "Forum verrouillé" : "Sujet verrouillé"}</span>
          </p>
        )}

        {t.canReply && (
          <Button type="button" variant="primary" size="tap" className={toolButton} onClick={() => t.run(t.scrollToReply)}>
            {ico(MessageSquare)} Répondre
          </Button>
        )}

        {t.currentUserId && (
          <Button
            type="button"
            variant="secondary"
            size="tap"
            className={cn(toolButton, t.isFollowing && "border-bb-accent text-bb-accent-text")}
            onClick={t.toggleFollow}
            disabled={t.isPending}
          >
            {t.isFollowing ? ico(BookmarkCheck) : ico(Bookmark)} {t.isFollowing ? "Arrêter de suivre" : "Suivre le sujet"}
          </Button>
        )}

        {!t.isTournament && canEditTitle && (
          <Button type="button" variant="secondary" size="tap" className={toolButton} onClick={() => t.run(t.open.editTitle)}>
            {ico(Type)} Modifier le titre
          </Button>
        )}

        {t.currentUserId && !isAuthor && (
          <Button type="button" variant="secondary" size="tap" className={toolButton} onClick={() => t.run(t.open.report)}>
            {ico(TriangleAlert)} Signaler le sujet
          </Button>
        )}

        <Button asChild variant="secondary" size="tap" className={toolButton}>
          <Link href={t.lastHref} onClick={t.goToLast}>
            {ico(ChevronsDown)} Dernier message
          </Link>
        </Button>

        <Button type="button" variant="secondary" size="tap" className={toolButton} onClick={() => t.run(() => window.scrollTo({ top: 0, behavior: "smooth" }))}>
          {ico(ArrowUp)} Haut de page
        </Button>
      </Group>

      {t.isTournament && t.canEditTournament && !t.isCancelled && (
        <Group asCards={asCards} title="Gestion du tournoi" label="Gestion du tournoi">
          <Button type="button" variant="secondary" size="tap" className={toolButton} onClick={() => t.run(t.open.editTitle)}>
            {ico(Type)} Modifier le tournoi
          </Button>
          {t.isFinished ? (
            <>
              <Button asChild variant="secondary" size="tap" className={toolButton}>
                <Link href={`/forum/tournament/${t.tournamentId}/results`}>
                  {ico(Trophy)} Publier les résultats
                </Link>
              </Button>
              <Button type="button" variant="secondary" size="tap" className={toolButton} onClick={() => t.run(t.open.unfinish)} disabled={t.isPending}>
                {ico(RotateCcw)} Réouvrir le tournoi
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="secondary" size="tap" className={toolButton} onClick={() => t.run(t.open.finish)} disabled={t.isPending}>
                {ico(CheckCircle)} Terminer le tournoi
              </Button>
              <Button type="button" variant="secondary" size="tap" className={toolButton} onClick={() => t.run(t.open.toggleRegistrations)} disabled={t.isPending}>
                {t.registrationsLocked ? ico(Check) : ico(LockIcon)} {t.registrationsLocked ? "Réouvrir les inscriptions" : "Bloquer les inscriptions"}
              </Button>
              <Button type="button" variant="danger" size="tap" className={toolButton} onClick={() => t.run(t.open.cancel)} disabled={t.isPending}>
                {ico(XCircle)} Annuler le tournoi
              </Button>
            </>
          )}
        </Group>
      )}

      {t.isModerator && (
        <Group asCards={asCards} title="Modération" label="Modération du sujet">
          <Button type="button" variant="secondary" size="tap" className={toolButton} onClick={() => t.run(t.open.togglePin)} disabled={t.isPending}>
            {t.isPinned ? ico(PinOff) : ico(Pin)} {t.isPinned ? "Désépingler" : "Épingler"}
          </Button>
          <Button type="button" variant="secondary" size="tap" className={toolButton} onClick={() => t.run(t.open.move)} disabled={t.isPending}>
            {ico(Move)} Déplacer le sujet
          </Button>
          <Button type="button" variant="secondary" size="tap" className={toolButton} onClick={() => t.run(t.open.toggleArchive)} disabled={t.isPending}>
            {t.isArchived ? ico(EyeOff) : ico(Eye)} {t.isArchived ? "Désarchiver" : "Archiver"}
          </Button>
          <LockButton id={t.topicId} type="topic" isLocked={t.isLocked} onDone={t.closeSheet} />
          {/* Scinder et fusionner (carte 169) : impossible pour un sujet de tournoi, attaché à son premier message */}
          {!t.isTournament && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="tap"
                className={cn(toolButton, t.split.active && "border-bb-accent text-bb-accent-text")}
                onClick={() => t.run(t.split.active ? t.split.cancel : t.split.start)}
                aria-pressed={t.split.active}
                disabled={t.isPending}
              >
                {ico(Scissors)} {t.split.active ? "Arrêter la scission" : "Scinder le sujet"}
              </Button>
              {t.split.active && (
                <div className="flex flex-col gap-2 rounded-bb-md border border-bb-accent p-3 max-lg:hidden">
                  <p className="m-0 text-sm font-semibold text-bb-text" aria-live="polite">
                    {splitCountText(t.split.selected.length)}
                  </p>
                  <Button type="button" variant="primary" size="tap" className={toolButton} onClick={t.split.openDialog} disabled={t.split.selected.length === 0}>
                    {ico(Scissors)} Scinder les messages choisis…
                  </Button>
                </div>
              )}
              <Button type="button" variant="secondary" size="tap" className={toolButton} onClick={() => t.run(t.open.merge)} disabled={t.isPending}>
                {ico(GitMerge)} Fusionner avec un autre sujet
              </Button>
            </>
          )}
          <Button type="button" variant="danger" size="tap" className={toolButton} onClick={() => t.run(t.open.deleteTopic)} disabled={t.isPending}>
            {ico(Trash2)} Supprimer le sujet
          </Button>
        </Group>
      )}
    </div>
  );
}

/**
 * Bandeau « Sujet supprimé » (carte 165), en haut d'un sujet supprimé : seuls les modérateurs voient cette page. Il dit
 * qui a supprimé le sujet, quand et pourquoi, et propose « Restaurer le sujet ».
 */
export function DeletedTopicBanner({
  deletedAt,
  deletedByName,
  reason,
  byAuthor,
}: {
  deletedAt: Date | string | null;
  deletedByName: string | null;
  reason: string | null;
  /** Supprimé par son auteur, en supprimant le premier message d'un sujet sans réponse. */
  byAuthor: boolean;
}) {
  const t = useTools();
  const when = deletedAt
    ? new Date(deletedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;
  const who = byAuthor ? "par son auteur" : `par ${deletedByName || "un modérateur"}`;
  return (
    <div role="status" className="mb-4 flex flex-col gap-3 rounded-bb-lg border border-bb-danger-text bg-bb-surface px-4 py-3 text-bb-text lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <Trash2 size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-bb-danger-text" />
        <div className="min-w-0">
          <p className="m-0 font-bold text-bb-danger-text">Sujet supprimé</p>
          <p className="m-0 text-sm break-words text-bb-text-muted">
            Supprimé {who}
            {when ? ` le ${when}` : ""}
            {reason ? `, raison : ${reason}` : ""}. Les membres ne le voient plus ; vous le voyez parce que vous êtes modérateur.
          </p>
        </div>
      </div>
      <Button type="button" variant="primary" size="tap" className="w-full shrink-0 lg:w-auto" onClick={t.open.restoreTopic} disabled={t.isPending}>
        <ArchiveRestore size={18} aria-hidden="true" /> Restaurer le sujet
      </Button>
    </div>
  );
}

/**
 * Case « Déplacer » en tête d'un message, affichée seulement en mode « scission » (carte 169). Le premier message du
 * sujet n'en a pas : il reste dans le sujet d'origine. Hors des outils d'un sujet, elle n'affiche rien.
 */
export function SplitPostCheckbox({ postId, isFirstPost }: { postId: string; isFirstPost: boolean }) {
  const t = useContext(ToolsContext);
  if (!t?.split.active || isFirstPost) return null;
  const checked = t.split.selected.includes(postId);
  return (
    <label
      className={cn(
        "flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-bb-md border px-2.5 text-sm font-semibold",
        checked ? "border-bb-accent bg-bb-accent-soft text-bb-accent-text" : "border-bb-border text-bb-text"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => t.split.toggle(postId)}
        aria-label="Déplacer ce message vers le nouveau sujet"
        className="size-5 accent-[var(--bb-accent)]"
      />
      <span aria-hidden="true" className="max-[374px]:hidden">
        Déplacer
      </span>
    </label>
  );
}

/** « Cochez les messages à déplacer », ou le nombre de messages cochés. */
function splitCountText(count: number) {
  return count === 0 ? "Cochez les messages à déplacer" : `${count} message${count > 1 ? "s" : ""} choisi${count > 1 ? "s" : ""}`;
}

/**
 * Barre du mode « scission » sur téléphone (carte 169), collée en bas de l'écran : nombre de messages cochés,
 * « Annuler » et « Scinder… ». Elle prend la place de la barre de réponse. Sur ordinateur, les mêmes informations sont
 * dans la colonne des outils.
 */
function SplitBar() {
  const t = useTools();
  const count = t.split.selected.length;
  return (
    <>
      <div aria-hidden="true" className="h-16 lg:hidden" />
      <div
        data-page-bottom-bar="always"
        role="region"
        aria-label="Scission du sujet"
        className="fixed inset-x-0 bottom-[var(--app-bottom-nav-space)] z-[4000] border-t border-bb-border bg-bb-surface px-3 py-1.5 lg:hidden"
      >
        <div className="mx-auto flex max-w-[1232px] items-center justify-between gap-2">
          <p className="m-0 min-w-0 text-sm font-semibold text-bb-text" aria-live="polite">
            {splitCountText(count)}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="secondary" size="tap" onClick={t.split.cancel}>
              Annuler
            </Button>
            <Button type="button" variant="primary" size="tap" onClick={t.split.openDialog} disabled={count === 0} aria-label="Scinder les messages choisis">
              <Scissors size={18} aria-hidden="true" /> Scinder…
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/** Ordinateur : la colonne des outils, à droite, collée en haut de l'écran pendant le défilement. */
export function TopicToolsAside() {
  return (
    // Plus haute que l'écran (modérateur et organisateur), la colonne défile pour elle-même
    <aside className="hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:overscroll-contain" aria-label="Outils du sujet">
      <ToolsSections asCards />
    </aside>
  );
}

/** Téléphone : bouton de l'en-tête qui ouvre le panneau « Outils du sujet ». */
export function TopicToolsButton() {
  const t = useTools();
  return (
    <Button type="button" variant="secondary" size="tap-icon" aria-label="Outils du sujet" className="shrink-0 lg:hidden" onClick={t.openSheet}>
      <SlidersHorizontal size={20} aria-hidden="true" />
    </Button>
  );
}

/** Pagination compacte : « ‹ Page 3 sur 5 › » et un accès direct au dernier message. */
export function TopicPageNav({ className }: { className?: string }) {
  const t = useTools();
  if (t.totalPages <= 1) return null;
  return (
    <PageNav
      page={t.currentPage}
      totalPages={t.totalPages}
      hrefFor={(page) => pageHref(t.topicId, page)}
      lastHref={t.lastHref}
      linkComponent={Link}
      className={className}
    />
  );
}

/**
 * Téléphone : barre collée en bas de l'écran, juste au-dessus de la barre de navigation (variable
 * --app-bottom-nav-space), avec la pagination compacte et « Répondre ». Elle s'efface pendant la saisie, quand le
 * clavier est ouvert (attribut data-typing posé par la coquille). Rien n'est affiché s'il n'y a ni plusieurs pages
 * ni réponse possible.
 */
export function TopicReplyBar() {
  const t = useTools();
  const [replyOnScreen, setReplyOnScreen] = useState(false);

  // Quand la zone de réponse est à l'écran, la barre s'efface : « Répondre » n'y sert plus, et la barre qui réapparaît
  // à la fermeture du clavier se glisserait sous le doigt au moment d'appuyer sur « Envoyer ma réponse »
  useEffect(() => {
    const area = document.getElementById("quick-reply-area");
    if (!area || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setReplyOnScreen(entry.isIntersecting));
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  if (t.split.active) return <SplitBar />;
  if (t.totalPages <= 1 && !t.canReply) return null;
  return (
    <>
      {/* Réserve la hauteur de la barre en bas de la page, pour qu'elle ne cache pas la fin du contenu */}
      <div aria-hidden="true" className="h-16 lg:hidden" />
      {!replyOnScreen && (
        <div data-page-bottom-bar className="fixed inset-x-0 bottom-[var(--app-bottom-nav-space)] z-[4000] border-t border-bb-border bg-bb-surface px-3 py-1.5 lg:hidden [html[data-typing=true]_&]:hidden">
          <div className="mx-auto flex max-w-[1232px] items-center justify-between gap-2">
            {/* Pagination resserrée (le texte « Page N sur M » perd sa largeur minimale) pour tenir sur 360 pixels */}
            {t.totalPages > 1 ? <TopicPageNav className="min-w-0 gap-0 border-0 bg-transparent p-0 [&>span]:min-w-0 [&>span]:px-1.5" /> : <span />}
            {t.canReply && (
              <Button type="button" variant="primary" size="tap" onClick={t.scrollToReply} className="min-w-11 shrink-0 max-[374px]:px-3">
                <MessageSquare size={18} aria-hidden="true" />
                {/* Sous 375 pixels de large, seule l'icône reste visible ; le nom « Répondre » reste lu par les lecteurs d'écran */}
                <span className="max-[374px]:sr-only">Répondre</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
