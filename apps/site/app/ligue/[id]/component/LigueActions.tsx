"use client";

/**
 * Actions de la fiche d'une ligue (refonte, carte 094, ADR 0006) :
 * - « Modifier », visible, pour le chef de ligue, les commissaires et la modération ;
 * - le menu « ⋯ » (« Actions de la ligue ») : « Transférer la propriété » et « Supprimer la ligue » pour le chef et la
 *   modération, « Signaler la ligue » pour tout membre connecté. Sur téléphone, ce menu est un panneau qui monte du
 *   bas ; sur ordinateur, une liste déroulante.
 * Le transfert s'ouvre dans un panneau avec la recherche du nouveau chef ; la suppression demande une confirmation
 * (`ConfirmDialog`) ; le signalement utilise la fenêtre commune `ReportModal`. Les droits sont revérifiés côté serveur
 * par `transferLigueOwnership` et `deleteLigue` (app/ligues/actions.ts).
 * Avant la refonte, ces actions étaient dans un bloc « Gestion Ligue » de la colonne de droite, envoyé dans le
 * panneau « Plus » sur téléphone.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Flag, Pencil, Trash2 } from "lucide-react";
import { ActionMenu, Button, ConfirmDialog, DESKTOP_QUERY, Sheet, SheetContent, toast, useMediaQuery } from "@bbfrance/ui";
import UserSearch from "@/common/components/UserSearch/UserSearch";
import ReportModal from "@/common/components/ReportModal/ReportModal";
import type { Rank } from "@/common/components/UserAvatar/UserAvatar";
import { deleteLigue, transferLigueOwnership } from "@/app/ligues/actions";

interface LigueActionsProps {
  ligueId: string;
  ligueName: string;
  /** Chef de ligue, commissaire ou modération : « Modifier ». */
  canEdit: boolean;
  /** Chef de ligue ou modération : transférer et supprimer. */
  canManage: boolean;
  /** Membre connecté : signaler. */
  canReport: boolean;
}

interface SelectedUser {
  id: string;
  name: string | null;
  image: string | null;
  avatarFrame: Rank | null;
}

export default function LigueActions({ ligueId, ligueName, canEdit, canManage, canReport }: LigueActionsProps) {
  const router = useRouter();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [transferOpen, setTransferOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [newOwner, setNewOwner] = useState<SelectedUser | null>(null);
  const [pending, setPending] = useState(false);

  if (!canEdit && !canManage && !canReport) return null;

  const closeTransfer = (open: boolean) => {
    setTransferOpen(open);
    if (!open) setNewOwner(null);
  };

  const handleTransfer = async () => {
    if (!newOwner) {
      toast.error("Choisissez d'abord le nouveau chef de ligue.");
      return;
    }
    setPending(true);
    const res = await transferLigueOwnership(ligueId, newOwner.id);
    setPending(false);
    if (!res.success) {
      toast.error(res.error ?? "Le transfert a échoué.");
      return;
    }
    toast.success(`La ligue appartient maintenant à ${newOwner.name ?? "ce coach"}.`);
    closeTransfer(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setPending(true);
    const res = await deleteLigue(ligueId);
    setPending(false);
    if (!res.success) {
      toast.error(res.error ?? "La suppression a échoué.");
      return;
    }
    toast.success("Ligue supprimée.");
    setDeleteOpen(false);
    router.push("/ligues");
  };

  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <Button asChild variant="secondary" size="tap">
          <Link href={`/ligue/edit/${ligueId}`} className="no-underline">
            <Pencil size={18} aria-hidden="true" />
            Modifier
          </Link>
        </Button>
      )}

      <ActionMenu
        label="Actions de la ligue"
        triggerClassName="border border-bb-border bg-bb-surface"
        items={[
          { label: "Transférer la propriété", icon: <ArrowLeftRight size={18} aria-hidden="true" />, onSelect: () => setTransferOpen(true), hidden: !canManage },
          { label: "Supprimer la ligue", icon: <Trash2 size={18} aria-hidden="true" />, onSelect: () => setDeleteOpen(true), danger: true, hidden: !canManage },
          { label: "Signaler la ligue", icon: <Flag size={18} aria-hidden="true" />, onSelect: () => setReportOpen(true), hidden: !canReport },
        ]}
      />

      {canManage && (
        <>
          <Sheet open={transferOpen} onOpenChange={closeTransfer}>
            <SheetContent
              title="Transférer la propriété"
              description={`Choisissez le coach qui deviendra chef de la ligue « ${ligueName} ». Vous perdrez la gestion des commissaires et la possibilité de supprimer la ligue.`}
              side={isDesktop ? "center" : "bottom"}
              onInteractOutside={(event) => event.preventDefault()}
            >
              {/* Hauteur réservée : la liste des coachs trouvés s'affiche sous le champ de recherche */}
              <div className="flex min-h-64 flex-col gap-4 pt-2 pb-2">
                <UserSearch
                  selectedUsers={newOwner ? [newOwner] : []}
                  onSelect={(user) => setNewOwner(user)}
                  onRemove={() => setNewOwner(null)}
                  placeholder="Rechercher le nouveau chef..."
                  maxSelections={1}
                />
                <div className="mt-auto flex flex-col gap-2 lg:flex-row-reverse">
                  <Button type="button" variant="primary" size="tap" className="w-full lg:w-auto" disabled={pending} onClick={handleTransfer}>
                    Transférer
                  </Button>
                  <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" disabled={pending} onClick={() => closeTransfer(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Supprimer la ligue"
            message={`La ligue « ${ligueName} » sera supprimée définitivement. Ses tournois et articles restent en ligne, mais ne seront plus rattachés à la ligue.`}
            confirmLabel="Supprimer"
            danger
            pending={pending}
            onConfirm={handleDelete}
          />
        </>
      )}

      {canReport && (
        <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} targetId={ligueId} targetType="LIGUE" itemTitle={ligueName} />
      )}
    </div>
  );
}
