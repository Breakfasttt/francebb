import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MessageSquare, ChevronRight, Hash, MessageCircle, ArrowLeft } from "lucide-react";
import "./forum.css";

export const dynamic = "force-dynamic";

export default async function ForumPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      forums: {
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: { topics: true }
          },
          topics: {
            orderBy: { updatedAt: "desc" },
            take: 1,
            include: {
              author: true,
              _count: {
                select: { posts: true }
              }
            }
          }
        }
      }
    }
  });

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));

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

      {categories.map((category) => (
        <section key={category.id} className="forum-category">
          <div className="category-header">
            <Hash size={20} />
            <h2>{category.name}</h2>
          </div>
          <div className="forums-list">
            {category.forums.map((forum) => {
              const lastTopic = forum.topics[0];
              const hasNew = lastTopic && new Date(lastTopic.updatedAt) > twoDaysAgo;
              
              return (
                <Link key={forum.id} href={`/forum/${forum.id}`} className={`forum-item ${hasNew ? 'has-new' : ''}`}>
                  <div className="forum-info">
                    <h3>{forum.name}</h3>
                    {forum.description && <p>{forum.description}</p>}
                  </div>
                  
                  <div className="forum-stats">
                    <div><span className="stat-val">{forum._count.topics}</span> sujets</div>
                  </div>

                  <div className="forum-last-post">
                    {lastTopic ? (
                      <>
                        <span className="last-post-title">{lastTopic.title}</span>
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
      ))}
    </main>
  );
}
