"use client";

/**
 * Actions de la page d'un article (refonte, carte 095, ADR 0006), sur le modèle de la fiche d'une ligue (carte 094) :
 * - « Modifier », visible, pour l'auteur et la modération ;
 * - le menu « ⋯ » (« Actions de l'article ») : « Supprimer l'article » pour l'auteur et la modération, « Modérer
 *   l'article » ou « Annuler la modération » pour la modération, « Signaler l'article » pour un membre connecté qui
 *   n'en est pas l'auteur. Sur téléphone, ce menu est un panneau qui monte du bas ; sur ordinateur, une liste
 *   déroulante.
 * La suppression et l'annulation de la modération demandent une confirmation (`ConfirmDialog`) ; la modération
 * demande une raison (`ModerationModal`, commune au forum) ; le signalement utilise la fenêtre commune `ReportModal`.
 * Les droits sont revérifiés côté serveur par `deleteArticle`, `moderateArticle` et `unmoderateArticle`
 * (app/articles/actions.ts).
 * Avant la refonte, ces actions étaient des boutons empilés dans la colonne de gauche (composants
 * `DeleteArticleButton`, `ModerateArticleButton` et `ReportArticleButton`).
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flag, Pencil, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { ActionMenu, Button, ConfirmDialog, toast } from "@bbfrance/ui";
import ModerationModal from "@/app/forum/component/ModerationModal";
import ReportModal from "@/common/components/ReportModal/ReportModal";
import { deleteArticle, moderateArticle, unmoderateArticle } from "@/app/articles/actions";

interface ArticleActionsProps {
  articleId: string;
  articleTitle: string;
  authorName: string;
  isModerated: boolean;
  /** Auteur ou modération : modifier et supprimer. */
  canEdit: boolean;
  /** Modération : modérer et annuler la modération. */
  canModerate: boolean;
  /** Membre connecté qui n'est pas l'auteur : signaler. */
  canReport: boolean;
}

export default function ArticleActions({ articleId, articleTitle, authorName, isModerated, canEdit, canModerate, canReport }: ArticleActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [moderateOpen, setModerateOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [pending, setPending] = useState(false);

  if (!canEdit && !canModerate && !canReport) return null;

  const handleDelete = async () => {
    setPending(true);
    const result = await deleteArticle(articleId);
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Article supprimé avec succès.");
    setDeleteOpen(false);
    router.push("/articles");
  };

  const handleModerate = async (reason: string) => {
    const result = await moderateArticle(articleId, reason);
    if (result.success) {
      toast.success("Article modéré avec succès");
      setModerateOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Erreur lors de la modération");
    }
  };

  const handleRestore = async () => {
    setPending(true);
    const result = await unmoderateArticle(articleId);
    setPending(false);
    if (result.success) {
      toast.success("Modération annulée");
      setRestoreOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Erreur lors de l'annulation");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <Button asChild variant="secondary" size="tap">
          <Link href={`/articles/edit/${articleId}`} className="no-underline">
            <Pencil size={18} aria-hidden="true" />
            Modifier
          </Link>
        </Button>
      )}

      <ActionMenu
        label="Actions de l'article"
        triggerClassName="border border-bb-border bg-bb-surface"
        items={[
          { label: "Modérer l'article", icon: <ShieldAlert size={18} aria-hidden="true" />, onSelect: () => setModerateOpen(true), hidden: !canModerate || isModerated },
          { label: "Annuler la modération", icon: <ShieldCheck size={18} aria-hidden="true" />, onSelect: () => setRestoreOpen(true), hidden: !canModerate || !isModerated },
          { label: "Supprimer l'article", icon: <Trash2 size={18} aria-hidden="true" />, onSelect: () => setDeleteOpen(true), danger: true, hidden: !canEdit },
          { label: "Signaler l'article", icon: <Flag size={18} aria-hidden="true" />, onSelect: () => setReportOpen(true), hidden: !canReport },
        ]}
      />

      {canEdit && (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Supprimer l'article"
          message={`L'article « ${articleTitle} » sera supprimé définitivement, avec ses réactions.`}
          confirmLabel="Supprimer"
          danger
          pending={pending}
          onConfirm={handleDelete}
        />
      )}

      {canModerate && (
        <>
          <ModerationModal isOpen={moderateOpen} onClose={() => setModerateOpen(false)} onConfirm={handleModerate} authorName={authorName} />
          <ConfirmDialog
            open={restoreOpen}
            onOpenChange={setRestoreOpen}
            title="Annuler la modération"
            message="Le contenu original de l'article sera à nouveau visible par tous."
            confirmLabel="Annuler la modération"
            cancelLabel="Garder la modération"
            pending={pending}
            onConfirm={handleRestore}
          />
        </>
      )}

      {canReport && (
        <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} targetId={articleId} targetType="ARTICLE" itemTitle={articleTitle} />
      )}
    </div>
  );
}
