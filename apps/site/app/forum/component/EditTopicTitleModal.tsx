"use client";

/**
 * Fenêtre « Modifier le titre du sujet » (auteur ou modérateur), refaite à la carte 088 : champ du titre avec ses
 * smileys et son aperçu (TitleInputWithSmiley), puis « Enregistrer ». Fenêtre centrée sur ordinateur, panneau qui
 * monte du bas sur téléphone (composant Sheet de @bbfrance/ui), au-dessus de la barre de navigation du bas.
 */
import { useTransition } from "react";
import { Check } from "lucide-react";
import { updateTopicTitle } from "@/app/forum/actions";
import { Button, DESKTOP_QUERY, Label, Sheet, SheetContent, toast, useMediaQuery } from "@bbfrance/ui";
import TitleInputWithSmiley from "@/app/forum/component/TitleInputWithSmiley";

interface EditTopicTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  initialTitle: string;
}

export default function EditTopicTitleModal({ isOpen, onClose, topicId, initialTitle }: EditTopicTitleModalProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTitle = formData.get("title") as string;

    if (!newTitle.trim()) return;

    startTransition(async () => {
      try {
        const res = await updateTopicTitle(topicId, newTitle);
        if (!res.success) {
          toast.error(res.error || "Erreur lors de la modification");
          return;
        }
        onClose();
      } catch {
        toast.error("Erreur lors de la modification");
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent title="Modifier le titre du sujet" side={isDesktop ? "center" : "bottom"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1 pb-2">
          <div className="flex flex-col gap-1.5">
            {/* Le champ du titre porte l'identifiant « title » (TitleInputWithSmiley) */}
            <Label htmlFor="title">Nouveau titre</Label>
            <TitleInputWithSmiley initialValue={initialTitle} name="title" />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" size="tap" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="tap" disabled={isPending}>
              <Check size={18} aria-hidden="true" /> Enregistrer
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
