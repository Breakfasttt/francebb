import { prisma } from "@/lib/prisma";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import MarkAsRead from "@/components/forum/MarkAsRead";
import { parseBBCode, parseInlineBBCode } from "@/lib/bbcode";
import TopicSidebar from "@/components/forum/TopicSidebar";
import PostActions from "@/components/forum/PostActions";
import QuickReply from "@/components/forum/QuickReply";
import "../../forum.css";

export const dynamic = "force-dynamic";

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id;
  const isUserModerator = isModerator(session?.user?.role);

  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      forum: {
        include: { 
          parentForum: {
            include: { category: true }
          }
        }
      },
      author: true,
      posts: {
        orderBy: { createdAt: "asc" },
        include: {
          author: true,
          moderator: true
        }
      }
    }
  });

  if (!topic) notFound();

  return (
    <main className="container forum-container">
      <MarkAsRead topicId={id} />
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href={`/forum/${topic.forumId}`} className="back-button" title="Retour au forum" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: 'var(--secondary)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.forum.name) }} />
          <h1 style={{ margin: '0.5rem 0' }} dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.title) }} />
        </div>
      </header>
 
       <div className="forum-layout">
         <div className="forum-main-content">

      <div className="posts-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {topic.posts.map((post, index) => (
          <div key={post.id} id={`post-${post.id}`} className="premium-card" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: '200px', padding: 0, overflow: 'hidden' }}>
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
                <span>#{index + 1}</span>
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
                        dangerouslySetInnerHTML={{ __html: parseBBCode(post.content) }}
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
      <TopicSidebar topicId={id} />
    </div>
  </main>
  );
}
