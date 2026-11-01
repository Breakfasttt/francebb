import { getQuoteStatusMap } from "@/app/forum/actions";
import ForumBreadcrumbs from "@/app/forum/component/ForumBreadcrumbs";
import MarkAsRead from "@/app/forum/component/MarkAsRead";
import PostItem from "@/app/forum/component/PostItem";
import QuickReply from "@/app/forum/component/QuickReply";
import RegistrationModule from "@/app/forum/component/RegistrationModule";
import { TopicPageNav, TopicReplyBar, TopicToolsAside, TopicToolsButton, TopicToolsProvider } from "@/app/forum/component/TopicTools";
import TournamentSummary from "@/app/forum/component/TournamentSummary";
import TournamentResultWidget from "@/app/forum/component/TournamentResultWidget";
import { getActiveSession } from "@/lib/authGuard";
import { getForumAccess, canAccessForum, forumAccessWhere } from "@/lib/forumAccess";
import { parseInlineBBCode } from "@/lib/bbcode";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { getBlockedUsersIds } from "@/app/profile/actions";
import { Lock as LockIcon } from "lucide-react";
import { Badge, Card } from "@bbfrance/ui";
import Link from "next/link";
import BackButton from "@/common/components/BackButton/BackButton";
import MobilePortal from "@/common/components/MobilePortal/MobilePortal";
import { notFound, redirect } from "next/navigation";
// Styles des blocs BBCode (spoiler, accordéon, galerie) et animation du nouveau message, partagés par le forum

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 20;

export default async function TopicPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ page?: string }> }) {
  const { id } = await params;
  const { page: pageStr } = await searchParams;

  const [session, { roles }] = await Promise.all([getActiveSession(), getForumAccess()]);
  const currentUserId = session?.user?.id;

  // Récupérer les blocages de l'utilisateur courant
  const blockedUserIds = await getBlockedUsersIds();

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
            mercenaries: { include: { user: true } },
            results: { include: { user: true } },
            rounds: { include: { matches: true }, orderBy: { roundNumber: 'asc' } },
            ligue: true
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
        author: { include: { ligues: true } },
        posts: {
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          skip,
          take: POSTS_PER_PAGE,
          include: {
            author: { 
              include: { 
                ligues: true,
                _count: { select: { posts: true } }
              } 
            },
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
    // Liste des forums : uniquement pour la modale de déplacement (modérateurs)
    isUserModerator
      ? prisma.forum.findMany({
          // Seuls les forums accessibles au rôle du modérateur peuvent recevoir le sujet
          where: forumAccessWhere(roles),
          orderBy: { name: "asc" },
          select: { id: true, name: true }
        })
      : []
  ]);

  if (!topic) notFound();

  // Sécurité : forum du topic (ou sa catégorie / son forum parent) réservé à un rôle supérieur
  if (!canAccessForum(topic.forum, roles)) {
    if (!currentUserId) redirect("/auth/login?callbackUrl=/forum/topic/" + id);
    notFound();
  }

  // Si c'est un tournoi et qu'on n'est pas sur la page 1, on récupère le premier message
  let firstPostForTournament = null;
  if (topic.tournament && currentPage > 1) {
    firstPostForTournament = await prisma.post.findFirst({
      where: { topicId: id },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      include: {
        author: { 
          include: { 
            ligues: true,
            _count: { select: { posts: true } }
          } 
        },
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

  // Libellés lisibles des rôles (y compris personnalisés), lus une seule fois pour tous les messages
  const roleConfigs = await prisma.roleConfig.findMany({ select: { name: true, label: true } });
  const roleLabels: Record<string, string> = Object.fromEntries(roleConfigs.map(r => [r.name, r.label]));

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

  // Peut-il répondre ? Membre, et sujet et forum non verrouillés (un modérateur peut toujours répondre)
  const canReply = !!currentUserId && (!(topic.isLocked || topic.forum.isLocked) || isUserModerator);

  return (
    <div className="mx-auto w-full max-w-[1232px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <MarkAsRead topicId={id} />

      <TopicToolsProvider
        topicId={id}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        isModerator={isUserModerator}
        isPinned={topic.isSticky}
        isLocked={topic.isLocked}
        isForumLocked={topic.forum.isLocked}
        lastPostId={lastPost?.id || ""}
        allForums={allForums}
        topicTitle={topic.title}
        authorId={topic.authorId}
        currentUserId={currentUserId}
        views={displayViews}
        isArchived={topic.isArchived}
        isTournament={!!topic.tournament}
        tournamentId={topic.tournament?.id}
        canEditTournament={!!canEditTournament}
        isFinished={topic.tournament?.isFinished || false}
        isCancelled={topic.tournament?.isCancelled || false}
        registrationsLocked={topic.tournament?.registrationsLocked || false}
      >
        <div className="pt-3 lg:pt-4">
          <ForumBreadcrumbs items={breadcrumbs} className="mb-0" />
        </div>

        {/* En-tête du sujet : retour, titre, badge « ARCHIVÉ », nom du forum et, sur téléphone, les outils */}
        <header className="flex items-start gap-3 pt-3 pb-4 lg:pt-5">
          {/* Téléphone : le bouton retour va dans la barre du haut ; ordinateur : il reste à gauche du titre */}
          <MobilePortal targetId="mobile-back-button-slot">
            <span className="lg:hidden">
              <BackButton title="Retour au forum" style={{ width: 44, height: 44 }} />
            </span>
          </MobilePortal>
          <span className="hidden shrink-0 lg:inline-flex">
            <BackButton title="Retour au forum" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="m-0 border-0 p-0 text-2xl leading-tight font-bold tracking-normal break-words text-bb-text normal-case not-italic">
              <span dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.title) }} />
              {topic.isArchived && (
                <Badge variant="neutral" className="ml-2 align-middle">
                  ARCHIVÉ
                </Badge>
              )}
            </h1>
            <p className="m-0 mt-1 text-sm">
              <Link
                href={`/forum/${topic.forumId}`}
                className="font-semibold text-bb-accent-text hover:underline max-lg:inline-flex max-lg:min-h-11 max-lg:items-center"
                dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.forum.name) }}
              />
            </p>
          </div>
          <TopicToolsButton />
        </header>

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_288px] lg:items-start lg:gap-6">
          <div className="flex min-w-0 flex-col gap-4">
            {/* Blocs du tournoi : résumé, résultats quand il est terminé, inscriptions (refaits à la carte 089) */}
            {topic.tournament && (
              <section aria-label="Tournoi" className="flex min-w-0 flex-col gap-3">
                <TournamentSummary tournament={topic.tournament} />

                {topic.tournament.isFinished && (
                  <TournamentResultWidget
                    tournamentId={topic.tournament.id}
                    results={topic.tournament.results}
                    rounds={topic.tournament.rounds}
                    canEdit={!!canEditTournament}
                  />
                )}

                <RegistrationModule
                  tournament={topic.tournament}
                  currentUser={session?.user}
                  isOrganizer={!!isTournamentOrganizer}
                  isCommissioner={!!isTournamentCommissaire}
                />
              </section>
            )}

            {/* Ordinateur : pagination en haut de la liste (sur téléphone, elle est dans la barre du bas) */}
            <div className="hidden justify-end lg:flex">
              <TopicPageNav />
            </div>

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
                roleLabels={roleLabels}
                isFirstPostAlwaysVisible={true}
                isBlocked={blockedUserIds.includes(firstPostForTournament.authorId)}
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
                roleLabels={roleLabels}
                isTournament={!!topic.tournament}
                tournamentId={topic.tournament?.id}
                firstPostId={topic.posts[0]?.id}
                isBlocked={blockedUserIds.includes(post.authorId)}
              />
            ))}

            {/* Pagination en bas de la liste, aussi sur téléphone : la barre du bas s'efface près de la réponse */}
            <div className="flex justify-center">
              <TopicPageNav />
            </div>

            {canReply ? (
              <QuickReply topicId={id} />
            ) : !currentUserId ? null : (
              <Card id="quick-reply-area" className="flex scroll-mt-20 flex-col items-center gap-2 px-4 py-8 text-center">
                <LockIcon size={32} aria-hidden="true" className="text-bb-danger-text" />
                <h2 className="m-0 border-0 p-0 text-lg font-bold text-bb-danger-text normal-case not-italic">Sujet verrouillé</h2>
                <p className="m-0 max-w-[50ch] text-sm text-bb-text-muted">
                  Vous ne pouvez plus répondre à ce sujet car il a été verrouillé par la modération.
                </p>
              </Card>
            )}
          </div>

          <TopicToolsAside />
        </div>

        <TopicReplyBar />
      </TopicToolsProvider>
    </div>
  );
}
