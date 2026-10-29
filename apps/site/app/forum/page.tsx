import ForumSidebar from "@/app/forum/component/ForumSidebar";
import "./page.css";
import "./page-mobile.css";

import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/common/components/PageHeader/PageHeader";
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

  return (
    <div className="forum-page">
      <PageHeader
        title={<>Le Forum France <span>Blood Bowl</span></>}
        subtitle="L'espace de discussion de la communauté Blood Bowl française"
        backHref="/"
      />

      <main className="container forum-container">

      <div className="forum-layout">
        <div className="forum-main-content">
          <DeletionToast />
          {categories.map((category) => (
            <ForumCategory
              key={category.id}
              category={category}
              unreadForumIds={unreadForumIds}
            />
          ))}
        </div>
        <ForumSidebar />
      </div>
    </main>
    </div>
  );
}
