import { prisma } from "@/lib/prisma";
import { ArrowLeft, User } from "lucide-react";
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
            moderator: true
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
          <h1 style={{ margin: '0.5rem 0' }} dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.title) }} />
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
              gap: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ position: 'relative' }}>
                {post.author.image ? (
                  <img src={post.author.image} alt="" style={{ width: '80px', height: '80px', borderRadius: '12px', border: '2px solid var(--glass-border)' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={40} color="#888" />
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  bottom: '-5px',
                  right: '-5px',
                  background: 'var(--primary)',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid #1a1a20'
                }}></div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem' }}>{post.author.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', marginTop: '0.2rem', fontWeight: 600 }}>
                  {post.author.role}
                </div>
              </div>
            </div>

            {/* Contenu Message */}
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
      />
    </div>
  </main>
  );
}
