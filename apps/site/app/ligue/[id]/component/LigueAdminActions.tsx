"use client";

/**
 * Bloc « Gestion Ligue » de la fiche d'une ligue : modifier, transférer la propriété, supprimer.
 * Chaque action demande confirmation (ConfirmModal) ; les droits sont revérifiés côté serveur
 * par deleteLigue / transferLigueOwnership (app/ligues/actions.ts).
 */
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@bbfrance/ui";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import AdminButton from "@/common/components/Button/AdminButton";
import DangerButton from "@/common/components/Button/DangerButton";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import UserSearch from "@/common/components/UserSearch/UserSearch";
import { Rank } from "@/common/components/UserAvatar/UserAvatar";
import { Settings, ArrowLeftRight, Trash2 } from "lucide-react";
import MobilePortal from "@/common/components/MobilePortal/MobilePortal";
import { deleteLigue, transferLigueOwnership } from "@/app/ligues/actions";

interface LigueAdminActionsProps {
  ligueId: string;
  ligueName: string;
  canManage: boolean;
}

interface SelectedUser {
  id: string;
  name: string | null;
  image: string | null;
  avatarFrame: Rank | null;
}

export default function LigueAdminActions({ ligueId, ligueName, canManage }: LigueAdminActionsProps) {
  const router = useRouter();
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newOwner, setNewOwner] = useState<SelectedUser | null>(null);

  const closeTransfer = () => {
    setIsTransferOpen(false);
    setNewOwner(null);
  };

  const handleTransfer = async () => {
    if (!newOwner) {
      toast.error("Choisissez d'abord le nouveau chef de ligue.");
      return;
    }
    const res = await transferLigueOwnership(ligueId, newOwner.id);
    if (!res.success) {
      toast.error(res.error ?? "Le transfert a échoué.");
      return;
    }
    toast.success(`La ligue appartient maintenant à ${newOwner.name ?? "ce coach"}.`);
    closeTransfer();
    router.refresh();
  };

  const handleDelete = async () => {
    const res = await deleteLigue(ligueId);
    if (!res.success) {
      toast.error(res.error ?? "La suppression a échoué.");
      return;
    }
    toast.success("Ligue supprimée.");
    setIsDeleteOpen(false);
    router.push("/ligues");
  };

  return (
    <MobilePortal>
      <PremiumCard className="admin-actions-card">
        <h3>Gestion Ligue</h3>
        <div className="action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <AdminButton
            href={`/ligue/edit/${ligueId}`}
            fullWidth
            icon={<Settings size={18} />}
          >
            Modifier les infos
          </AdminButton>

          {canManage && (
            <>
              <AdminButton
                fullWidth
                icon={<ArrowLeftRight size={18} />}
                onClick={() => setIsTransferOpen(true)}
              >
                Transférer propriété
              </AdminButton>
              <DangerButton
                fullWidth
                icon={<Trash2 size={18} />}
                onClick={() => setIsDeleteOpen(true)}
              >
                Supprimer la ligue
              </DangerButton>
            </>
          )}
        </div>
      </PremiumCard>

      {canManage && (
        <>
          <ConfirmModal
            isOpen={isTransferOpen}
            onClose={closeTransfer}
            onConfirm={handleTransfer}
            title="Transférer la propriété"
            message={`Choisissez le coach qui deviendra chef de la ligue « ${ligueName} ». Vous perdrez la gestion des commissaires et la possibilité de supprimer la ligue.`}
            confirmLabel="Transférer"
          >
            <UserSearch
              selectedUsers={newOwner ? [newOwner] : []}
              onSelect={(user) => setNewOwner(user)}
              onRemove={() => setNewOwner(null)}
              placeholder="Rechercher le nouveau chef..."
              maxSelections={1}
            />
          </ConfirmModal>

          <ConfirmModal
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleDelete}
            title="Supprimer la ligue"
            message={`La ligue « ${ligueName} » sera supprimée définitivement. Ses tournois et articles restent en ligne, mais ne seront plus rattachés à la ligue.`}
            confirmLabel="Supprimer"
            isDanger
          />
        </>
      )}
    </MobilePortal>
  );
}
