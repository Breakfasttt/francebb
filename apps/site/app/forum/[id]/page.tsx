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
import { Card, CardHeader, CardTitle, EmptyState, PageNav } from "@bbfrance/ui";
import { MessageSquare } from "lucide-react";
import ForumSidebar, { ForumPrimaryActions } from "@/app/forum/component/ForumSidebar";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import { ForumRow, LockMark, TopicRow, UnreadDot } from "@/app/forum/component/ForumListItems";
import { parseInlineBBCode } from "@/lib/bbcode";
import ForumBreadcrumbs from "@/app/forum/component/ForumBreadcrumbs";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const TOPICS_PER_PAGE = 30;
const MAX_SUBFORUMS = 10;

export default async function ForumDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ page?: string }> }) {
  const [session, { roles }] = await Promise.all([getActiveSession(), getForumAccess()]);
  const userId = session?.user?.id;
  const { id } = await params;
  const { page: pageStr } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr || "1", 10));
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
          _count: { select: { topics: true } },
          topics: {
            where: { isArchived: false },
            orderBy: { updatedAt: "desc" },
            take: 1,
            select: {
              title: true,
              updatedAt: true,
              author: { select: { name: true } },
              tournament: { select: { date: true, isCancelled: true, isFinished: true } }
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

  // Topics paginés + total (mêmes critères : les archivés ne comptent pas) + non-lus des sous-forums, en parallèle
  const listWhere = { forumId: id, isArchived: false };
  const [totalTopics, topics, unread] = await Promise.all([
    prisma.topic.count({ where: listWhere }),
    prisma.topic.findMany({
    where: listWhere,
    orderBy: [
      { isSticky: "desc" },
      { updatedAt: "desc" }
    ],
    skip,
    take: TOPICS_PER_PAGE,
    include: {
      author: { select: { name: true, image: true } },
      _count: {
        select: { posts: true }
      },
      topicViews: {
        where: { userId: userId || "" }
      },
      tournament: { select: { date: true, isCancelled: true, isFinished: true } }
    }
    }),
    userId ? getUnreadState(userId) : null,
  ]);
  const totalPages = Math.max(1, Math.ceil(totalTopics / TOPICS_PER_PAGE));

  const forumHasNew = userId ? topics.some(topic => {
    const view = topic.topicViews[0];
    return !view || topic.updatedAt > view.lastViewedAt;
  }) : false;

  const breadcrumbs = [];
  if (forum.parentForum) {
    if (forum.parentForum.category) breadcrumbs.push({ label: forum.parentForum.category.name, isCategory: true });
    breadcrumbs.push({ label: forum.parentForum.name, href: `/forum/${forum.parentForumId}` });
  } else if (forum.category) {
    breadcrumbs.push({ label: forum.category.name, isCategory: true });
  }
  breadcrumbs.push({ label: forum.name });

  const canModerate = isModerator(session?.user?.role);

  return (
    <div className="mx-auto w-full max-w-[1232px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
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

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_288px] lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
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
                <CardTitle className="text-[0.8125rem] tracking-wider text-bb-text-muted uppercase">Sous-forums</CardTitle>
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
                        authorName: lastTopic.author.name,
                        date: lastTopic.updatedAt,
                      },
                    }}
                  />
                );
              })}
            </Card>
          )}

          <Card className="overflow-hidden">
            {/* En-têtes de colonnes, sur ordinateur seulement (sur téléphone, chaque ligne nomme ses chiffres) */}
            <div aria-hidden="true" className="hidden items-center gap-4 border-b border-bb-border px-4 py-2 text-[0.8125rem] font-semibold text-bb-text-muted lg:flex">
              <span className="flex-1 pl-[52px]">Sujet</span>
              <span className="w-24 text-right">Messages</span>
              <span className="w-20 text-right">Vues</span>
              <span className="w-28 text-right">Activité</span>
            </div>
            {topics.length > 0 ? (
              topics.map((topic) => {
                const topicView = topic.topicViews[0];
                return (
                  <TopicRow
                    key={topic.id}
                    topic={{
                      id: topic.id,
                      title: topic.title,
                      isSticky: topic.isSticky,
                      isLocked: topic.isLocked,
                      isTournament: !!topic.tournamentId,
                      tournament: topic.tournament,
                      hasNew: userId ? !topicView || topic.updatedAt > topicView.lastViewedAt : false,
                      author: topic.author,
                      createdAt: topic.createdAt,
                      updatedAt: topic.updatedAt,
                      postCount: topic._count.posts,
                      views: topic.views || 0,
                    }}
                  />
                );
              })
            ) : (
              <EmptyState icon={<MessageSquare size={36} />} title="Aucun sujet dans ce forum pour le moment." />
            )}
          </Card>

          <PageNav
            page={currentPage}
            totalPages={totalPages}
            hrefFor={(page) => `/forum/${id}?page=${page}`}
            linkComponent={Link}
            className="self-center"
          />
        </div>

        <ForumSidebar
          forumId={id}
          forumName={forum.name}
          categoryId={forum.categoryId || forum.parentForum?.categoryId || undefined}
          parentForumId={id}
          isLocked={forum.isLocked}
          isTournamentForum={forum.isTournamentForum}
        />
      </div>
    </div>
  );
}
