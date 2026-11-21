"use client";

/**
 * Une catégorie de l'accueil du forum (refonte, carte 085) : une carte dont l'en-tête est un bouton qui replie ou
 * déplie la liste de ses forums. Une catégorie qui contient du non-lu affiche un point bleu dans son en-tête.
 */
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@bbfrance/ui";
import { ForumColumnsHeader, ForumRow, UnreadDot } from "@/app/forum/component/ForumListItems";

// Données minimales d'une catégorie de l'accueil du forum (chargées par app/forum/page.tsx).
// lastPostAt peut arriver en string : unstable_cache sérialise en JSON.
export interface ForumIndexCategory {
  id: string;
  name: string;
  forums: {
    id: string;
    name: string;
    description: string | null;
    isLocked: boolean;
    isTournamentForum: boolean;
    _count: { topics: number };
    topics: { title: string; lastPostAt: Date | string; tournamentId: string | null; lastPostAuthor: { name: string | null } | null }[];
    subForums: { id: string }[];
  }[];
}

interface CategoryProps {
  category: ForumIndexCategory;
  unreadForumIds: string[];
}

export default function ForumCategory({ category, unreadForumIds }: CategoryProps) {
  const categoryHasNew = category.forums.some((forum) => unreadForumIds.includes(forum.id));
  const [isExpanded, setIsExpanded] = useState(true);
  const listId = useId();

  return (
    <section className="overflow-hidden rounded-bb-lg border border-bb-border bg-bb-surface" aria-label={category.name}>
      {/* En-tête repliable en voix Heading, avec les intitulés des colonnes sur ordinateur */}
      <Button
        type="button"
        variant="quiet"
        aria-expanded={isExpanded}
        aria-controls={listId}
        onClick={() => setIsExpanded(!isExpanded)}
        className="min-h-11 w-full justify-start gap-2 rounded-none bg-bb-surface-2 px-3 py-2 text-left font-normal whitespace-normal text-bb-text hover:bg-bb-surface-2 focus-visible:-outline-offset-2 lg:px-4"
      >
        <span className="min-w-0 flex-1">
          <ForumColumnsHeader title={<span className="flex items-center gap-2 text-bb-text">{category.name}{categoryHasNew && <UnreadDot />}</span>} />
        </span>
        <ChevronDown size={18} aria-hidden="true" className={`shrink-0 text-bb-text-muted transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
      </Button>

      {isExpanded && (
        <div id={listId} className="border-t border-bb-border">
          {category.forums.map((forum) => {
            const lastTopic = forum.topics[0];
            return (
              <ForumRow
                key={forum.id}
                forum={{
                  id: forum.id,
                  name: forum.name,
                  description: forum.description,
                  isLocked: forum.isLocked,
                  isTournamentForum: forum.isTournamentForum,
                  topicCount: forum._count.topics,
                  hasNew: unreadForumIds.includes(forum.id),
                  lastTopic: lastTopic && {
                    title: lastTopic.title,
                    isTournament: !!lastTopic.tournamentId,
                    lastPostAuthorName: lastTopic.lastPostAuthor?.name ?? null,
                    lastPostAt: lastTopic.lastPostAt,
                  },
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
