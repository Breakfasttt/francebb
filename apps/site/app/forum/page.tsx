/**
 * Accueil du forum (refonte, carte 085) : catégories repliables en cartes, un bandeau pour le membre qui a du non-lu,
 * et la colonne d'actions (à droite sur ordinateur, dans « Cette page » du panneau « Plus » sur téléphone).
 */
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ForumSidebar from "@/app/forum/component/ForumSidebar";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import { UnreadDot } from "@/app/forum/component/ForumListItems";
import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import ForumCategory, { type ForumIndexCategory } from "@/app/forum/component/ForumCategory";
import DeletionToast from "@/app/forum/component/DeletionToast";
import { getUnreadState } from "@/app/forum/unreadState";
import { getForumAccess } from "@/lib/forumAccess";

import { unstable_cache } from "next/cache";

// Structure du forum partagée par tous les visiteurs d'un même niveau d'accès (rôles accessibles, lib/forumAccess.ts) :
// seul le dernier topic de chaque forum est chargé. L'état « non lu », propre à chaque user, est calculé hors cache.
const getCachedCategories = unstable_cache(
  async (roles: string[]): Promise<ForumIndexCategory[]> => {
    const accessible = { allowedRoles: { in: roles } };
    return prisma.category.findMany({
      where: accessible,
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        forums: {
          where: { parentForumId: null, ...accessible },
          orderBy: { order: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            isLocked: true,
            isTournamentForum: true,
            _count: { select: { topics: true } },
            topics: {
              where: { isArchived: false },
              orderBy: { updatedAt: "desc" },
              take: 1,
              select: { title: true, updatedAt: true, tournamentId: true, author: { select: { name: true } } },
            },
            subForums: { where: accessible, select: { id: true } },
          },
        },
      },
    });
  },
  ["forum-categories-list-v3"],
  { revalidate: 60, tags: ["forum-categories"] }
);

export default async function ForumPage() {
  const session = await getActiveSession();
  const userId = session?.user?.id;

  const access = await getForumAccess();
  const [categories, unread] = await Promise.all([
    getCachedCategories(access.roles),
    userId ? getUnreadState(userId) : null,
  ]);

  // Forums (sous-forums compris) contenant au moins un topic non lu
  const unreadForumIds = categories.flatMap((category) =>
    category.forums
      .filter((forum) => unread && [forum.id, ...forum.subForums.map((sub) => sub.id)].some((id) => unread.unreadForumIds.has(id)))
      .map((forum) => forum.id)
  );
  const unreadCount = unread?.count ?? 0;

  return (
    <div className="mx-auto w-full max-w-[1232px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ForumListHeader title="Forum" subtitle="L'espace de discussion de la communauté Blood Bowl française" backHref="/" />

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_288px] lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <DeletionToast />
          {unreadCount > 0 && (
            <Link
              href="/forum/unread"
              className="flex min-h-12 items-center gap-3 rounded-bb-lg border border-bb-border bg-bb-surface px-4 py-2 text-bb-text hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:outline-bb-focus"
            >
              <UnreadDot />
              <span className="flex-1 font-semibold">
                {unreadCount} {unreadCount > 1 ? "sujets non lus" : "sujet non lu"}
              </span>
              <span className="flex items-center gap-0.5 text-sm font-bold text-bb-accent-text">
                Voir <ChevronRight size={16} aria-hidden="true" />
              </span>
            </Link>
          )}
          {categories.map((category) => (
            <ForumCategory key={category.id} category={category} unreadForumIds={unreadForumIds} />
          ))}
        </div>
        <ForumSidebar />
      </div>
    </div>
  );
}
