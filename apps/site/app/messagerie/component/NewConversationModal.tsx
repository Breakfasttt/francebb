"use client";

/**
 * Fenêtre « Nouvelle discussion » (refonte, carte 093) : note sur le chiffrement, titre facultatif et choix d'un ou
 * plusieurs coachs. Avec un seul coach et sans titre, c'est une conversation à deux (reprise si elle existe déjà) ;
 * sinon, un groupe. Panneau qui monte du bas sur téléphone, fenêtre centrée sur ordinateur.
 */
import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users } from "lucide-react";
import { Button, DESKTOP_QUERY, Field, Input, Sheet, SheetContent, toast, useMediaQuery } from "@bbfrance/ui";
import { startConversation } from "../actions";
import MemberPicker, { type PickedMember } from "./MemberPicker";

/** Note sur la confidentialité des messages, affichée à la création d'une conversation. */
export const ENCRYPTION_NOTE =
  "Vos messages sont chiffrés (AES-256). Seuls les participants de la conversation peuvent lire les échanges. L'administration n'a pas accès à vos discussions privées.";

export default function NewConversationModal({ onClose }: { onClose: () => void }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const router = useRouter();
  const titleId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<PickedMember[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      const res = await startConversation(selected.map((u) => u.id), groupName || undefined);
      if (res.success) {
        toast.success("Conversation créée");
        router.push(`/messagerie?id=${res.conversationId}`);
        onClose();
      } else {
        toast.error(res.error || "Impossible de créer la conversation");
      }
    } catch {
      toast.error("Impossible de créer la conversation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        title="Nouvelle discussion"
        side={isDesktop ? "center" : "bottom"}
        // Sur téléphone, le panneau occupe presque tout l'écran : le champ de recherche reste au-dessus du clavier
        className="max-lg:h-[88dvh]"
        onOpenAutoFocus={(event) => {
          // Sur ordinateur, le curseur va directement dans la recherche ; sur téléphone, le clavier ne s'ouvre pas tout seul
          if (!isDesktop) return;
          event.preventDefault();
          searchRef.current?.focus();
        }}
      >
        <div className="flex flex-col gap-4 pt-1 pb-2">
          <p className="m-0 flex items-start gap-2.5 rounded-bb-md border border-bb-border bg-bb-surface-2 p-3 text-sm leading-snug text-bb-text-muted">
            <ShieldCheck size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-bb-accent-text" />
            <span>
              <strong className="text-bb-text">Confidentialité et chiffrement :</strong> {ENCRYPTION_NOTE}
            </span>
          </p>

          <Field label="Titre de la discussion (facultatif)" htmlFor={titleId} hint="Avec un titre, la discussion devient un groupe.">
            <Input
              id={titleId}
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ex. : question sur le match, tournoi…"
            />
          </Field>

          <MemberPicker selected={selected} onChange={setSelected} inputRef={searchRef} />

          <div className="flex flex-col gap-2 pt-2 lg:flex-row-reverse">
            <Button type="button" variant="primary" size="tap" className="w-full gap-1.5 lg:w-auto" disabled={selected.length === 0 || loading} onClick={handleStart}>
              {selected.length > 1 && <Users size={18} aria-hidden="true" />}
              {loading ? "Création…" : selected.length > 1 ? "Créer le groupe" : "Démarrer la discussion"}
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
