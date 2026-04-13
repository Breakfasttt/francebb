import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Bell, Pin, Folder, FileText, ChevronLeft, ChevronRight, Trophy, Lock as LockIcon } from "lucide-react";
import ForumSidebar from "@/app/forum/component/ForumSidebar";
import Link from "next/link";
import BackButton from "@/common/components/BackButton/BackButton";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { parseInlineBBCode } from "@/lib/bbcode";
import ForumBreadcrumbs from "@/app/forum/component/ForumBreadcrumbs";
import { notFound } from "next/navigation";
import "../page.css";

export const dynamic = "force-dynamic";

const TOPICS_PER_PAGE = 30;
const MAX_SUBFORUMS = 10;

export default async function ForumDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ page?: string }> }) {
  const session = await auth();
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
        where: !userId ? { allowedRoles: "ALL" } : {},
        orderBy: { order: "asc" },
        take: MAX_SUBFORUMS,
        include: {
          _count: { select: { topics: true } },
          topics: {
            orderBy: { updatedAt: "desc" },
            take: 1,
            include: {
              author: true,
              topicViews: {
                where: { userId: userId || "" }
              },
              tournament: true
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

  // Sécurité : Accès restreint si non "ALL" pour les invités
  if (!userId && forum.allowedRoles !== "ALL") {
    redirect("/auth/login?callback=/forum/" + id);
  }

  // Count total topics for pagination
  const totalTopics = await prisma.topic.count({ where: { forumId: id } });
  const totalPages = Math.max(1, Math.ceil(totalTopics / TOPICS_PER_PAGE));

  // Fetch paginated topics
  const topics = await prisma.topic.findMany({
    where: { 
      forumId: id,
      isArchived: false
    },
    orderBy: [
      { isSticky: "desc" },
      { updatedAt: "desc" }
    ],
    skip,
    take: TOPICS_PER_PAGE,
    include: {
      author: true,
      _count: {
        select: { posts: true }
      },
      topicViews: {
        where: { userId: userId || "" }
      },
      tournament: true
    }
  });

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

  return (
    <main className="container forum-container">
      <PageHeader
        title={
          <span style={{ color: forumHasNew ? 'var(--unread-marker)' : 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span dangerouslySetInnerHTML={{ __html: parseInlineBBCode(forum.name) }} />
            {forum.isLocked && <LockIcon size={20} style={{ color: 'var(--primary)', opacity: 0.8 }} />}
            {forumHasNew && <Bell size={20} fill="var(--unread-marker)" color="var(--unread-marker)" className="animate-pulse-subtle" />}
          </span>
        }
        subtitle={forum.description}
        backHref="/forum"
        backTitle="Retour au forum"
      />
 
      <ForumBreadcrumbs items={breadcrumbs} />

       <div className="forum-layout">
         <div className="forum-main-content">

      {forum.subForums.length > 0 && (
        <div className="sub-forums-section" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Sous-forums</h2>
          <div className="forums-list" style={{ borderTop: '1px solid var(--glass-border)', borderRadius: '12px' }}>
            {forum.subForums.map((sub) => {
              const lastTopic = sub.topics[0];
              const subHasNew = userId ? sub.topics.some(topic => {
                const view = topic.topicViews[0];
                return !view || topic.updatedAt > view.lastViewedAt;
              }) : false;

              return (
                <Link key={sub.id} href={`/forum/${sub.id}`} className={`forum-item ${subHasNew ? 'has-new' : ''}`}>
                  <div className="forum-info">
                    <h3 style={{ color: subHasNew ? 'var(--unread-marker)' : 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {sub.isTournamentForum ? (
                        <Trophy size={16} style={{ color: subHasNew ? 'var(--accent)' : 'var(--foreground)', opacity: subHasNew ? 1 : 0.6 }} />
                      ) : (
                        <Folder size={16} style={{ color: subHasNew ? 'var(--unread-marker)' : 'var(--text-secondary)' }} />
                      )}
                      {sub.name}
                      {sub.isLocked && <LockIcon size={12} style={{ color: 'var(--primary)', opacity: 0.8 }} />}
                      {subHasNew && <Bell size={12} fill="var(--unread-marker)" color="var(--unread-marker)" className="animate-pulse-subtle" />}
                    </h3>
                    {sub.description && <p>{sub.description}</p>}
                  </div>

                  <div className="forum-stats">
                    <div><span className="stat-val">{sub._count.topics}</span> sujets</div>
                  </div>

                  <div className="forum-last-post">
                    {lastTopic ? (
                      <>
                        <span className="last-post-title" style={{ color: subHasNew ? 'var(--unread-marker)' : 'var(--foreground)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          {lastTopic.title}
                          {lastTopic.tournament && (
                            <span className={`status-badge-inline ${lastTopic.tournament.isCancelled ? 'cancelled' : lastTopic.tournament.isFinished ? 'finished' : (new Date(lastTopic.tournament.date) < new Date() ? 'past' : '')}`}>
                              {lastTopic.tournament.isCancelled ? 'Annulé' : lastTopic.tournament.isFinished ? 'Terminé' : (new Date(lastTopic.tournament.date) < new Date() ? 'Passé' : '')}
                            </span>
                          )}
                        </span>
                        <span className="last-post-meta">
                          Par <strong>{lastTopic.author.name}</strong>
                          <br />
                          {new Date(lastTopic.updatedAt).toLocaleDateString("fr-FR")}
                        </span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Aucun sujet</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="forums-list" style={{ borderTop: '1px solid var(--glass-border)', borderRadius: '12px' }}>
        <div className="forum-item-header" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 120px 200px',
          padding: '1rem 1.5rem',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid var(--glass-border)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          <span>Sujet</span>
          <span>Messages</span>
          <span style={{ paddingLeft: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>Dernier message</span>
        </div>

        {topics.length > 0 ? topics.map((topic) => {
          const topicView = topic.topicViews[0];
          const topicHasNew = userId ? (!topicView || topic.updatedAt > topicView.lastViewedAt) : false;

          return (
            <Link key={topic.id} href={`/forum/topic/${topic.id}`} className={`forum-item ${topicHasNew ? 'has-new' : ''}`}>
              <div className="forum-info">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: topicHasNew ? 'var(--unread-marker)' : 'var(--foreground)' }}>
                  {topic.isSticky ? (
                    <Pin size={16} className="text-secondary" style={{ transform: 'rotate(45deg)' }} />
                  ) : topic.tournamentId ? (
                    <Trophy size={16} style={{ color: topicHasNew ? 'var(--accent)' : 'var(--foreground)', opacity: topicHasNew ? 1 : 0.6 }} />
                  ) : (
                    <FileText size={16} style={{ color: topicHasNew ? 'var(--unread-marker)' : 'var(--text-secondary)' }} />
                  )}
                  <span dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.title) }} />
                  
                  {topic.tournament && (
                    <>
                      {topic.tournament.isCancelled ? (
                        <span className="status-badge-inline cancelled">Annulé</span>
                      ) : topic.tournament.isFinished ? (
                        <span className="status-badge-inline finished">Terminé</span>
                      ) : new Date(topic.tournament.date) < new Date() ? (
                        <span className="status-badge-inline past">Passé</span>
                      ) : null}
                    </>
                  )}

                  {topic.isLocked && <LockIcon size={12} style={{ color: 'var(--primary)', opacity: 0.8 }} />}
                  {topicHasNew && <Bell size={12} fill="var(--unread-marker)" color="var(--unread-marker)" className="animate-pulse-subtle" />}
                </h3>
                <p>Par {topic.author.name} le {new Date(topic.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>

              <div className="forum-stats">
                <div><span className="stat-val">{topic._count.posts}</span> msgs</div>
                <div><span className="stat-val">{(topic.views || 0).toLocaleString("fr-FR")}</span> vues</div>
              </div>

              <div className="forum-last-post">
                <span className="last-post-meta">
                  Dernière act.
                  <br />
                  {new Date(topic.updatedAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </Link>
          );
        }) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Aucun sujet dans ce forum pour le moment.
          </div>
        )}
      </div>

     </div>
      <ForumSidebar 
        forumId={id} 
        forumName={forum.name} 
        categoryId={forum.categoryId || forum.parentForum?.categoryId || undefined} 
        parentForumId={id} 
        isLocked={forum.isLocked}
        isTournamentForum={forum.isTournamentForum}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  </main>
  );
}
