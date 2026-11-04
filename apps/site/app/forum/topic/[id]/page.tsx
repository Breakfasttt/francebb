import { getQuoteStatusMap } from "@/app/forum/actions";
import ForumBreadcrumbs from "@/app/forum/component/ForumBreadcrumbs";
import { TopicVisitorInvite } from "@/app/forum/component/ForumVisitorInvite";
import MarkAsRead from "@/app/forum/component/MarkAsRead";
import PostItem from "@/app/forum/component/PostItem";
import QuickReply from "@/app/forum/component/QuickReply";
import RegistrationModule from "@/app/forum/component/RegistrationModule";
import { DeletedTopicBanner, TopicPageNav, TopicReplyBar, TopicToolsAside, TopicToolsButton, TopicToolsProvider } from "@/app/forum/component/TopicTools";
import TournamentSummary from "@/app/forum/component/TournamentSummary";
import TournamentResultWidget from "@/app/forum/component/TournamentResultWidget";
import { getActiveSession } from "@/lib/authGuard";
import { getForumAccess, canAccessForum, forumAccessWhere } from "@/lib/forumAccess";
import { parseInlineBBCode } from "@/lib/bbcode";
import { prisma } from "@/lib/prisma";
import { effectiveReadPosition } from "@/lib/forumReadPosition";
import { forumPostHrefFor, TOPIC_POSTS_PER_PAGE } from "@/lib/forumPostLink";
import { isTopicClosedFor } from "@/lib/forumWriteRules";
import { isModerator } from "@/lib/roles";
import {
  hidePostContent,
  POST_AUTHOR_SELECT,
  POST_MODERATOR_SELECT,
  PUBLIC_MEMBER_SELECT,
  TOURNAMENT_MERCENARY_PUBLIC_SELECT,
  TOURNAMENT_REGISTRATION_PUBLIC_SELECT,
  TOURNAMENT_TEAM_PUBLIC_SELECT,
  withPaymentStatus
} from "@/lib/forumPostPrivacy";
import { getBlockedUsersIds } from "@/app/profile/actions";
import { Lock as LockIcon } from "lucide-react";
import { Badge, Card } from "@bbfrance/ui";
import Link from "next/link";
import BackButton from "@/common/components/BackButton/BackButton";
import { notFound, redirect } from "next/navigation";
// Styles des blocs BBCode (spoiler, accordéon, galerie) et animation du nouveau message, partagés par le forum

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = TOPIC_POSTS_PER_PAGE;

export default async function TopicPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ page?: string }> }) {
  const { id } = await params;
  const { page: pageStr } = await searchParams;

  const [session, { roles }] = await Promise.all([getActiveSession(), getForumAccess()]);
  const currentUserId = session?.user?.id;

  // Récupérer les blocages de l'utilisateur courant
  const blockedUserIds = await getBlockedUsersIds();

  // Sans numéro de page demandé, le coach est envoyé au premier message qu'il n'a pas lu (carte 166) : celui qui suit sa
  // position de lecture dans ce sujet ou, s'il ne l'a jamais ouvert, sa date « tout est lu avant le… »
  if (!pageStr && currentUserId) {
    const [topicView, reader] = await Promise.all([
      prisma.topicView.findUnique({
        where: { userId_topicId: { userId: currentUserId, topicId: id } },
        select: { lastReadPostAt: true, lastPostId: true }
      }),
      prisma.user.findUnique({ where: { id: currentUserId }, select: { forumReadAllAt: true } })
    ]);
    const position = effectiveReadPosition(
      topicView && { at: topicView.lastReadPostAt, postId: topicView.lastPostId },
      reader?.forumReadAllAt ?? new Date(0)
    );

    const firstUnread = await prisma.post.findFirst({
      where: {
        topicId: id,
        OR: [
          { createdAt: { gt: position.at } },
          {
            createdAt: position.at,
            id: { gt: position.postId || "" }
          }
        ]
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { id: true, createdAt: true }
    });

    if (firstUnread) {
      // Bonne page du sujet pour ce message (lib/forumPostLink.ts)
      redirect(await forumPostHrefFor(id, firstUnread));
    }
  }

  // Le nombre de messages est lu d'abord : le numéro de page demandé est ramené entre 1 et la
  // dernière page AVANT la lecture des messages, sinon une adresse comme « ?page=99 » (lien ancien
  // ou mal recopié) affichait une liste vide sous une pagination pointant sur la dernière page.
  const totalPostCount = await prisma.post.count({ where: { topicId: id } });
  const totalPages = Math.max(1, Math.ceil(totalPostCount / POSTS_PER_PAGE));
  const requestedPage = parseInt(pageStr || '1', 10) || 1;
  const safeCurrentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const skip = (safeCurrentPage - 1) * POSTS_PER_PAGE;

  const isUserModerator = isModerator(session?.user?.role);

  const [topic, lastPost, allForums] = await Promise.all([
    prisma.topic.findUnique({
      where: { id },
      include: {
        // Modérateur qui a supprimé le sujet (carte 165), pour le bandeau « Sujet supprimé »
        deletedBy: { select: { name: true } },
        tournament: {
          include: {
            // Membres du tournoi : seulement l'identifiant, le pseudo et l'avatar (carte 164). Des commissaires,
            // la page ne lit que l'identifiant, pour savoir si le lecteur en fait partie.
            commissaires: { select: { id: true } },
            // Inscriptions, équipes et mercenaires : seulement ce qui est affiché à tous (carte 174). L'état de
            // paiement est lu plus bas, à part, pour l'organisateur, ses commissaires et la modération.
            registrations: { select: TOURNAMENT_REGISTRATION_PUBLIC_SELECT },
            teams: { select: TOURNAMENT_TEAM_PUBLIC_SELECT },
            mercenaries: { select: TOURNAMENT_MERCENARY_PUBLIC_SELECT },
            results: { include: { user: { select: PUBLIC_MEMBER_SELECT } } },
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
        posts: {
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          skip,
          take: POSTS_PER_PAGE,
          include: {
            author: { select: POST_AUTHOR_SELECT },
            moderator: { select: POST_MODERATOR_SELECT },
            reactions: true
          }
        }
      }
    }),
    prisma.post.findFirst({
      where: { topicId: id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { id: true }
    }),
    // Liste des forums : uniquement pour les fenêtres « Déplacer » et « Scinder » (modérateurs)
    isUserModerator
      ? prisma.forum.findMany({
          // Seuls les forums accessibles au rôle du modérateur peuvent recevoir le sujet
          where: forumAccessWhere(roles),
          orderBy: { name: "asc" },
          select: { id: true, name: true, isTournamentForum: true }
        })
      : []
  ]);

  // Un sujet supprimé (carte 165) est introuvable, sauf pour un modérateur, qui le voit avec « Restaurer »
  if (!topic || (topic.isDeleted && !isUserModerator)) notFound();

  // Sécurité : forum du topic (ou sa catégorie / son forum parent) réservé à un rôle supérieur
  if (!canAccessForum(topic.forum, roles)) {
    if (!currentUserId) redirect("/auth/login?callbackUrl=/forum/topic/" + id);
    notFound();
  }

  // Si c'est un tournoi et qu'on n'est pas sur la page 1, on récupère le premier message
  let firstPostForTournament = null;
  if (topic.tournament && safeCurrentPage > 1) {
    firstPostForTournament = await prisma.post.findFirst({
      where: { topicId: id },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      include: {
        author: { select: POST_AUTHOR_SELECT },
        moderator: { select: POST_MODERATOR_SELECT },
        reactions: true
      }
    });
  }

  const displayViews = topic.views || 0;

  const isTournamentOrganizer = topic.tournament?.organizerId === currentUserId;
  const isTournamentCommissaire = topic.tournament?.commissaires.some((c) => c.id === currentUserId);
  const canEditTournament = isUserModerator || isTournamentOrganizer || isTournamentCommissaire;
  // L'état de paiement des inscrits ne regarde que l'organisateur et les commissaires (cartes 174 et 177)
  const canManagePayments = !!(isTournamentOrganizer || isTournamentCommissaire);

  // Ce que reçoit le module d'inscription, qui s'exécute dans le navigateur (carte 174) : les quelques champs du
  // tournoi qu'il lit, et l'état de paiement de chaque inscription seulement pour l'organisateur et les commissaires
  // (même règle que l'action updateRegistrationStatus pour le paiement, carte 177).
  let registrationTournament = null;
  if (topic.tournament) {
    const t = topic.tournament;
    const [registrationPayments, teamPayments] = canManagePayments
      ? await Promise.all([
          prisma.tournamentRegistration.findMany({ where: { tournamentId: t.id }, select: { id: true, paymentStatus: true } }),
          prisma.tournamentTeam.findMany({ where: { tournamentId: t.id }, select: { id: true, paymentStatus: true } })
        ])
      : [[], []];
    registrationTournament = {
      id: t.id,
      date: t.date,
      isTeam: t.isTeam,
      coachsPerTeam: t.coachsPerTeam,
      isFinished: t.isFinished,
      registrationsLocked: t.registrationsLocked,
      registrations: canManagePayments ? withPaymentStatus(t.registrations, registrationPayments) : t.registrations,
      teams: canManagePayments ? withPaymentStatus(t.teams, teamPayments) : t.teams,
      mercenaries: t.mercenaries
    };
  }

  // Le texte d'un message supprimé, ou masqué pour un lecteur qui n'est ni son auteur ni modérateur, est vidé ici,
  // avant d'être confié aux composants : il ne doit pas apparaître dans le code de la page (carte 164)
  const viewer = { id: currentUserId, isModerator: isUserModerator };
  const posts = topic.posts.map(p => hidePostContent(p, viewer));
  const firstPost = firstPostForTournament ? hidePostContent(firstPostForTournament, viewer) : null;

  const postContents = posts.map(p => p.content);
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

  // Peut-il répondre ? Membre, et sujet ni verrouillé ni archivé (carte 169), dans un forum non verrouillé (un
  // modérateur peut toujours répondre). Un sujet supprimé n'accepte aucune réponse, même d'un modérateur : il faut
  // d'abord le restaurer.
  const canReply =
    !!currentUserId &&
    !topic.isDeleted &&
    !isTopicClosedFor({ isLocked: topic.isLocked, isArchived: topic.isArchived, forumIsLocked: topic.forum.isLocked }, isUserModerator);

  return (
    <div className="mx-auto w-full max-w-[1232px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <MarkAsRead topicId={id} shownPostId={posts[posts.length - 1]?.id} />

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
        forumId={topic.forumId}
        topicTitle={topic.title}
        authorId={topic.authorId}
        currentUserId={currentUserId}
        views={displayViews}
        isArchived={topic.isArchived}
        isDeleted={topic.isDeleted}
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
          <BackButton title="Retour au forum" />
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

        {topic.isDeleted && (
          <DeletedTopicBanner
            deletedAt={topic.deletedAt}
            deletedByName={topic.deletedBy?.name ?? null}
            reason={topic.deletionReason}
            byAuthor={topic.deletedById === topic.authorId}
          />
        )}

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
                    cdf={topic.tournament.isCDF ? { validatedAt: topic.tournament.cdfValidatedAt, canValidate: isUserModerator } : undefined}
                  />
                )}

                {registrationTournament && (
                  <RegistrationModule
                    tournament={registrationTournament}
                    currentUser={session?.user}
                    isOrganizer={!!isTournamentOrganizer}
                    isCommissioner={!!isTournamentCommissaire}
                  />
                )}
              </section>
            )}

            {/* Ordinateur : pagination en haut de la liste (sur téléphone, elle est dans la barre du bas) */}
            <div className="hidden justify-end lg:flex">
              <TopicPageNav />
            </div>

            {/* Premier message persistant pour les tournois (si page > 1) */}
            {firstPost && (
              <PostItem
                post={firstPost}
                index={0}
                topicId={id}
                currentUserId={currentUserId}
                isUserModerator={isUserModerator}
                quoteStatusMap={quoteStatusMap}
                safeCurrentPage={safeCurrentPage}
                regionLabels={regionLabels}
                roleLabels={roleLabels}
                isFirstPostAlwaysVisible={true}
                isBlocked={blockedUserIds.includes(firstPost.authorId)}
                canReply={canReply}
                topicHasReplies={totalPostCount > 1}
              />
            )}

            {/* Liste des messages de la page courante */}
            {posts.map((post, index) => (
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
                firstPostId={posts[0]?.id}
                isBlocked={blockedUserIds.includes(post.authorId)}
                canReply={canReply}
                topicHasReplies={totalPostCount > 1}
              />
            ))}

            {/* Pagination en bas de la liste, aussi sur téléphone : la barre du bas s'efface près de la réponse */}
            <div className="flex justify-center">
              <TopicPageNav />
            </div>

            {canReply ? (
              <QuickReply topicId={id} />
            ) : topic.isDeleted ? null : !currentUserId ? (
              // Visiteur non connecté : invitation à se connecter, avec retour sur cette page du sujet (carte 185)
              <TopicVisitorInvite callbackUrl={`/forum/topic/${id}${safeCurrentPage > 1 ? `?page=${safeCurrentPage}` : ""}`} />
            ) : (
              // Pas d'ancre « quick-reply-area » ici : « Citer » et « Répondre » la cherchent pour y écrire une
              // réponse, et la trouver sur cet encart les faisait seulement défiler jusqu'à lui (carte 111)
              <Card className="flex scroll-mt-20 flex-col items-center gap-2 px-4 py-8 text-center">
                <LockIcon size={32} aria-hidden="true" className="text-bb-danger-text" />
                <h2 className="m-0 border-0 p-0 text-lg font-bold text-bb-danger-text normal-case not-italic">
                  {topic.isArchived && !topic.isLocked && !topic.forum.isLocked ? "Sujet archivé" : "Sujet verrouillé"}
                </h2>
                <p className="m-0 max-w-[50ch] text-sm text-bb-text-muted">
                  {topic.isArchived && !topic.isLocked && !topic.forum.isLocked
                    ? "Vous ne pouvez plus répondre ni réagir à ce sujet car il a été archivé par la modération."
                    : "Vous ne pouvez plus répondre à ce sujet car il a été verrouillé par la modération."}
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
