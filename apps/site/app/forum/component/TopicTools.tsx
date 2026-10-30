"use client";

/**
 * Outils d'un sujet du forum (refonte, carte 086 ; remplace l'ancienne colonne TopicSidebar).
 *
 * Un même contenu est affiché à trois endroits, selon la taille de l'écran :
 * - sur ordinateur, une colonne à droite, collée en haut de l'écran pendant le défilement (`TopicToolsAside`) ;
 * - sur téléphone, un panneau « Outils du sujet » qui monte du bas, ouvert par un bouton de l'en-tête
 *   (`TopicToolsButton`), et la rubrique « Cette page » du panneau « Plus » de la barre basse ;
 * - sur téléphone encore, une barre collée en bas de l'écran, au-dessus de la barre de navigation, avec la pagination
 *   compacte et le bouton « Répondre » (`TopicReplyBar`).
 *
 * `TopicToolsProvider` garde l'état commun à ces morceaux (panneau ouvert, suivi du sujet, fenêtres de confirmation)
 * et le leur transmet par un contexte React (un moyen de partager des données entre composants sans les passer
 * de parent en enfant). Les actions et leurs confirmations sont reprises telles quelles de TopicSidebar.
 */
import { createContext, useContext, useEffect, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCircle,
  ChevronsDown,
  Eye,
  EyeOff,
  Lock as LockIcon,
  MessageSquare,
  Move,
  Pin,
  PinOff,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
  Trophy,
  Type,
  XCircle,
} from "lucide-react";
import { Button, Card, PageNav, Sheet, SheetContent, cn, toast } from "@bbfrance/ui";
import { deleteTopicPermanent, isFollowingTopic, toggleArchiveTopic, toggleFollowTopic, togglePinTopic, toggleTournamentRegistrations } from "@/app/forum/actions";
import { cancelTournament, finishTournament, unfinishTournament } from "@/app/tournois/actions";
import LockButton from "@/app/forum/component/LockButton";
import MoveTopicModal from "@/app/forum/component/MoveTopicModal";
import EditTopicTitleModal from "@/app/forum/component/EditTopicTitleModal";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import ReportModal from "@/common/components/ReportModal/ReportModal";
import Modal from "@/common/components/Modal/Modal";
import GlobalPortal from "@/common/components/GlobalPortal/GlobalPortal";

export interface TopicToolsProps {
  topicId: string;
  currentPage: number;
  totalPages: number;
  isModerator: boolean;
  isPinned: boolean;
  isLocked: boolean;
  isForumLocked: boolean;
  lastPostId: string;
  allForums: { id: string; name: string }[];
  topicTitle: string;
  authorId: string;
  currentUserId?: string;
  views: number;
  isArchived: boolean;
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
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({ isOpen: false, title: "", message: "", action: async () => {} });

  const canReply = !!currentUserId && (!(props.isLocked || props.isForumLocked) || props.isModerator);

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
        if (!res.success) toast.error(res.error || "Erreur lors du changement d'épinglage");
      } catch {
        toast.error("Erreur lors du changement d'épinglage");
      }
    });
  };

  const handleDeleteTopic = () => {
    startTransition(async () => {
      try {
        // En cas de succès, l'action redirige vers le forum : on n'arrive ici qu'en cas de refus.
        const res = await deleteTopicPermanent(topicId, topicTitle);
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
    },
  };

  return (
    <ToolsContext.Provider value={value}>
      {children}

      {/* Téléphone : panneau « Outils du sujet », et la même liste dans « Cette page » du panneau « Plus » */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent title="Outils du sujet">
          <ToolsSections />
        </SheetContent>
      </Sheet>
      <GlobalPortal target="#mobile-page-sidebar-slot">
        <div className="lg:hidden">
          <ToolsSections />
        </div>
      </GlobalPortal>

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

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Suppression du sujet" hideFooter={true}>
        <div className="flex flex-col gap-4 py-2 text-center">
          <p className="m-0 text-[1.05rem] text-bb-text">
            Supprimer le sujet :
            <strong className="mt-1 block text-lg text-bb-accent-text">{topicTitle}</strong> ?
          </p>
          <p className="m-0 flex items-start gap-2 rounded-bb-md border border-bb-danger-text p-4 text-left text-[0.95rem] leading-normal font-semibold text-bb-danger-text">
            <TriangleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>Attention : Tous les messages seront définitivement supprimés. L&apos;action est irréversible.</span>
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button type="button" variant="secondary" size="tap" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button type="button" variant="danger" size="tap" onClick={handleDeleteTopic} disabled={isPending}>
              Confirmer la suppression
            </Button>
          </div>
        </div>
      </Modal>

      <MoveTopicModal isOpen={showMoveModal} onClose={() => setShowMoveModal(false)} topicId={topicId} allForums={props.allForums} />
      <EditTopicTitleModal isOpen={showEditTitleModal} onClose={() => setShowEditTitleModal(false)} topicId={topicId} initialTitle={topicTitle} />
      <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} targetId={topicId} targetType="TOPIC" itemTitle={topicTitle} />
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
          <Button type="button" variant="secondary" size="tap" className={toolButton} onClick={t.open.togglePin} disabled={t.isPending}>
            {t.isPinned ? ico(PinOff) : ico(Pin)} {t.isPinned ? "Désépingler" : "Épingler"}
          </Button>
          <Button type="button" variant="secondary" size="tap" className={toolButton} onClick={() => t.run(t.open.move)} disabled={t.isPending}>
            {ico(Move)} Déplacer le sujet
          </Button>
          <Button type="button" variant="secondary" size="tap" className={toolButton} onClick={t.open.toggleArchive} disabled={t.isPending}>
            {t.isArchived ? ico(EyeOff) : ico(Eye)} {t.isArchived ? "Désarchiver" : "Archiver"}
          </Button>
          <LockButton id={t.topicId} type="topic" isLocked={t.isLocked} refonte />
          <Button type="button" variant="danger" size="tap" className={toolButton} onClick={() => t.run(t.open.deleteTopic)} disabled={t.isPending}>
            {ico(Trash2)} Supprimer le sujet
          </Button>
        </Group>
      )}
    </div>
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
