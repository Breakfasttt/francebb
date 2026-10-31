"use client";

/**
 * Fenêtre « Ajouter des participants » d'un groupe (refonte, carte 093) : recherche de coachs (ceux déjà dans le
 * groupe ne sont pas proposés), puis ajout. Panneau qui monte du bas sur téléphone, fenêtre centrée sur ordinateur.
 */
import { useRef, useState } from "react";
import { UserPlus } from "lucide-react";
import { Button, DESKTOP_QUERY, Sheet, SheetContent, toast, useMediaQuery } from "@bbfrance/ui";
import { inviteToGroup } from "../actions";
import MemberPicker, { type PickedMember } from "./MemberPicker";

interface InviteParticipantModalProps {
  conversationId: string;
  onClose: () => void;
  onSuccess: () => void;
  existingUserIds: string[];
}

export default function InviteParticipantModal({ conversationId, onClose, onSuccess, existingUserIds }: InviteParticipantModalProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const searchRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<PickedMember[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      const res = await inviteToGroup(conversationId, selected.map((u) => u.id));
      if (res.success) {
        toast.success("Participants ajoutés");
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Erreur lors de l'invitation");
      }
    } catch {
      toast.error("Erreur lors de l'invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        title="Ajouter des participants"
        side={isDesktop ? "center" : "bottom"}
        // Sur téléphone, le panneau occupe presque tout l'écran : le champ de recherche reste au-dessus du clavier
        className="max-lg:h-[88dvh]"
        onOpenAutoFocus={(event) => {
          if (!isDesktop) return;
          event.preventDefault();
          searchRef.current?.focus();
        }}
      >
        <div className="flex flex-col gap-4 pt-1 pb-2">
          <MemberPicker selected={selected} onChange={setSelected} excludeIds={existingUserIds} inputRef={searchRef} />
          <div className="flex flex-col gap-2 pt-2 lg:flex-row-reverse">
            <Button type="button" variant="primary" size="tap" className="w-full gap-1.5 lg:w-auto" disabled={selected.length === 0 || loading} onClick={handleInvite}>
              <UserPlus size={18} aria-hidden="true" />
              {loading ? "Ajout…" : "Ajouter au groupe"}
            </Button>
            <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
