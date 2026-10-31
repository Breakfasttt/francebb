"use client";

/**
 * Fenêtre « Déplacer le sujet » (modérateurs), refaite à la carte 088 : le modérateur choisit le forum de destination
 * puis confirme. Fenêtre centrée sur ordinateur, panneau qui monte du bas sur téléphone (composant Sheet de
 * @bbfrance/ui), au-dessus de la barre de navigation du bas et du panneau « Plus ».
 */
import { useState, useTransition } from "react";
import { Move } from "lucide-react";
import { moveTopic } from "@/app/forum/actions";
import { Button, DESKTOP_QUERY, Field, Select, Sheet, SheetContent, toast, useMediaQuery } from "@bbfrance/ui";

interface MoveTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  allForums: { id: string; name: string; }[];
}

export default function MoveTopicModal({ isOpen, onClose, topicId, allForums }: MoveTopicModalProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [selectedForumId, setSelectedForumId] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleMove = () => {
    if (!selectedForumId) return;
    startTransition(async () => {
      try {
        const res = await moveTopic(topicId, selectedForumId);
        if (!res.success) {
          toast.error(res.error || "Erreur lors du déplacement");
          return;
        }
        onClose();
      } catch {
        toast.error("Erreur lors du déplacement");
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent title="Déplacer le sujet" side={isDesktop ? "center" : "bottom"}>
        <div className="flex flex-col gap-4 pt-1 pb-2">
          <Field label="Forum de destination" htmlFor="move-topic-forum" hint="Le sujet et tous ses messages seront rangés dans ce forum.">
            <Select id="move-topic-forum" value={selectedForumId} onChange={(e) => setSelectedForumId(e.target.value)}>
              <option value="" disabled>Choisir un forum…</option>
              {allForums.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </Select>
          </Field>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" size="tap" onClick={onClose}>
              Annuler
            </Button>
            <Button type="button" variant="primary" size="tap" onClick={handleMove} disabled={isPending || !selectedForumId}>
              <Move size={18} aria-hidden="true" /> Confirmer le déplacement
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
