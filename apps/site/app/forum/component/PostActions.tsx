"use client";

/**
 * Pied d'un message (refonte, carte 086) : les actions principales, toujours visibles.
 * - Les réactions (PostReactions), à gauche.
 * - « Citer », à droite, pour un membre : ajoute la citation du message, sans les citations qu'il contient déjà, à la
 *   fin de la réponse rapide (carte 183). La page ne défile pas : une notification « Citation ajoutée » propose
 *   « Voir ma réponse ». S'il n'y a aucune zone de réponse dans la page, mène à la page de réponse avec ?quotePostId=.
 *   « Citer » n'apparaît pas quand le membre ne peut pas répondre (sujet ou forum verrouillé, sauf pour un
 *   modérateur) : le bouton ne mènerait qu'à une impasse. Pour citer un passage seulement : QuoteSelectionButton.
 * Les actions rares (modifier, supprimer, modérer…) sont dans le menu « ⋯ » de l'en-tête (PostMoreMenu).
 */
import { MessageSquareQuote } from "lucide-react";
import { Button } from "@bbfrance/ui";
import PostReactions from "@/app/forum/component/PostReactions";
import { sendQuoteToQuickReply } from "@/app/forum/component/QuoteSelectionButton";
import { buildFullPostQuote } from "@/lib/forumQuote";

interface PostActionsProps {
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  initialReactions: { emoji: string; userId: string }[];
  currentUserId?: string;
  topicId: string;
  // Faux quand le membre ne peut pas répondre au sujet : « Citer » est alors masqué
  canQuote?: boolean;
  // Faux quand le sujet est fermé pour ce membre (verrouillé, archivé) : les réactions sont seulement affichées
  canReact?: boolean;
}

export default function PostActions({ postId, authorId, authorName, content, initialReactions, currentUserId, topicId, canQuote = true, canReact = true }: PostActionsProps) {
  const handleQuote = () => {
    const quote = buildFullPostQuote({ authorId, postId, authorName }, content);
    if (!sendQuoteToQuickReply(quote)) {
      window.location.href = `/forum/topic/${topicId}/reply?quotePostId=${postId}`;
    }
  };

  const hasReactions = initialReactions.length > 0;
  if (!currentUserId && !hasReactions) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
      <PostReactions postId={postId} initialReactions={initialReactions} currentUserId={currentUserId} canReact={canReact} />
      {currentUserId && canQuote && (
        <Button type="button" variant="quiet" size="tap" onClick={handleQuote} className="ml-auto text-bb-text">
          <MessageSquareQuote size={18} aria-hidden="true" /> Citer
        </Button>
      )}
    </div>
  );
}
