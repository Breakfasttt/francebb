/**
 * Page d'un forum (refonte, carte 085) : sous-forums, puis sujets en lignes à la manière de Discourse, pagination
 * en bas. Sur ordinateur, les actions sont dans une colonne à droite ; sur téléphone, « Nouveau sujet » (et
 * « Nouveau tournoi ») restent visibles en haut de la liste, le reste passe dans « Cette page » du panneau « Plus ».
 */
import Link from "next/link";
import { getActiveSession } from "@/lib/authGuard";
import { getForumAccess, canAccessForum } from "@/lib/forumAccess";
import { getUnreadState } from "@/app/forum/unreadState";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { canModerateForum } from "@/lib/forumModerators";
import { Card, CardHeader, CardTitle, PageNav } from "@bbfrance/ui";
import ForumSidebar, { ForumPrimaryActions } from "@/app/forum/component/ForumSidebar";
import SiteLayout from "@/common/components/SiteLayout/SiteLayout";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import { ForumRow, LockMark, TopicRow, UnreadDot } from "@/app/forum/component/ForumListItems";
import { parseInlineBBCode } from "@/lib/bbcode";
import ForumBreadcrumbs from "@/app/forum/component/ForumBreadcrumbs";
import { notFound, redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { TopicRowData } from "@/app/forum/component/ForumListItems";

export const dynamic = "force-dynamic";

const TOPICS_PER_PAGE = 30;
const MAX_SUBFORUMS = 10;
/** Sujets archivés montrés en bas de la liste (les plus récents d'abord) ; les autres restent trouvables par la recherche. */
const MAX_ARCHIVED = 100;

/** Données d'une ligne de sujet, à partir d'un sujet lu avec `topicInclude`. */
function rowData(
  topic: {
    id: string;
    title: string;
    isSticky: boolean;
    isLocked: boolean;
    tournamentId: string | null;
    createdAt: Date;
    lastPostAt: Date;
    views: number | null;
    author: { name: string | null; image: string | null };
    lastPostAuthor: { name: string | null } | null;
    _count: { posts: number };
    tournament: TopicRowData["tournament"];
  },
  hasNew: boolean
): TopicRowData {
  return {
    id: topic.id,
    title: topic.title,
    isSticky: topic.isSticky,
    isLocked: topic.isLocked,
    isTournament: !!topic.tournamentId,
    tournament: topic.tournament,
    hasNew,
    author: topic.author,
    createdAt: topic.createdAt,
    lastPostAuthorName: topic.lastPostAuthor?.name ?? null,
    lastPostAt: topic.lastPostAt,
    postCount: topic._count.posts,
    views: topic.views || 0,
  };
}

export default async function ForumDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ page?: string }> }) {
  const [session, { roles }] = await Promise.all([getActiveSession(), getForumAccess()]);
  const userId = session?.user?.id;
  const { id } = await params;
  const { page: pageStr } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr || "1", 10) || 1);
  const skip = (currentPage - 1) * TOPICS_PER_PAGE;

  // Fetch forum meta + sub-forums (always all, capped at 10 in display)
  const forum = await prisma.forum.findUnique({
    where: { id },
    include: {
      category: true,
      subForums: {
        where: { allowedRoles: { in: roles } },
        orderBy: { order: "asc" },
        take: MAX_SUBFORUMS,
        include: {
          // Les sujets supprimés (carte 165) ne comptent pas
          _count: { select: { topics: { where: { isDeleted: false } } } },
          topics: {
            where: { isArchived: false, isDeleted: false },
            // Le sujet au dernier message le plus récent (carte 166), avec l'auteur de ce message
            orderBy: { lastPostAt: "desc" },
            take: 1,
            select: {
              title: true,
              lastPostAt: true,
              lastPostAuthor: { select: { name: true } },
              tournament: { select: { date: true, endDate: true, isCancelled: true, isFinished: true } }
            }
          }
        }
      },
      parentForum: {
        include: { category: true }
      },
    }
  });

  if (!forum) notFound();

  // Sécurité : forum (ou catégorie / forum parent) réservé à un rôle supérieur
  if (!canAccessForum(forum, roles)) {
    if (!userId) redirect("/auth/login?callbackUrl=/forum/" + id);
    notFound();
  }

  // Topics paginés + total (mêmes critères : les archivés et les supprimés ne comptent pas) + non-lus du membre
  // (sujets de la page et sous-forums), calculés par la base en une requête (unreadState.ts).
  // Les sujets archivés ont leur propre groupe, replié, en bas de la dernière page : l'accueil les compte, ils doivent
  // donc rester trouvables. Ils n'entrent jamais dans les non-lus (règle voulue, unreadState.ts).
  const listWhere = { forumId: id, isArchived: false, isDeleted: false };
  const archivedWhere = { forumId: id, isArchived: true, isDeleted: false };
  const topicInclude = {
    author: { select: { name: true, image: true } },
    lastPostAuthor: { select: { name: true } },
    _count: { select: { posts: true } },
    tournament: { select: { date: true, endDate: true, isCancelled: true, isFinished: true } }
  } as const;
  const [totalTopics, totalArchived, topics, unread] = await Promise.all([
    prisma.topic.count({ where: listWhere }),
    prisma.topic.count({ where: archivedWhere }),
    prisma.topic.findMany({
    where: listWhere,
    orderBy: [
      { isSticky: "desc" },
      // Dernier message, jamais `updatedAt` : épingler ou renommer un sujet ne doit pas le faire remonter (carte 166)
      { lastPostAt: "desc" },
      { id: "desc" }
    ],
    skip,
    take: TOPICS_PER_PAGE,
    include: topicInclude
    }),
    userId ? getUnreadState(userId) : null,
  ]);
  const totalPages = Math.max(1, Math.ceil(totalTopics / TOPICS_PER_PAGE));
  const showArchived = totalArchived > 0 && currentPage >= totalPages;
  const archivedTopics = showArchived
    ? await prisma.topic.findMany({
        where: archivedWhere,
        orderBy: [{ lastPostAt: "desc" }, { id: "desc" }],
        take: MAX_ARCHIVED,
        include: topicInclude
      })
    : [];

  const isUnread = (topicId: string) => unread?.unreadTopicIds.has(topicId) ?? false;
  // Point bleu du titre : ce forum contient un sujet non lu, sur cette page ou une autre
  const forumHasNew = unread?.unreadForumIds.has(id) ?? false;

  const breadcrumbs = [];
  if (forum.parentForum) {
    if (forum.parentForum.category) breadcrumbs.push({ label: forum.parentForum.category.name, isCategory: true });
    breadcrumbs.push({ label: forum.parentForum.name, href: `/forum/${forum.parentForumId}` });
  } else if (forum.category) {
    breadcrumbs.push({ label: forum.category.name, isCategory: true });
  }
  breadcrumbs.push({ label: forum.name });

  // Modération du site, ou modérateur de ce forum (carte 225) : peut écrire dans un forum verrouillé
  const canModerate = await canModerateForum(session?.user?.id, session?.user?.role, id);

  return (
    <SiteLayout
      asideLabel="Actions du forum"
      aside={
        <ForumSidebar
          forumId={id}
          forumName={forum.name}
          categoryId={forum.categoryId || forum.parentForum?.categoryId || undefined}
          parentForumId={id}
          isLocked={forum.isLocked}
          isTournamentForum={forum.isTournamentForum}
        />
      }
      header={
        <>
      <div className="pt-3 lg:pt-4">
        <ForumBreadcrumbs items={breadcrumbs} className="mb-0" />
      </div>
      <ForumListHeader
        title={
          <>
            <span className="min-w-0 break-words" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(forum.name) }} />
            {forum.isLocked && <LockMark label="Forum verrouillé" size={20} />}
            {forumHasNew && <UnreadDot />}
          </>
        }
        subtitle={forum.description}
      />
        </>
      }
    >
          {/* Téléphone : les actions principales restent visibles en haut de la liste */}
          <ForumPrimaryActions
            forumId={id}
            isLocked={forum.isLocked}
            isTournamentForum={forum.isTournamentForum}
            isMember={!!userId}
            isModerator={canModerate}
            className="lg:hidden"
          />

          {forum.subForums.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="font-bb-heading text-bb-label text-bb-text-muted">Sous-forums</CardTitle>
              </CardHeader>
              {forum.subForums.map((sub) => {
                const lastTopic = sub.topics[0];
                return (
                  <ForumRow
                    key={sub.id}
                    forum={{
                      id: sub.id,
                      name: sub.name,
                      description: sub.description,
                      isLocked: sub.isLocked,
                      isTournamentForum: sub.isTournamentForum,
                      topicCount: sub._count.topics,
                      hasNew: unread?.unreadForumIds.has(sub.id) ?? false,
                      lastTopic: lastTopic && {
                        title: lastTopic.title,
                        isTournament: !!lastTopic.tournament,
                        tournament: lastTopic.tournament,
                        lastPostAuthorName: lastTopic.lastPostAuthor?.name ?? null,
                        lastPostAt: lastTopic.lastPostAt,
                      },
                    }}
                  />
                );
              })}
            </Card>
          )}

          <Card className="overflow-hidden">
            {/* En-têtes de colonnes, sur ordinateur seulement (sur téléphone, chaque ligne nomme ses chiffres) */}
            <div aria-hidden="true" className="hidden items-center gap-4 border-b border-bb-border bg-bb-surface-2 px-4 py-2.5 font-bb-heading text-bb-label text-bb-text-muted lg:flex">
              <span className="flex-1 pl-[52px]">Sujet</span>
              <span className="w-24 text-right">Messages</span>
              <span className="w-20 text-right">Vues</span>
              <span className="w-40 text-right">Dernier message</span>
            </div>
            {topics.length > 0 ? (
              topics.map((topic) => <TopicRow key={topic.id} topic={rowData(topic, isUnread(topic.id))} />)
            ) : (
              <p className="px-4 py-6 text-bb-text-muted">
                {totalArchived > 0
                  ? "Aucun sujet en cours ici. Les anciens sujets sont rangés dans les archives, juste en dessous."
                  : "Pas encore de sujet ici. Lance la première discussion."}
              </p>
            )}
          </Card>

          <PageNav
            page={currentPage}
            totalPages={totalPages}
            hrefFor={(page) => `/forum/${id}?page=${page}`}
            linkComponent={Link}
            className="self-center"
          />

          {/* Sujets archivés : un groupe replié en bas de la dernière page (fermés, retirés des non-lus) */}
          {showArchived && (
            <details className="group overflow-hidden rounded-bb-lg border border-bb-border bg-bb-surface">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 bg-bb-surface-2 px-3 py-2 font-bb-heading text-bb-label text-bb-text-muted hover:text-bb-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus lg:px-4 [&::-webkit-details-marker]:hidden">
                <ChevronRight size={16} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-90" />
                Sujets archivés ({totalArchived.toLocaleString("fr-FR")})
              </summary>
              <div className="border-t border-bb-border">
                {archivedTopics.map((topic) => <TopicRow key={topic.id} topic={rowData(topic, false)} />)}
                {totalArchived > archivedTopics.length && (
                  <p className="m-0 border-t border-bb-border px-4 py-3 text-sm text-bb-text-muted">
                    Les {MAX_ARCHIVED} plus récents sont listés ici. Pour les autres,{" "}
                    <Link href={`/forum/search?forumId=${id}`} className="font-semibold text-bb-text hover:text-bb-accent-text">
                      cherche dans ce forum
                    </Link>
                    .
                  </p>
                )}
              </div>
            </details>
          )}
    </SiteLayout>
  );
}
