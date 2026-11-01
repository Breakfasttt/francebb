"use client";

/**
 * Fenêtre « Modérer le message » ou « Modérer l'article » (forum et articles), refaite à la carte 088 : le modérateur écrit la raison
 * (obligatoire) puis confirme. Fenêtre centrée sur ordinateur, panneau qui monte du bas sur téléphone (composant
 * Sheet de @bbfrance/ui), au-dessus de la barre de navigation du bas. L'action elle-même est fournie par le parent
 * (`onConfirm`). Le type de contenu modéré (`contentType` : message, article ou ligue, carte 140) choisit les mots du
 * titre et de l'explication ; sans lui, la fenêtre parle d'un message, comme avant.
 */
import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button, DESKTOP_QUERY, Field, Sheet, SheetContent, Textarea, toast, useMediaQuery } from "@bbfrance/ui";

/** Type de contenu modéré, et les mots qui le désignent dans la fenêtre. */
export type ModeratedContentType = "message" | "article" | "ligue";

const CONTENT_WORDS: Record<ModeratedContentType, { the: string; ofThe: string }> = {
  message: { the: "le message", ofThe: "du message" },
  article: { the: "l'article", ofThe: "de l'article" },
  ligue: { the: "la ligue", ofThe: "de la ligue" },
};

interface ModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  authorName: string;
  /** Type de contenu modéré (« message » par défaut). */
  contentType?: ModeratedContentType;
}

export default function ModerationModal({ isOpen, onClose, onConfirm, authorName, contentType = "message" }: ModerationModalProps) {
  const words = CONTENT_WORDS[contentType];
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      onClose();
    } catch {
      toast.error("Erreur lors de la modération.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        title={`Modérer ${words.the} de ${authorName}`}
        side={isDesktop ? "center" : "bottom"}
        description={`Le contenu ${words.ofThe} sera masqué pour les membres, mais restera visible pour vous et pour son auteur.`}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1 pb-2">
          <Field label="Raison de la modération" htmlFor="moderation-reason">
            <Textarea
              id="moderation-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex : contenu inapproprié, irrespectueux, spam…"
              required
              rows={4}
              className="resize-none [font-family:inherit]"
            />
          </Field>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" size="tap" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="danger" size="tap" disabled={isSubmitting || !reason.trim()}>
              <ShieldAlert size={18} aria-hidden="true" /> Confirmer la modération
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
