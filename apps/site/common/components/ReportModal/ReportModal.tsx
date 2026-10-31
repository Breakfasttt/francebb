"use client";

/**
 * Fenêtre de signalement d'un contenu (message ou sujet du forum, article, ligue), refaite à la carte 088.
 * Fenêtre centrée sur ordinateur, panneau qui monte du bas sur téléphone (composant Sheet de @bbfrance/ui), affichée
 * au-dessus de la barre de navigation du bas et du panneau « Plus ». Le membre choisit une raison (obligatoire),
 * ajoute des précisions s'il le souhaite, puis envoie : l'équipe de modération retrouve le signalement dans
 * /moderation. Un appui à côté de la fenêtre ne la ferme pas, pour ne pas perdre les précisions déjà saisies.
 */
import { useState, useTransition } from "react";
import { Check, Send } from "lucide-react";
import { Button, cn, DESKTOP_QUERY, Field, Sheet, SheetContent, Textarea, toast, useMediaQuery } from "@bbfrance/ui";
import { createReportAction } from "@/app/moderation/actions";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: string;
  itemTitle?: string;
}

const REPORT_REASONS = [
  "Spam / Publicité",
  "Harcèlement / Insultes",
  "Contenu inapproprié / NSFW",
  "Bot",
  "Autre (préciser ci-dessous)"
];

export default function ReportModal({ isOpen, onClose, targetId, targetType, itemTitle }: ReportModalProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isPending, startTransition] = useTransition();
  const handleSubmit = () => {
    if (!reason) {
      toast.error("Veuillez choisir une raison");
      return;
    }

    startTransition(async () => {
      const res = await createReportAction({
        reason,
        details,
        targetId,
        targetType
      });

      if (res.success) {
        toast.success("Signalement envoyé à l'équipe");
        onClose();
        setReason("");
        setDetails("");
      } else {
        toast.error(res.error || "Une erreur est survenue");
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        title="Signaler un contenu"
        side={isDesktop ? "center" : "bottom"}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <div className="flex flex-col gap-4 pt-1 pb-2">
          <p className="m-0 text-[0.95rem] text-bb-text-muted">
            Vous signalez : <strong className="font-semibold break-words text-bb-text">{itemTitle || `${targetType} (${targetId.substring(0, 8)})`}</strong>
          </p>

          <div role="group" aria-labelledby="report-reason-label" className="flex flex-col gap-2">
            <p id="report-reason-label" className="m-0 text-sm font-semibold text-bb-text">Raison du signalement</p>
            {REPORT_REASONS.map((r) => {
              const selected = reason === r;
              return (
                <Button
                  key={r}
                  type="button"
                  variant="secondary"
                  size="tap"
                  aria-pressed={selected}
                  onClick={() => setReason(r)}
                  className={cn("w-full justify-between text-left font-semibold whitespace-normal", selected && "border-bb-accent-text bg-bb-accent-soft text-bb-accent-text")}
                >
                  {r}
                  {selected && <Check size={18} aria-hidden="true" className="shrink-0" />}
                </Button>
              );
            })}
          </div>

          <Field label="Précisions (facultatif)" htmlFor="report-details">
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Détaillez votre signalement si nécessaire..."
              rows={3}
              className="min-h-24 resize-none [font-family:inherit]"
            />
          </Field>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" size="tap" onClick={onClose} disabled={isPending}>
              Annuler
            </Button>
            <Button type="button" variant="danger" size="tap" onClick={handleSubmit} disabled={isPending}>
              <Send size={18} aria-hidden="true" /> Envoyer le signalement
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
