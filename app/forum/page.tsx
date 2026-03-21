import { ArrowLeft, Bell, Hash } from "lucide-react";
import ForumSidebar from "@/components/forum/ForumSidebar";
import "./forum.css";

export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ForumPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      forums: {
        where: { parentForumId: null },
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: { topics: true }
          },
          topics: {
            orderBy: { updatedAt: "desc" },
            include: {
              author: true,
              _count: {
                select: { posts: true }
              },
              topicViews: {
                where: { userId: userId || "" }
              }
            }
          },
          subForums: {
            include: {
              topics: {
                include: {
                  topicViews: {
                    where: { userId: userId || "" }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  return (
    <main className="container forum-container">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href="/" className="back-button" title="Retour à l'accueil" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', margin: 0 }}>Le Forum France <span>Blood Bowl</span></h1>
          <p style={{ color: '#888', margin: 0 }}>L'espace de discussion de la communauté Blood Bowl française</p>
        </div>
      </header>

      <div className="forum-layout">
        <div className="forum-main-content">
          {categories.map((category) => {
        // Check if category has any unread topics (including sub-forums)
        const categoryHasNew = category.forums.some(forum => {
          const directUnread = forum.topics.some(topic => {
            const view = topic.topicViews[0];
            return !view || topic.updatedAt > view.lastViewedAt;
          });
          const subUnread = forum.subForums.some(sub =>
            sub.topics.some(topic => {
              const view = topic.topicViews[0];
              return !view || topic.updatedAt > view.lastViewedAt;
            })
          );
          return directUnread || subUnread;
        });

        return (
          <section key={category.id} className="forum-category">
            <div className="category-header" style={{ borderColor: categoryHasNew ? '#ffd700' : 'white' }}>
              <Hash size={20} style={{ color: categoryHasNew ? '#ffd700' : 'white' }} />
              <h2 style={{ color: categoryHasNew ? '#ffd700' : 'white', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                {category.name}
              </h2>
            </div>
            <div className="forums-list">
              {category.forums.map((forum) => {
                const lastTopic = forum.topics[0];
                const directUnread = forum.topics.some(topic => {
                  const view = topic.topicViews[0];
                  return !view || topic.updatedAt > view.lastViewedAt;
                });
                const subUnread = forum.subForums.some(sub =>
                  sub.topics.some(topic => {
                    const view = topic.topicViews[0];
                    return !view || topic.updatedAt > view.lastViewedAt;
                  })
                );
                const forumHasNew = directUnread || subUnread;

                return (
                  <Link key={forum.id} href={`/forum/${forum.id}`} className={`forum-item ${forumHasNew ? 'has-new' : ''}`}>
                    <div className="forum-info">
                      <h3 style={{ color: forumHasNew ? '#ffd700' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {forum.name}
                        {forumHasNew && <Bell size={14} fill="#ffd700" color="#ffd700" className="animate-pulse-subtle" />}
                      </h3>
                      {forum.description && <p>{forum.description}</p>}
                    </div>

                    <div className="forum-stats">
                      <div><span className="stat-val">{forum._count.topics}</span> sujets</div>
                    </div>

                    <div className="forum-last-post">
                      {lastTopic ? (
                        <>
                          <span className="last-post-title" style={{ color: forumHasNew ? '#ffd700' : 'white' }}>{lastTopic.title}</span>
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
           </section>
         );
       })}
     </div>
     <ForumSidebar />
   </div>
 </main>
  );
}
