import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Bell, Pin } from "lucide-react";
import ForumSidebar from "@/components/forum/ForumSidebar";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../forum.css";

export const dynamic = "force-dynamic";

export default async function ForumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  const { id } = await params;

  const forum = await prisma.forum.findUnique({
    where: { id },
    include: {
      category: true,
      subForums: {
        orderBy: { order: "asc" },
        include: {
          _count: { select: { topics: true } },
          topics: {
            orderBy: { updatedAt: "desc" },
            take: 1,
            include: {
              author: true,
              topicViews: {
                where: { userId: userId || "" }
              }
            }
          }
        }
      },
      parentForum: {
        include: { category: true }
      },
      topics: {
        orderBy: [
          { isSticky: "desc" },
          { updatedAt: "desc" }
        ],
        include: {
          author: true,
          _count: {
            select: { posts: true }
          },
          topicViews: {
            where: { userId: userId || "" }
          }
        }
      }
    }
  });

  if (!forum) notFound();

  const forumHasNew = forum.topics.some(topic => {
    const view = topic.topicViews[0];
    return !view || topic.updatedAt > view.lastViewedAt;
  });

  return (
    <main className="container forum-container" style={{ paddingBottom: '5rem' }}>
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href="/forum" className="back-button" title="Retour au forum" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, color: forumHasNew ? '#ffd700' : 'white', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center' }}>
            {forum.name}
            {forumHasNew && <Bell size={20} fill="#ffd700" color="#ffd700" className="animate-pulse-subtle" />}
          </h1>
          <p style={{ color: '#aaa', margin: '0.5rem 0 0' }}>{forum.description}</p>
        </div>
      </header>
 
       <div className="forum-layout">
         <div className="forum-main-content">

      <div className="forum-actions" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="reset-btn" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
          Nouveau Sujet
        </button>
      </div>

      {forum.subForums.length > 0 && (
        <div className="sub-forums-section" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Sous-forums</h2>
          <div className="forums-list" style={{ borderTop: '1px solid var(--glass-border)', borderRadius: '12px' }}>
            {forum.subForums.map((sub) => {
              const lastTopic = sub.topics[0];
              const subHasNew = sub.topics.some(topic => {
                const view = topic.topicViews[0];
                return !view || topic.updatedAt > view.lastViewedAt;
              });

              return (
                <Link key={sub.id} href={`/forum/${sub.id}`} className={`forum-item ${subHasNew ? 'has-new' : ''}`}>
                  <div className="forum-info">
                    <h3 style={{ color: subHasNew ? '#ffd700' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {sub.name}
                      {subHasNew && <Bell size={12} fill="#ffd700" color="#ffd700" className="animate-pulse-subtle" />}
                    </h3>
                    {sub.description && <p>{sub.description}</p>}
                  </div>

                  <div className="forum-stats">
                    <div><span className="stat-val">{sub._count.topics}</span> sujets</div>
                  </div>

                  <div className="forum-last-post">
                    {lastTopic ? (
                      <>
                        <span className="last-post-title" style={{ color: subHasNew ? '#ffd700' : 'white' }}>{lastTopic.title}</span>
                        <span className="last-post-meta">
                          Par <strong>{lastTopic.author.name}</strong>
                          <br />
                          {new Date(lastTopic.updatedAt).toLocaleDateString("fr-FR")}
                        </span>
                      </>
                    ) : (
                      <span style={{ color: '#444' }}>Aucun sujet</span>
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
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          <span>Sujet</span>
          <span>Messages</span>
          <span style={{ paddingLeft: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>Dernier message</span>
        </div>

        {forum.topics.length > 0 ? forum.topics.map((topic) => {
          const topicView = topic.topicViews[0];
          const topicHasNew = !topicView || topic.updatedAt > topicView.lastViewedAt;

          return (
            <Link key={topic.id} href={`/forum/topic/${topic.id}`} className={`forum-item ${topicHasNew ? 'has-new' : ''}`}>
              <div className="forum-info">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: topicHasNew ? '#ffd700' : 'white' }}>
                  {topic.isSticky && <Pin size={16} className="text-secondary" style={{ transform: 'rotate(45deg)' }} />}
                  {topic.title}
                  {topicHasNew && <Bell size={12} fill="#ffd700" color="#ffd700" className="animate-pulse-subtle" />}
                </h3>
                <p>Par {topic.author.name} le {new Date(topic.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>

              <div className="forum-stats">
                <div><span className="stat-val">{topic._count.posts}</span> msgs</div>
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
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
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
     />
   </div>
 </main>
  );
}
