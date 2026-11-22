"use client";

/**
 * Fenêtre « Inviter un modérateur » d'une conversation (carte 223). La modération ne lit jamais une conversation privée,
 * même signalée : pour qu'un modérateur la lise, un participant l'invite ici. Il lit alors toute la conversation,
 * messages passés compris ; une conversation à deux devient un groupe, et l'autre membre le voit arriver.
 * L'invitation ne se reprend pas : elle demande une confirmation. La fenêtre s'ouvre aussi juste après un signalement
 * de la conversation (`intro`). Panneau qui monte du bas sur téléphone, fenêtre centrée sur ordinateur.
 */
import { useEffect, useState, useTransition } from "react";
import { Avatar, Button, DESKTOP_QUERY, EmptyState, Sheet, SheetContent, Skeleton, toast, useMediaQuery } from "@bbfrance/ui";
import { getModeratorsToInvite, inviteModerator } from "../actions";

type Moderator = Awaited<ReturnType<typeof getModeratorsToInvite>>[number];

export default function InviteModeratorModal({ conversationId, intro, onClose, onSuccess }: {
  conversationId: string;
  /** Phrase placée avant l'explication (par exemple juste après un signalement). */
  intro?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [moderators, setModerators] = useState<Moderator[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  // Modérateur choisi, en attente de confirmation
  const [chosen, setChosen] = useState<Moderator | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getModeratorsToInvite(conversationId)
      .then((list) => {
        if (!cancelled) setModerators(list);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  const confirm = (moderator: Moderator) => {
    startTransition(async () => {
      const res = await inviteModerator(conversationId, moderator.id);
      if (!res.success) {
        toast.error(res.error || "L'invitation n'est pas partie.");
        return;
      }
      toast.success(`${moderator.name} a rejoint la conversation.`);
      onSuccess();
      onClose();
    });
  };

  const explanation = "Le modérateur lira toute la conversation, messages passés compris. Les autres participants le verront arriver.";

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        title="Inviter un modérateur"
        side={isDesktop ? "center" : "bottom"}
        description={intro ? `${intro} ${explanation}` : explanation}
      >
        <div className="flex flex-col gap-3 pt-1 pb-2">
          {chosen ? (
            <>
              <p className="m-0 text-bb-text">
                <strong>{chosen.name}</strong> lira toute la conversation, messages passés compris. Tu ne pourras pas
                annuler l&apos;invitation.
              </p>
              <div className="flex flex-col gap-2 lg:flex-row-reverse lg:justify-start">
                <Button type="button" variant="primary" size="tap" className="w-full lg:w-auto" disabled={isPending} onClick={() => confirm(chosen)}>
                  Confirmer l&apos;invitation
                </Button>
                <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" disabled={isPending} onClick={() => setChosen(null)}>
                  Retour à la liste
                </Button>
              </div>
            </>
          ) : loadFailed ? (
            <p role="alert" className="m-0 text-bb-text">La liste des modérateurs n&apos;a pas chargé. Ferme la fenêtre et réessaie.</p>
          ) : moderators === null ? (
            <div className="flex flex-col gap-2" aria-busy="true">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : moderators.length === 0 ? (
            <EmptyState title="Aucun modérateur à inviter">L&apos;équipe de modération est déjà dans la conversation.</EmptyState>
          ) : (
            <ul className="m-0 flex list-none flex-col divide-y divide-bb-border p-0">
              {moderators.map((moderator) => (
                <li key={moderator.id} className="flex items-center gap-3 py-2">
                  <Avatar name={moderator.name} src={moderator.image} size={36} />
                  <span className="min-w-0 flex-1 truncate font-semibold text-bb-text">{moderator.name}</span>
                  <Button type="button" variant="secondary" size="tap" aria-label={`Inviter ${moderator.name}`} onClick={() => setChosen(moderator)}>
                    Inviter
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {!chosen && (
            <Button type="button" variant="secondary" size="tap" className="w-full lg:hidden" onClick={onClose}>
              Fermer
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
