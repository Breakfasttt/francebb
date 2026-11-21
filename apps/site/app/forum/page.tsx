/**
 * Accueil du forum (DESIGN.md, « Le forum ») : catégories repliables en tableaux, un bandeau pour le membre qui a du
 * non-lu, un bandeau de bienvenue pour le visiteur (carte 185). Coquille SiteLayout : outils à gauche (sous la liste
 * sur téléphone), dernières discussions à droite sur grand écran.
 */
import RelativeTime from "@/common/components/RelativeTime/RelativeTime";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ForumSidebar from "@/app/forum/component/ForumSidebar";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import ForumCategory, { type ForumIndexCategory } from "@/app/forum/component/ForumCategory";
import DeletionToast from "@/app/forum/component/DeletionToast";
import { ForumVisitorBanner } from "@/app/forum/component/ForumVisitorInvite";
import { getUnreadState } from "@/app/forum/unreadState";
import { getForumAccess, topicAccessWhere } from "@/lib/forumAccess";
import SiteLayout, { PanelTitle } from "@/common/components/SiteLayout/SiteLayout";

import { unstable_cache } from "next/cache";

// Structure du forum partagée par tous les visiteurs d'un même niveau d'accès (rôles accessibles, lib/forumAccess.ts) :
// seul le dernier topic de chaque forum est chargé. L'état « non lu », propre à chaque user, est calculé hors cache.
// Supprimer ou restaurer un sujet (carte 165) renouvelle ce cache par son étiquette « forum-categories ».
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
            // Les sujets supprimés (carte 165) ne comptent pas et ne sont jamais « dernier sujet »
            _count: { select: { topics: { where: { isDeleted: false } } } },
            topics: {
              where: { isArchived: false, isDeleted: false },
              // Le sujet au dernier message le plus récent (carte 166), avec l'auteur de ce message
              orderBy: { lastPostAt: "desc" },
              take: 1,
              select: { title: true, lastPostAt: true, tournamentId: true, lastPostAuthor: { select: { name: true } } },
            },
            subForums: { where: accessible, select: { id: true } },
          },
        },
      },
    });
  },
  ["forum-categories-list-v5"],
  { revalidate: 60, tags: ["forum-categories"] }
);

// Dernières discussions (colonne de contexte) : les 8 sujets au message le plus récent, pour ce niveau d'accès
const getCachedRecentTopics = unstable_cache(
  async (roles: string[]) =>
    prisma.topic.findMany({
      where: { ...topicAccessWhere(roles), isArchived: false },
      orderBy: { lastPostAt: "desc" },
      take: 8,
      select: { id: true, title: true, lastPostAt: true, lastPostAuthor: { select: { name: true } }, _count: { select: { posts: true } } },
    }),
  ["forum-recent-topics-v1"],
  { revalidate: 60, tags: ["forum-categories"] }
);

// Nombre de messages par forum (messages et sujets non supprimés) : une seule requête groupée, gardée 60 secondes.
// Il n'est affiché que pour les forums que le visiteur peut voir (getCachedCategories filtre déjà les forums).
const getCachedPostCounts = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const rows = await prisma.$queryRaw<{ forumId: string; count: bigint }[]>`
      SELECT t."forumId" AS "forumId", COUNT(p.id) AS count
      FROM "Post" p JOIN "Topic" t ON t.id = p."topicId"
      WHERE p."isDeleted" = false AND t."isDeleted" = false
      GROUP BY t."forumId"`;
    return Object.fromEntries(rows.map((row) => [row.forumId, Number(row.count)]));
  },
  ["forum-post-counts-v1"],
  { revalidate: 60, tags: ["forum-categories"] }
);

export default async function ForumPage() {
  const session = await getActiveSession();
  const userId = session?.user?.id;

  const access = await getForumAccess();
  const [categories, unread, recentTopics, postCounts] = await Promise.all([
    getCachedCategories(access.roles),
    userId ? getUnreadState(userId) : null,
    getCachedRecentTopics(access.roles),
    getCachedPostCounts(),
  ]);

  // Forums (sous-forums compris) contenant au moins un topic non lu
  const unreadForumIds = categories.flatMap((category) =>
    category.forums
      .filter((forum) => unread && [forum.id, ...forum.subForums.map((sub) => sub.id)].some((id) => unread.unreadForumIds.has(id)))
      .map((forum) => forum.id)
  );
  const unreadCount = unread?.count ?? 0;

  const context = recentTopics.length > 0 && (
    <section aria-labelledby="forum-recent-title" className="flex flex-col">
      <PanelTitle id="forum-recent-title">Dernières discussions</PanelTitle>
      <ol className="flex flex-col border-t border-bb-border">
        {recentTopics.map((topic) => (
          <li key={topic.id} className="border-b border-bb-border">
            <Link href={`/forum/topic/${topic.id}`} className="flex flex-col gap-0.5 py-2.5 no-underline hover:text-bb-accent-text">
              <span className="line-clamp-2 text-[0.95rem] font-semibold leading-snug text-bb-text">{topic.title}</span>
              <span className="text-sm text-bb-text-muted tabular-nums">
                {topic.lastPostAuthor?.name ?? "Anonyme"} · <RelativeTime date={topic.lastPostAt} />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );

  return (
    <SiteLayout
      header={<ForumListHeader title="Forum" subtitle="L'espace de discussion de la communauté Blood Bowl française" backHref="/" />}
      aside={<ForumSidebar />}
      asideLabel="Outils du forum"
      context={context}
      contextLabel="Dernières discussions"
    >
      <DeletionToast />
      {/* Visiteur non connecté : bandeau d'accueil qui explique le site et invite à créer un compte (carte 185) */}
      {!userId && <ForumVisitorBanner />}
      {unreadCount > 0 && (
        <Link
          href="/forum/unread"
          className="flex min-h-12 items-center gap-3 rounded-bb-lg border border-bb-border border-l-[3px] border-l-bb-unread bg-bb-surface px-4 py-2 text-bb-text no-underline hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:outline-bb-focus"
        >
          <span className="flex-1 font-semibold">
            {unreadCount} {unreadCount > 1 ? "sujets non lus" : "sujet non lu"}
          </span>
          <span className="flex items-center gap-0.5 text-sm font-bold text-bb-accent-text">
            Voir <ChevronRight size={16} aria-hidden="true" />
          </span>
        </Link>
      )}
      {categories.map((category) => (
        <ForumCategory key={category.id} category={category} unreadForumIds={unreadForumIds} postCounts={postCounts} />
      ))}
    </SiteLayout>
  );
}
