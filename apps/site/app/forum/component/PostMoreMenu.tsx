"use client";

/**
 * Menu « ⋯ » d'un message (refonte, carte 086) : les actions rares, rangées hors de la vue pour alléger le message.
 * Sur téléphone, un panneau qui monte du bas ; sur ordinateur, une liste déroulante (composant ActionMenu).
 * - Partager : copie le lien du message (…/forum/topic/id?page=N#post-id) et affiche « Lien copié ! ».
 * - Signaler ce message (membre qui n'en est pas l'auteur), avec la fenêtre de signalement.
 * - Marquer comme non lu à partir d'ici (membre) : le membre reste sur le sujet, une notification le confirme (carte 169).
 * - Modifier (auteur ou modérateur), Supprimer (auteur, avec confirmation), Modérer ou Restaurer (modérateur) :
 *   seulement quand le contenu du message est affiché (ni supprimé, ni masqué parce que l'auteur est bloqué ou banni).
 * - Suppression douce (carte 165) : « Supprimer » de l'auteur remplace le message par « supprimé par son auteur » ;
 *   sur le premier message d'un sujet sans réponse, c'est le sujet entier qui est supprimé. « Supprimer (modération) »
 *   permet à un modérateur de retirer le message d'un autre membre (un spam) avec une raison, et « Restaurer le
 *   message supprimé » de revenir dessus. Les règles sont dans lib/forumDeletion.ts.
 * Ces actions étaient avant dans l'en-tête et le pied du message (SharePostButton, ReportPostButton,
 * MarkUnreadAction, PostActions) : leur logique est reprise telle quelle.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArchiveRestore, EyeOff, Pencil, Share2, ShieldAlert, ShieldCheck, ShieldX, Trash2, TriangleAlert } from "lucide-react";
import { ActionMenu, ConfirmDialog, Field, Textarea, toast } from "@bbfrance/ui";
import { deletePost, markTopicAsUnreadFrom, moderatePost, restorePost, unmoderatePost } from "@/app/forum/actions";
import ModerationModal from "@/app/forum/component/ModerationModal";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import ReportModal from "@/common/components/ReportModal/ReportModal";

interface PostMoreMenuProps {
  postId: string;
  topicId: string;
  /** Page du sujet où se trouve le message, pour le lien partagé. */
  page: number;
  authorId: string;
  authorName: string;
  currentUserId?: string;
  isModerator: boolean;
  isModerated: boolean;
  /** Le contenu du message est affiché : les actions Modifier, Supprimer et Modérer sont alors proposées. */
  showContentActions: boolean;
  /** Message supprimé par la modération : un modérateur peut le restaurer. */
  isDeletedByModeration: boolean;
  /** Premier message du sujet : le supprimer revient à supprimer le sujet (voir lib/forumDeletion.ts). */
  isFirstPost: boolean;
  /** Le sujet a d'autres messages que le premier. */
  topicHasReplies: boolean;
  /** Le sujet porte un tournoi : son premier message présente le tournoi. */
  isTournament: boolean;
  editHref: string;
  editLabel: string;
}

const icon = (Icon: typeof Share2) => <Icon size={18} aria-hidden="true" />;

export default function PostMoreMenu({
  postId,
  topicId,
  page,
  authorId,
  authorName,
  currentUserId,
  isModerator,
  isModerated,
  showContentActions,
  isDeletedByModeration,
  isFirstPost,
  topicHasReplies,
  isTournament,
  editHref,
  editLabel,
}: PostMoreMenuProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [reportOpen, setReportOpen] = useState(false);
  const [moderateOpen, setModerateOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [modDeleteOpen, setModDeleteOpen] = useState(false);
  const [modDeleteReason, setModDeleteReason] = useState("");
  const [restoreDeletedOpen, setRestoreDeletedOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const isAuthor = !!currentUserId && currentUserId === authorId;
  const canEdit = isAuthor || isModerator;
  // Le seul message d'un sujet : le supprimer supprime aussi le sujet
  const deletesTopic = isFirstPost && !topicHasReplies && !isTournament;

  const handleShare = async () => {
    const url = `${window.location.origin}/forum/topic/${topicId}?page=${page}#post-${postId}`;
    await navigator.clipboard.writeText(url);
    toast.success("Lien copié !");
  };

  const handleMarkAsUnread = () => {
    startTransition(async () => {
      try {
        await markTopicAsUnreadFrom(topicId, postId);
        // Le membre reste sur le sujet (carte 169) : il voulait poser un marque-page, pas quitter la lecture
        toast.success("Sujet marqué comme non lu à partir de ce message.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
      }
    });
  };

  const onConfirmModerate = async (reason: string) => {
    const res = await moderatePost(postId, reason);
    if (!res.success) {
      toast.error(res.error || "Erreur lors de la modération.");
      return;
    }
    window.location.reload();
  };

  const handleUnmoderate = async () => {
    try {
      const res = await unmoderatePost(postId);
      if (!res.success) {
        toast.error(res.error || "Erreur lors de la restauration.");
        return;
      }
      window.location.reload();
    } catch {
      toast.error("Erreur lors de la restauration.");
    }
  };

  /** Lance une suppression ou une restauration, puis recharge la page (ou va au forum si le sujet a disparu). */
  const runDeletion = async (action: () => ReturnType<typeof deletePost>, errorText: string) => {
    setIsPending(true);
    try {
      const res = await action();
      if (!res.success) {
        toast.error(res.error || errorText);
        return;
      }
      if (res.topicDeleted) {
        router.push(`/forum?deletedTopic=${encodeURIComponent(res.topicTitle ?? "")}`);
        return;
      }
      window.location.reload();
    } catch {
      toast.error(errorText);
    } finally {
      setIsPending(false);
    }
  };

  // Premier message d'un sujet qui a des réponses, ou d'un tournoi : la suppression est refusée, on explique pourquoi
  // sans ouvrir de confirmation (le serveur refuse de toute façon)
  const openAuthorDelete = () => {
    if (isFirstPost && isTournament) {
      toast.error("Ce message présente le tournoi : il ne peut pas être supprimé. Pour retirer le tournoi, annulez-le depuis les outils du sujet.");
      return;
    }
    if (isFirstPost && topicHasReplies) {
      toast.error("C'est le premier message du sujet et d'autres membres y ont répondu : il ne peut plus être supprimé. Vous pouvez le modifier.");
      return;
    }
    setDeleteOpen(true);
  };

  return (
    <>
      <ActionMenu
        label="Plus d'actions sur ce message"
        linkComponent={Link}
        items={[
          { label: "Partager ce message", icon: icon(Share2), onSelect: handleShare },
          { label: "Signaler ce message", icon: icon(TriangleAlert), onSelect: () => setReportOpen(true), hidden: !currentUserId || isAuthor },
          { label: "Marquer comme non lu à partir d'ici", icon: icon(EyeOff), onSelect: handleMarkAsUnread, hidden: !currentUserId },
          { label: editLabel, icon: icon(Pencil), href: editHref, hidden: !showContentActions || !canEdit },
          { label: "Supprimer", icon: icon(Trash2), onSelect: openAuthorDelete, danger: true, hidden: !showContentActions || !isAuthor },
          { label: "Modérer", icon: icon(ShieldAlert), onSelect: () => setModerateOpen(true), danger: true, hidden: !showContentActions || !isModerator || isModerated },
          { label: "Restaurer", icon: icon(ShieldCheck), onSelect: () => setRestoreOpen(true), hidden: !showContentActions || !isModerator || !isModerated },
          // Le premier message ne se supprime pas seul : le modérateur supprime le sujet depuis les outils du sujet
          {
            label: "Supprimer (modération)",
            icon: icon(ShieldX),
            onSelect: () => setModDeleteOpen(true),
            danger: true,
            hidden: !showContentActions || !isModerator || isAuthor || isFirstPost,
          },
          { label: "Restaurer le message supprimé", icon: icon(ArchiveRestore), onSelect: () => setRestoreDeletedOpen(true), hidden: !isModerator || !isDeletedByModeration },
        ]}
      />

      <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} targetId={postId} targetType="POST" itemTitle={`Message de ${authorName}`} />

      <ModerationModal isOpen={moderateOpen} onClose={() => setModerateOpen(false)} onConfirm={onConfirmModerate} authorName={authorName} />

      <ConfirmModal
        isOpen={restoreOpen}
        onClose={() => setRestoreOpen(false)}
        onConfirm={handleUnmoderate}
        title="Restaurer le message"
        message="Voulez-vous vraiment annuler la modération de ce message ? Le contenu sera à nouveau visible par tous."
        confirmLabel="Restaurer"
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={deletesTopic ? "Supprimer le sujet" : "Supprimer le message"}
        message={
          deletesTopic
            ? "C'est le seul message de ce sujet : le supprimer supprime aussi le sujet, qui disparaîtra du forum."
            : "Votre message sera remplacé par la mention « Ce message a été supprimé par son auteur » et son texte ne sera plus visible. Vous ne pourrez pas revenir en arrière."
        }
        confirmLabel="Supprimer"
        danger
        pending={isPending}
        onConfirm={() => runDeletion(() => deletePost(postId), "Erreur lors de la suppression.")}
      />

      <ConfirmDialog
        open={modDeleteOpen}
        onOpenChange={(open) => {
          setModDeleteOpen(open);
          if (!open) setModDeleteReason("");
        }}
        title={`Supprimer le message de ${authorName}`}
        message="Le message sera remplacé par la mention « Ce message a été supprimé par la modération », avec la raison. Rien n'est effacé : un modérateur pourra le restaurer."
        confirmLabel="Supprimer le message"
        danger
        pending={isPending}
        onConfirm={() => {
          if (!modDeleteReason.trim()) {
            toast.error("Indiquez la raison de la suppression.");
            return;
          }
          runDeletion(() => deletePost(postId, modDeleteReason), "Erreur lors de la suppression.");
        }}
      >
        <Field label="Raison de la suppression (obligatoire)" htmlFor={`delete-reason-${postId}`}>
          <Textarea
            id={`delete-reason-${postId}`}
            value={modDeleteReason}
            onChange={(event) => setModDeleteReason(event.target.value)}
            placeholder="Ex : spam, publicité, message en double…"
            rows={3}
            className="resize-none [font-family:inherit]"
          />
        </Field>
      </ConfirmDialog>

      <ConfirmDialog
        open={restoreDeletedOpen}
        onOpenChange={setRestoreDeletedOpen}
        title="Restaurer le message supprimé"
        message="Le message supprimé par la modération sera de nouveau visible par tous, tel qu'il était."
        confirmLabel="Restaurer"
        pending={isPending}
        onConfirm={() => runDeletion(() => restorePost(postId), "Erreur lors de la restauration.")}
      />
    </>
  );
}
