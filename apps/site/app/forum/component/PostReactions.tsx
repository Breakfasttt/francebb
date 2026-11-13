"use client";

/**
 * Réactions d'un message (refonte, carte 086) : une pastille par émoji avec son compteur, celle du membre mise en
 * valeur, et un bouton d'ajout qui ouvre le choix de 10 émojis (petit panneau sur ordinateur, panneau du bas sur téléphone, comme pour les articles). Un membre n'a qu'une réaction par message : un autre
 * émoji remplace la sienne, le même émoji la retire. L'écran se met à jour tout de suite et revient en arrière si le
 * serveur refuse. Un visiteur voit les pastilles mais ne peut pas réagir ; un membre non plus, quand le sujet est
 * verrouillé ou archivé (carte 169, prop `canReact`). La liste des émojis vient de lib/forumWriteRules.ts, que le
 * serveur vérifie aussi.
 */
import { useState, useTransition, useEffect } from "react";
import { SmilePlus } from "lucide-react";
import { togglePostReaction } from "@/app/forum/actions";
import { Button, DESKTOP_QUERY, Popover, PopoverContent, PopoverTrigger, Sheet, SheetContent, cn, toast, useMediaQuery } from "@bbfrance/ui";
import { reactionName, reactionPillLabel } from "@/common/utils/reactionLabels";
import { REACTION_EMOJIS } from "@/lib/forumWriteRules";

interface Reaction {
  emoji: string;
  userId: string;
}

interface PostReactionsProps {
  postId: string;
  initialReactions: Reaction[];
  currentUserId?: string;
  /** Faux quand le sujet est fermé pour ce membre (verrouillé, archivé) : les réactions sont seulement affichées. */
  canReact?: boolean;
}

export default function PostReactions({ postId, initialReactions, currentUserId, canReact: canReactProp = true }: PostReactionsProps) {
  const canReact = !!currentUserId && canReactProp;
  const [isPending, startTransition] = useTransition();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [showPicker, setShowPicker] = useState(false);

  // Réactions affichées tout de suite, avant la réponse du serveur
  const [optimisticReactions, setOptimisticReactions] = useState(initialReactions);

  // Se recale sur les données du serveur quand elles changent (après un rafraîchissement de la page)
  useEffect(() => {
    setOptimisticReactions(initialReactions);
  }, [initialReactions]);

  // Regroupe les réactions par émoji
  const grouped = optimisticReactions.reduce((acc, curr) => {
    if (!acc[curr.emoji]) acc[curr.emoji] = { count: 0, hasReacted: false };
    acc[curr.emoji].count++;
    if (curr.userId === currentUserId) acc[curr.emoji].hasReacted = true;
    return acc;
  }, {} as Record<string, { count: number; hasReacted: boolean }>);

  const handleToggle = (emoji: string) => {
    if (!currentUserId) {
      toast.error("Vous devez être connecté pour réagir.");
      return;
    }

    // Application immédiate : ajout, remplacement ou retrait de la réaction du membre
    setOptimisticReactions(prev => {
      const existingIdx = prev.findIndex(r => r.userId === currentUserId);
      if (existingIdx >= 0) {
        if (prev[existingIdx].emoji === emoji) {
          return prev.filter((_, i) => i !== existingIdx);
        }
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], emoji };
        return next;
      }
      return [...prev, { emoji, userId: currentUserId }];
    });

    setShowPicker(false);

    startTransition(async () => {
      try {
        const res = await togglePostReaction(postId, emoji);
        if (!res.success) {
          // Refus du serveur : on remet les réactions telles qu'elles étaient
          setOptimisticReactions(initialReactions);
          toast.error(res.error || "Erreur lors de l'ajout de la réaction");
        }
      } catch (error) {
        console.error("Failed to toggle reaction:", error);
        setOptimisticReactions(initialReactions);
        toast.error("Erreur lors de l'ajout de la réaction");
      }
    });
  };

  if (Object.keys(grouped).length === 0 && !currentUserId) {
    return null; // Un visiteur ne voit rien s'il n'y a aucune réaction
  }

  // Sur ordinateur, le déclencheur du petit panneau lui passe son propre `onClick`
  const addButton = (onClick?: () => void) => (
    <Button
      type="button"
      variant="quiet"
      size="tap-icon"
      onClick={onClick}
      aria-label="Ajouter une réaction"
      title="Réagir"
      className="rounded-full border border-dashed border-bb-border lg:size-9"
    >
      <SmilePlus size={18} aria-hidden="true" />
    </Button>
  );

  const emojiGrid = (
    <div role="group" aria-label="Choisir une réaction" className="grid grid-cols-5 gap-1">
      {REACTION_EMOJIS.map(emoji => (
        <Button key={emoji} type="button" variant="quiet" size="tap-icon" onClick={() => handleToggle(emoji)} disabled={isPending} aria-label={reactionName(emoji)} className="text-xl">
          {emoji}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {Object.entries(grouped).map(([emoji, { count, hasReacted }]) => (
        <Button
          key={emoji}
          type="button"
          variant="quiet"
          onClick={() => handleToggle(emoji)}
          aria-pressed={hasReacted}
          aria-label={reactionPillLabel(emoji, count, hasReacted)}
          title={hasReacted ? "Retirer votre réaction" : "Réagir"}
          disabled={isPending || !canReact}
          aria-busy={isPending}
          // Sans droit de réagir, la pastille reste nette (simple compteur) ; pendant un envoi, elle s'estompe (carte 193)
          className={cn(
            "min-h-11 gap-1.5 rounded-full border px-3 text-sm disabled:opacity-100 lg:min-h-9",
            isPending && "disabled:opacity-60",
            hasReacted
              ? "border-bb-accent bg-bb-accent-soft text-bb-accent-text hover:bg-bb-accent-soft"
              : "border-bb-border bg-bb-surface-2 text-bb-text"
          )}
        >
          <span aria-hidden="true">{emoji}</span>
          <span aria-hidden="true" className="font-bold">{count}</span>
        </Button>
      ))}

      {canReact && (isDesktop ? (
        <Popover open={showPicker} onOpenChange={setShowPicker}>
          <PopoverTrigger asChild>{addButton()}</PopoverTrigger>
          <PopoverContent aria-label="Choisir une réaction" className="w-auto p-2">
            {emojiGrid}
          </PopoverContent>
        </Popover>
      ) : (
        <>
          {addButton(() => setShowPicker(true))}
          <Sheet open={showPicker} onOpenChange={setShowPicker}>
            <SheetContent title="Choisir une réaction">
              <div className="pt-2 pb-2">{emojiGrid}</div>
            </SheetContent>
          </Sheet>
        </>
      ))}
    </div>
  );
}
