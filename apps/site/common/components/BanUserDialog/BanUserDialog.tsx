"use client";

/**
 * Fenêtre « Bannir » ou « Débannir » un membre (carte 092), partagée par le profil vu par un modérateur
 * (`app/profile/component/ProfileSidebar.tsx`, page `/spy/[id]`) et l'annuaire (`app/membres/component/MembersTable.tsx`),
 * qui avaient chacun leur copie.
 *
 * Pour bannir, le modérateur choisit une raison rapide (obligatoire) et peut ajouter des précisions. La raison
 * envoyée est « [raison rapide] précisions », ou la raison rapide seule : c'est le format enregistré avant la carte.
 * Avec « Autre », seule la précision est enregistrée, et elle devient obligatoire (carte 221).
 * La durée est obligatoire (carte 222) : 1, 7 ou 30 jours, ou définitif. Un bannissement temporaire est levé tout seul
 * à la première visite du membre après la date de fin.
 * Panneau qui monte du bas sur téléphone, fenêtre centrée sur ordinateur. L'action elle-même est fournie par le
 * parent (`onConfirm`).
 */
import { useState } from "react";
import { Ban, UserCheck } from "lucide-react";
import { Button, DESKTOP_QUERY, Field, Sheet, SheetContent, Textarea, useMediaQuery } from "@bbfrance/ui";
import { BAN_DURATION_DAYS, banDurationLabel, type BanDurationDays } from "@/lib/banDuration";

const OTHER_BAN_REASON = "Autre (préciser ci-dessous)";

export const BAN_REASONS = [
  "Spam / Publicité",
  "Harcèlement / Insultes",
  "Contenu inapproprié / NSFW",
  "Bot",
  OTHER_BAN_REASON,
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
  /** Reçoit la raison complète (vide pour un débannissement) et la durée en jours (`null` : définitif). */
  onConfirm: (reason: string, durationDays: BanDurationDays | null) => void;
}) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title={isBanned ? `Débannir ${userName}` : `Bannir ${userName}`}
        side={isDesktop ? "center" : "bottom"}
        description={
          isBanned
            ? `${userName} retrouvera l'accès au site et ses messages du forum seront de nouveau affichés normalement.`
            : `${userName} n'aura plus accès au site pendant la durée choisie. Dans le forum, ses messages seront repliés : chacun pourra encore les afficher.`
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
  onConfirm: (reason: string, durationDays: BanDurationDays | null) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  // « unset » tant que la modération n'a pas choisi : la durée n'a pas de valeur par défaut
  const [duration, setDuration] = useState<BanDurationDays | null | "unset">("unset");
  const [details, setDetails] = useState("");
  const isOther = reason === OTHER_BAN_REASON;
  const fullReason = isOther ? details.trim() : details.trim() ? `[${reason}] ${details.trim()}` : reason;

  return (
    <div className="flex flex-col gap-4 pt-1 pb-2">
      {!isBanned && (
        <>
          <div role="group" aria-labelledby="ban-reason-label" className="flex flex-col gap-2">
            <p id="ban-reason-label" className="m-0 text-sm font-semibold text-bb-text">Raison du bannissement</p>
            {/* Deux colonnes sur téléphone (« Autre » sur toute la largeur) : la fenêtre reste courte */}
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {BAN_REASONS.map((r) => (
              <Button
                key={r}
                type="button"
                variant="secondary"
                size="tap"
                aria-pressed={reason === r}
                onClick={() => setReason(r)}
                className={`h-auto min-h-11 justify-start py-2 text-left font-semibold whitespace-normal ${r === OTHER_BAN_REASON ? "col-span-2 lg:col-span-1" : ""} ${reason === r ? "border-bb-accent-text bg-bb-accent-soft" : ""}`}
              >
                {r}
              </Button>
            ))}
            </div>
          </div>
          <div role="group" aria-labelledby="ban-duration-label" className="flex flex-col gap-2">
            <p id="ban-duration-label" className="m-0 text-sm font-semibold text-bb-text">Durée</p>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {[...BAN_DURATION_DAYS, null].map((days) => (
                <Button
                  key={days ?? "definitif"}
                  type="button"
                  variant="secondary"
                  size="tap"
                  aria-pressed={duration === days}
                  onClick={() => setDuration(days)}
                  className={`font-semibold ${duration === days ? "border-bb-accent-text bg-bb-accent-soft" : ""}`}
                >
                  {banDurationLabel(days)}
                </Button>
              ))}
            </div>
          </div>
          <Field label={isOther ? "Précise la raison" : "Précisions (facultatif)"} htmlFor="ban-details">
            <Textarea
              id="ban-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Détaille le motif si nécessaire…"
              rows={3}
              className="resize-none"
            />
          </Field>
        </>
      )}

      {/* Boutons collés en bas du panneau sur téléphone : toujours à portée, même quand le formulaire défile */}
      <div className="flex flex-col gap-2 max-lg:sticky max-lg:bottom-0 max-lg:-mx-1 max-lg:bg-bb-surface max-lg:px-1 max-lg:pt-2 lg:flex-row-reverse lg:justify-start">
        {isBanned ? (
          <Button type="button" variant="primary" size="tap" className="w-full lg:w-auto" disabled={pending} onClick={() => onConfirm("", null)}>
            <UserCheck size={18} aria-hidden="true" /> Débannir l&apos;utilisateur
          </Button>
        ) : (
          <Button
            type="button"
            variant="danger"
            size="tap"
            className="w-full lg:w-auto"
            disabled={pending || !reason || duration === "unset" || (isOther && !details.trim())}
            onClick={() => duration !== "unset" && onConfirm(fullReason, duration)}
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
