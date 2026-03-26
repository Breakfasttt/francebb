import { getQuoteStatusMap } from "@/app/forum/actions";
import ForumBreadcrumbs from "@/app/forum/component/ForumBreadcrumbs";
import MarkAsRead from "@/app/forum/component/MarkAsRead";
import PostItem from "@/app/forum/component/PostItem";
import QuickReply from "@/app/forum/component/QuickReply";
import RegistrationModule from "@/app/forum/component/RegistrationModule";
import TopicSidebar from "@/app/forum/component/TopicSidebar";
import TournamentSummary from "@/app/forum/component/TournamentSummary";
import { auth } from "@/auth";
import { parseInlineBBCode } from "@/lib/bbcode";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { ArrowLeft, Lock as LockIcon } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import "../../page.css";

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 20;

export default async function TopicPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ page?: string }> }) {
  const { id } = await params;
  const { page: pageStr } = await searchParams;

  const session = await auth();
  const currentUserId = session?.user?.id;

  // Jump to first unread post if no specific page is requested
  if (!pageStr && currentUserId) {
    const topicView = await prisma.topicView.findUnique({
      where: { userId_topicId: { userId: currentUserId, topicId: id } }
    });

    const viewDate = topicView ? topicView.lastViewedAt : new Date(0);
    const lastPostId = topicView ? topicView.lastPostId : "";

    const firstUnread = await prisma.post.findFirst({
      where: {
        topicId: id,
        OR: [
          { createdAt: { gt: viewDate } },
          {
            createdAt: viewDate,
            id: { gt: lastPostId || "" }
          }
        ]
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { id: true, createdAt: true }
    });

    if (firstUnread) {
      // Count posts BEFORE this one using the same deterministic order
      const countBefore = await prisma.post.count({
        where: {
          topicId: id,
          OR: [
            { createdAt: { lt: firstUnread.createdAt } },
            {
              createdAt: firstUnread.createdAt,
              id: { lt: firstUnread.id }
            }
          ]
        }
      });
      const targetPage = Math.floor(countBefore / POSTS_PER_PAGE) + 1;
      redirect(`/forum/topic/${id}?page=${targetPage}#post-${firstUnread.id}`);
    }
  }

  const currentPage = Math.max(1, parseInt(pageStr || '1', 10));
  const skip = (currentPage - 1) * POSTS_PER_PAGE;

  const isUserModerator = isModerator(session?.user?.role);

  const [topic, totalPostCount, lastPost, allForums] = await Promise.all([
    prisma.topic.findUnique({
      where: { id },
      include: {
        tournament: {
          include: {
            commissaires: true,
            registrations: { include: { user: true } },
            teams: {
              include: {
                members: { include: { user: true } },
                captain: true
              }
            },
            mercenaries: { include: { user: true } }
          }
        },
        forum: {
          include: {
            category: true,
            parentForum: {
              include: { category: true }
            }
          }
        },
        author: true,
        posts: {
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          skip,
          take: POSTS_PER_PAGE,
          include: {
            author: true,
            moderator: true,
            reactions: true
          }
        }
      }
    }),
    prisma.post.count({ where: { topicId: id } }),
    prisma.post.findFirst({
      where: { topicId: id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { id: true }
    }),
    prisma.forum.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    })
  ]);

  if (!topic) notFound();

  // Si c'est un tournoi et qu'on n'est pas sur la page 1, on récupère le premier message
  let firstPostForTournament = null;
  if (topic.tournament && currentPage > 1) {
    firstPostForTournament = await prisma.post.findFirst({
      where: { topicId: id },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      include: {
        author: true,
        moderator: true,
        reactions: true
      }
    });
  }

  const displayViews = topic.views || 0;

  const totalPages = Math.max(1, Math.ceil(totalPostCount / POSTS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const isTournamentOrganizer = topic.tournament?.organizerId === currentUserId;
  const isTournamentCommissaire = topic.tournament?.commissaires.some((c: any) => c.id === currentUserId);
  const canEditTournament = isUserModerator || isTournamentOrganizer || isTournamentCommissaire;

  const postContents = topic.posts.map(p => p.content);
  const quoteStatusMap = await getQuoteStatusMap(postContents);

  const regionLabels: Record<string, string> = {
    "IDF": "R1 - Île-de-France",
    "Nord-Ouest": "R2 - Nord-Ouest",
    "Nord-Est": "R3 - Nord-Est",
    "Sud-Est": "R4 - Sud-Est",
    "Sud-Ouest": "R5 - Sud-Ouest",
  };

  const breadcrumbs = [];
  if (topic.forum.parentForum) {
    if (topic.forum.parentForum.category) breadcrumbs.push({ label: topic.forum.parentForum.category.name, isCategory: true });
    breadcrumbs.push({ label: topic.forum.parentForum.name, href: `/forum/${topic.forum.parentForumId}` });
  } else if (topic.forum.category) {
    breadcrumbs.push({ label: topic.forum.category.name, isCategory: true });
  }
  breadcrumbs.push({ label: topic.forum.name, href: `/forum/${topic.forumId}` });
  breadcrumbs.push({ label: topic.title });

  return (
    <main className="container forum-container">
      <MarkAsRead topicId={id} />
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link href={`/forum/${topic.forumId}`} className="back-button" title="Retour au forum" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: 'var(--accent)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.forum.name) }} />
          <h1 style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <span dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.title) }} />
            {topic.isArchived && (
              <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', color: '#888', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600 }}>
                ARCHIVÉ
              </span>
            )}
          </h1>
        </div>
      </header>

      <ForumBreadcrumbs items={breadcrumbs} />

      <div className="forum-layout">
        <div className="forum-main-content">

          <div className="posts-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Résumé du tournoi si applicable */}
            {topic.tournament && (
              <>
                <TournamentSummary tournament={topic.tournament} />
                <RegistrationModule
                  tournament={topic.tournament}
                  currentUser={session?.user}
                  isOrganizer={!!isTournamentOrganizer}
                  isCommissioner={!!isTournamentCommissaire}
                />
              </>
            )}

            {/* Premier message persistant pour les tournois (si page > 1) */}
            {firstPostForTournament && (
              <PostItem
                post={firstPostForTournament}
                index={0}
                topicId={id}
                currentUserId={currentUserId}
                isUserModerator={isUserModerator}
                quoteStatusMap={quoteStatusMap}
                safeCurrentPage={safeCurrentPage}
                regionLabels={regionLabels}
                isFirstPostAlwaysVisible={true}
              />
            )}

            {/* Liste des messages de la page courante */}
            {topic.posts.map((post, index) => (
              <PostItem
                key={post.id}
                post={post}
                index={skip + index}
                topicId={id}
                currentUserId={currentUserId}
                isUserModerator={isUserModerator}
                quoteStatusMap={quoteStatusMap}
                safeCurrentPage={safeCurrentPage}
                regionLabels={regionLabels}
                isTournament={!!topic.tournament}
                tournamentId={topic.tournament?.id}
                firstPostId={topic.posts[0]?.id}
              />
            ))}
          </div>

          {(!(topic.isLocked || topic.forum.isLocked) || isUserModerator) ? (
            <QuickReply topicId={id} />
          ) : (
            <div id="quick-reply-area" style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              background: 'rgba(239, 68, 68, 0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#888',
              marginTop: '3rem'
            }}>
              <LockIcon size={32} style={{ marginBottom: '1rem', color: '#ef4444', opacity: 0.6 }} />
              <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Sujet verrouillé</h3>
              <p>Vous ne pouvez plus répondre à ce sujet car il a été verrouillé par la modération.</p>
            </div>
          )}
        </div>
        <TopicSidebar
          topicId={id}
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          isModerator={isUserModerator}
          isPinned={topic.isSticky}
          isLocked={topic.isLocked}
          isForumLocked={topic.forum.isLocked}
          lastPostId={lastPost?.id || ""}
          lastPage={totalPages}
          allForums={allForums}
          topicTitle={topic.title}
          authorId={topic.authorId}
          currentUserId={currentUserId}
          views={displayViews}
          isArchived={topic.isArchived}
          isTournament={!!topic.tournament}
          tournamentId={topic.tournament?.id}
          canEditTournament={canEditTournament}
        />
      </div>
    </main>
  );
}
