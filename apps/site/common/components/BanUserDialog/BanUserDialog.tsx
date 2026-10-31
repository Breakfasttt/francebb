"use client";

/**
 * Fenêtre « Bannir » ou « Débannir » un membre (carte 092), partagée par le profil vu par un modérateur
 * (`app/profile/component/ProfileSidebar.tsx`, page `/spy/[id]`) et l'annuaire (`app/membres/component/MembersTable.tsx`),
 * qui avaient chacun leur copie.
 *
 * Pour bannir, le modérateur choisit une raison rapide (obligatoire) et peut ajouter des précisions. La raison
 * envoyée est « [raison rapide] précisions », ou la raison rapide seule : c'est le format enregistré avant la carte.
 * Panneau qui monte du bas sur téléphone, fenêtre centrée sur ordinateur. L'action elle-même est fournie par le
 * parent (`onConfirm`).
 */
import { useState } from "react";
import { Ban, UserCheck } from "lucide-react";
import { Button, DESKTOP_QUERY, Field, Sheet, SheetContent, Textarea, useMediaQuery } from "@bbfrance/ui";

export const BAN_REASONS = [
  "Spam / Publicité",
  "Harcèlement / Insultes",
  "Contenu inapproprié / NSFW",
  "Bot",
  "Autre (préciser ci-dessous)",
];

export default function BanUserDialog({
  open,
  onOpenChange,
  userName,
  isBanned,
  pending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  /** Le membre est déjà banni : la fenêtre propose de le débannir. */
  isBanned: boolean;
  pending?: boolean;
  /** Reçoit la raison complète (vide pour un débannissement). */
  onConfirm: (reason: string) => void;
}) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title={isBanned ? `Débannir ${userName}` : `Bannir ${userName}`}
        side={isDesktop ? "center" : "bottom"}
        description={
          isBanned
            ? `${userName} retrouvera l'accès au forum et ses messages seront de nouveau visibles.`
            : `${userName} n'aura plus accès au forum et ses messages seront masqués.`
        }
        onInteractOutside={(event) => event.preventDefault()}
      >
        {/* Le formulaire n'existe que pendant que la fenêtre est ouverte : chaque ouverture repart de zéro */}
        <BanForm isBanned={isBanned} pending={pending} onConfirm={onConfirm} onCancel={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}

function BanForm({ isBanned, pending, onConfirm, onCancel }: {
  isBanned: boolean;
  pending: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const fullReason = details.trim() ? `[${reason}] ${details.trim()}` : reason;

  return (
    <div className="flex flex-col gap-4 pt-1 pb-2">
      {!isBanned && (
        <>
          <div role="group" aria-labelledby="ban-reason-label" className="flex flex-col gap-2">
            <p id="ban-reason-label" className="m-0 text-sm font-semibold text-bb-text">Raison du bannissement</p>
            {BAN_REASONS.map((r) => (
              <Button
                key={r}
                type="button"
                variant="secondary"
                size="tap"
                aria-pressed={reason === r}
                onClick={() => setReason(r)}
                className={`justify-start font-semibold ${reason === r ? "border-bb-accent-text bg-bb-accent-soft" : ""}`}
              >
                {r}
              </Button>
            ))}
          </div>
          <Field label="Précisions (facultatif)" htmlFor="ban-details">
            <Textarea
              id="ban-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Détaillez le motif si nécessaire…"
              rows={3}
              className="resize-none [font-family:inherit]"
            />
          </Field>
        </>
      )}

      <div className="flex flex-col gap-2 lg:flex-row-reverse lg:justify-start">
        {isBanned ? (
          <Button type="button" variant="primary" size="tap" className="w-full lg:w-auto" disabled={pending} onClick={() => onConfirm("")}>
            <UserCheck size={18} aria-hidden="true" /> Débannir l&apos;utilisateur
          </Button>
        ) : (
          <Button
            type="button"
            variant="danger"
            size="tap"
            className="w-full lg:w-auto"
            disabled={pending || !reason}
            onClick={() => onConfirm(fullReason)}
          >
            <Ban size={18} aria-hidden="true" /> Confirmer le bannissement
          </Button>
        )}
        <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" disabled={pending} onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
