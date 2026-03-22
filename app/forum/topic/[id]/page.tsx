import { prisma } from "@/lib/prisma";
import { ArrowLeft, User, MessageSquare, MapPin, Shield, Trophy, ExternalLink, Mail } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import MarkAsRead from "@/components/forum/MarkAsRead";
import { parseBBCode, parseInlineBBCode } from "@/lib/bbcode";
import TopicSidebar from "@/components/forum/TopicSidebar";
import PostActions from "@/components/forum/PostActions";
import QuickReply from "@/components/forum/QuickReply";
import { getQuoteStatusMap } from "@/app/forum/actions";
import MarkUnreadAction from "@/components/forum/MarkUnreadAction";
import ForumBreadcrumbs from "@/components/forum/ForumBreadcrumbs";
import SharePostButton from "@/components/forum/SharePostButton";
import PostReactions from "@/components/forum/PostReactions";
import "../../forum.css";

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

  const displayViews = topic.views || 0;

  const totalPages = Math.max(1, Math.ceil(totalPostCount / POSTS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

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
        {topic.posts.map((post, index) => (
          <div key={post.id} id={`post-${post.id}`} className="premium-card forum-post-card" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: '200px', padding: 0, overflow: 'hidden' }}>
            {/* Sidebar Auteur */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRight: '1px solid var(--glass-border)',
              padding: '2rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.2rem',
              textAlign: 'center'
            }}>
              <div style={{ position: 'relative' }}>
                {post.author.image ? (
                  <img src={post.author.image} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--glass-border)', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={40} color="#888" />
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  background: 'var(--primary)',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid #1a1a20'
                }}></div>
              </div>
              
              <div style={{ width: '100%' }}>
                <div style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem', wordBreak: 'break-word' }}>{post.author.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', marginTop: '0.2rem', fontWeight: 600 }}>
                  {post.author.role || 'COACH'}
                </div>

                {(post.author.nafNumber || post.author.region || post.author.league) && (
                  <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {post.author.nafNumber && (
                      <div style={{ fontSize: '0.7rem', color: '#999', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                        <Trophy size={12} color="#eab308" /> <span style={{ color: '#eee', fontWeight: 600 }}>{post.author.nafNumber}</span>
                      </div>
                    )}
                    {post.author.region && (
                      <div style={{ fontSize: '0.7rem', color: '#999', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                        <MapPin size={12} color="#3b82f6" /> {regionLabels[post.author.region] || post.author.region}
                      </div>
                    )}
                    {post.author.league && (
                      <div style={{ fontSize: '0.7rem', color: '#999', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                        <Shield size={12} color="#22c55e" /> {post.author.league}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1.2rem', justifyContent: 'center' }}>
                  <Link 
                    href={`/profile?id=${post.author.id}`}
                    style={{ 
                      padding: '0.35rem 0.6rem', 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      border: '1px solid rgba(59, 130, 246, 0.2)', 
                      borderRadius: '4px', 
                      color: '#60a5fa', 
                      fontSize: '0.65rem', 
                      textDecoration: 'none',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <User size={10} /> PROFIL
                  </Link>
                  <Link 
                    href={`/profile?tab=pm&recipientId=${post.author.id}`}
                    style={{ 
                      padding: '0.35rem 0.6rem', 
                      background: 'rgba(34, 197, 94, 0.1)', 
                      border: '1px solid rgba(34, 197, 94, 0.2)', 
                      borderRadius: '4px', 
                      color: '#4ade80', 
                      fontSize: '0.65rem', 
                      textDecoration: 'none',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Mail size={10} /> MP
                  </Link>
                </div>
              </div>
            </div>
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#666' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span>Posté le {new Date(post.createdAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  {post.updatedAt.getTime() > post.createdAt.getTime() + 1000 && (
                    <span style={{ color: '#555' }}>• modifié le : {new Date(post.updatedAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>#{skip + index + 1}</span>
                    {currentUserId && <MarkUnreadAction topicId={id} postId={post.id} />}
                    <SharePostButton postId={post.id} topicId={id} page={safeCurrentPage} />
                  </div>
              </div>

              {/* Message Content - Visibility & Deletion Logic */}
              {post.isDeleted ? (
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '12px', 
                  padding: '2rem', 
                  marginBottom: '1rem',
                  color: '#888',
                  fontSize: '1rem',
                  fontStyle: 'italic',
                  textAlign: 'center'
                }}>
                  Ce message a était supprimé par son auteur
                </div>
              ) : (
                <>
                  {/* Moderation Notice */}
                  {post.isModerated && (
                    <div style={{ 
                      background: 'rgba(194, 29, 29, 0.1)', 
                      border: '1px solid rgba(194, 29, 29, 0.3)', 
                      borderRadius: '8px', 
                      padding: '1rem', 
                      marginBottom: '1.5rem',
                      color: '#ff8888',
                      fontSize: '0.95rem',
                      fontStyle: 'italic'
                    }}>
                      Ce message a été modéré par {post.moderator?.name || "un modérateur"}, raison : {post.moderationReason}
                    </div>
                  )}

                  {/* Message Content - Visibility Logic */}
                  {(!post.isModerated || isUserModerator || currentUserId === post.authorId) ? (
                    <div style={{ position: 'relative' }}>
                      {post.isModerated && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 700 }}>
                          [Contenu original visible par vous seul et les modérateurs]
                        </div>
                      )}
                      <div 
                        style={{ 
                          color: post.isModerated ? '#888' : '#ddd', 
                          lineHeight: '1.6', 
                          fontSize: '1.1rem', 
                          flex: 1, 
                          wordBreak: 'break-word',
                          opacity: post.isModerated ? 0.6 : 1
                        }}
                        dangerouslySetInnerHTML={{ __html: parseBBCode(post.content, quoteStatusMap) }}
                      />

                      {post.author.signature && (
                        <div style={{ 
                          marginTop: '2.5rem', 
                          paddingTop: '1rem', 
                          borderTop: '1px solid rgba(255,255,255,0.05)', 
                          fontSize: '0.85rem', 
                          color: '#777',
                          fontStyle: 'italic',
                          maxWidth: '100%',
                          overflow: 'hidden'
                        }} dangerouslySetInnerHTML={{ __html: parseBBCode(post.author.signature) }} />
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#666', fontStyle: 'italic', padding: '1rem 0' }}>
                      Le contenu de ce message a été masqué par la modération.
                    </div>
                  )}
                  
                  <PostActions 
                    postId={post.id}
                    authorId={post.authorId}
                    authorName={post.author.name || ""}
                    content={post.content}
                    initialReactions={post.reactions}
                    currentUserId={currentUserId}
                    isModerator={isUserModerator}
                    topicId={id}
                    isModerated={post.isModerated}
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <QuickReply topicId={id} />
      </div>
      <TopicSidebar 
        topicId={id} 
        currentPage={safeCurrentPage} 
        totalPages={totalPages}
        isModerator={isUserModerator}
        isPinned={topic.isSticky}
        lastPostId={lastPost?.id || ""}
        lastPage={totalPages}
        allForums={allForums}
        topicTitle={topic.title}
        authorId={topic.authorId}
        currentUserId={currentUserId}
        views={displayViews}
        isArchived={topic.isArchived}
      />
    </div>
  </main>
  );
}
