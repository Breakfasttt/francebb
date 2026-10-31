"use client";

/**
 * Réactions émoji d'un article (refonte, carte 095, ADR 0006).
 * Chaque émoji déjà utilisé est une pastille avec son nombre ; la pastille est mise en avant quand le membre connecté
 * a choisi cet émoji, et un appui l'ajoute ou la retire. Le bouton « Ajouter une réaction » ouvre le choix parmi dix
 * émojis : petit panneau sous le bouton sur ordinateur, panneau qui monte du bas sur téléphone. Un membre n'a qu'une
 * réaction par article : en choisir une autre remplace la première (règle de `toggleArticleReaction`).
 * Un visiteur voit les réactions sans pouvoir réagir. L'affichage change tout de suite, avant la réponse du serveur ;
 * en cas d'erreur, il revient à l'état précédent.
 */
import { useEffect, useState, useTransition } from "react";
import { SmilePlus } from "lucide-react";
import { Button, DESKTOP_QUERY, Popover, PopoverContent, PopoverTrigger, Sheet, SheetContent, cn, toast, useMediaQuery } from "@bbfrance/ui";
import { toggleArticleReaction } from "@/app/articles/actions";

interface Reaction {
  emoji: string;
  userId: string;
  user?: { name: string | null };
}

interface ArticleReactionsProps {
  articleId: string;
  reactions: Reaction[];
  currentUserId?: string;
}

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😢", "😡", "🔥", "👀", "🎉", "👎", "🍻"];

export default function ArticleReactions({ articleId, reactions, currentUserId }: ArticleReactionsProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [isPending, startTransition] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [optimisticReactions, setOptimisticReactions] = useState(reactions);

  // Les données du serveur (après revalidatePath) remplacent l'affichage anticipé
  useEffect(() => {
    setOptimisticReactions(reactions);
  }, [reactions]);

  // Regroupement par émoji : nombre, réaction du membre, noms des membres
  const grouped = optimisticReactions.reduce((acc, curr) => {
    if (!acc[curr.emoji]) acc[curr.emoji] = { count: 0, hasReacted: false, users: [] as string[] };
    acc[curr.emoji].count++;
    if (curr.userId === currentUserId) acc[curr.emoji].hasReacted = true;
    if (curr.user?.name) acc[curr.emoji].users.push(curr.user.name);
    return acc;
  }, {} as Record<string, { count: number; hasReacted: boolean; users: string[] }>);

  const handleToggle = (emoji: string) => {
    if (!currentUserId) {
      toast.error("Vous devez être connecté pour réagir.");
      return;
    }

    setOptimisticReactions((prev) => {
      const existingIdx = prev.findIndex((r) => r.userId === currentUserId);
      if (existingIdx >= 0) {
        // Même émoji : la réaction est retirée ; autre émoji : il remplace le premier
        if (prev[existingIdx].emoji === emoji) return prev.filter((_, i) => i !== existingIdx);
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], emoji };
        return next;
      }
      return [...prev, { emoji, userId: currentUserId }];
    });
    setPickerOpen(false);

    startTransition(async () => {
      try {
        const result = await toggleArticleReaction(articleId, emoji);
        if (result.error) throw new Error(result.error);
      } catch (error) {
        console.error("Failed to toggle reaction:", error);
        setOptimisticReactions(reactions);
        toast.error("Erreur lors de l'ajout de la réaction");
      }
    });
  };

  const entries = Object.entries(grouped);
  if (entries.length === 0 && !currentUserId) return null;

  // Sur ordinateur, le déclencheur du petit panneau lui passe son propre `onClick`
  const addButton = (onClick?: () => void) => (
    <Button type="button" variant="secondary" size="tap" onClick={onClick} aria-label="Ajouter une réaction" title="Ajouter une réaction" className="px-3">
      <SmilePlus size={20} aria-hidden="true" />
      <span aria-hidden="true" className="text-sm font-semibold">Réagir</span>
    </Button>
  );

  const emojiGrid = (
    <div className="grid grid-cols-5 gap-1">
      {COMMON_EMOJIS.map((emoji) => (
        <Button key={emoji} type="button" variant="quiet" size="tap-icon" onClick={() => handleToggle(emoji)} className="text-2xl">
          {emoji}
        </Button>
      ))}
    </div>
  );

  return (
    <section aria-label="Réactions" className="flex flex-wrap items-center gap-2">
      {entries.map(([emoji, { count, hasReacted, users }]) => (
        <Button
          key={emoji}
          type="button"
          variant="secondary"
          size="tap"
          aria-pressed={currentUserId ? hasReacted : undefined}
          title={users.length > 0 ? users.join(", ") : hasReacted ? "Retirer votre réaction" : "Réagir"}
          onClick={() => handleToggle(emoji)}
          disabled={isPending || !currentUserId}
          className={cn("gap-1.5 rounded-full px-3 disabled:opacity-100", hasReacted && "border-bb-accent-text bg-bb-accent-soft text-bb-accent-text")}
        >
          <span className="text-lg leading-none">{emoji}</span>
          <span className="text-sm font-bold">{count}</span>
        </Button>
      ))}

      {currentUserId && (isDesktop ? (
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>{addButton()}</PopoverTrigger>
          <PopoverContent aria-label="Choisir une réaction" className="w-auto p-2">
            {emojiGrid}
          </PopoverContent>
        </Popover>
      ) : (
        <>
          {addButton(() => setPickerOpen(true))}
          <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
            <SheetContent title="Choisir une réaction">
              <div className="pt-2 pb-2">{emojiGrid}</div>
            </SheetContent>
          </Sheet>
        </>
      ))}
    </section>
  );
}
