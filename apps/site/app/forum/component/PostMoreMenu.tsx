"use client";

/**
 * Menu « ⋯ » d'un message (refonte, carte 086) : les actions rares, rangées hors de la vue pour alléger le message.
 * Sur téléphone, un panneau qui monte du bas ; sur ordinateur, une liste déroulante (composant ActionMenu).
 * - Partager : copie le lien du message (…/forum/topic/id?page=N#post-id) et affiche « Lien copié ! ».
 * - Signaler ce message (membre qui n'en est pas l'auteur), avec la fenêtre de signalement.
 * - Marquer comme non lu à partir d'ici (membre), puis retour à l'accueil du forum.
 * - Modifier (auteur ou modérateur), Supprimer (auteur, avec confirmation), Modérer ou Restaurer (modérateur) :
 *   seulement quand le contenu du message est affiché (ni supprimé, ni masqué parce que l'auteur est bloqué ou banni).
 * Ces actions étaient avant dans l'en-tête et le pied du message (SharePostButton, ReportPostButton,
 * MarkUnreadAction, PostActions) : leur logique est reprise telle quelle.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeOff, Pencil, Share2, ShieldAlert, ShieldCheck, Trash2, TriangleAlert } from "lucide-react";
import { ActionMenu, toast } from "@bbfrance/ui";
import { deletePost, markTopicAsUnreadFrom, moderatePost, unmoderatePost } from "@/app/forum/actions";
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
  editHref,
  editLabel,
}: PostMoreMenuProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [reportOpen, setReportOpen] = useState(false);
  const [moderateOpen, setModerateOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isAuthor = !!currentUserId && currentUserId === authorId;
  const canEdit = isAuthor || isModerator;

  const handleShare = async () => {
    const url = `${window.location.origin}/forum/topic/${topicId}?page=${page}#post-${postId}`;
    await navigator.clipboard.writeText(url);
    toast.success("Lien copié !");
  };

  const handleMarkAsUnread = () => {
    startTransition(async () => {
      try {
        await markTopicAsUnreadFrom(topicId, postId);
        router.push("/forum");
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

  const handleDelete = async () => {
    try {
      const res = await deletePost(postId);
      if (!res.success) {
        toast.error(res.error || "Erreur lors de la suppression.");
        return;
      }
      window.location.reload();
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
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
          { label: "Supprimer", icon: icon(Trash2), onSelect: () => setDeleteOpen(true), danger: true, hidden: !showContentActions || !isAuthor },
          { label: "Modérer", icon: icon(ShieldAlert), onSelect: () => setModerateOpen(true), danger: true, hidden: !showContentActions || !isModerator || isModerated },
          { label: "Restaurer", icon: icon(ShieldCheck), onSelect: () => setRestoreOpen(true), hidden: !showContentActions || !isModerator || !isModerated },
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

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le message"
        message="Voulez-vous vraiment supprimer définitivement votre message ? Cette action est irréversible."
        confirmLabel="Supprimer"
        isDanger={true}
      />
    </>
  );
}
