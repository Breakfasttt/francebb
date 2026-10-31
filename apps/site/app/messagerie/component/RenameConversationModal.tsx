"use client";

/**
 * Fenêtre « Renommer le groupe » (refonte, carte 093). Panneau qui monte du bas sur téléphone, fenêtre centrée sur
 * ordinateur. La touche Entrée enregistre.
 */
import { useId, useState, type FormEvent } from "react";
import { Button, DESKTOP_QUERY, Field, Input, Sheet, SheetContent, toast, useMediaQuery } from "@bbfrance/ui";
import { renameConversation } from "../actions";

interface RenameConversationModalProps {
  conversationId: string;
  currentName: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RenameConversationModal({ conversationId, currentName, onClose, onSuccess }: RenameConversationModalProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const inputId = useId();
  const [name, setName] = useState(currentName || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await renameConversation(conversationId, name);
      if (res.success) {
        toast.success("Conversation renommée");
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Impossible de renommer la conversation");
      }
    } catch {
      toast.error("Impossible de renommer la conversation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent title="Renommer le groupe" side={isDesktop ? "center" : "bottom"}>
        <form onSubmit={handleSave} className="flex flex-col gap-4 pt-1 pb-2">
          <Field label="Nouveau titre" htmlFor={inputId}>
            <Input id={inputId} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Entrez un titre..." autoFocus={isDesktop} />
          </Field>
          <div className="flex flex-col gap-2 lg:flex-row-reverse">
            <Button type="submit" variant="primary" size="tap" className="w-full lg:w-auto" disabled={loading}>
              {loading ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
