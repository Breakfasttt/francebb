import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Pin } from "lucide-react";
import "../forum.css";

export const dynamic = "force-dynamic";

export default async function ForumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const forum = await prisma.forum.findUnique({
    where: { id },
    include: {
      category: true,
      topics: {
        orderBy: [
          { isSticky: "desc" },
          { updatedAt: "desc" }
        ],
        include: {
          author: true,
          _count: {
            select: { posts: true }
          }
        }
      }
    }
  });

  if (!forum) notFound();

  return (
    <main className="container forum-container">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href="/forum" className="back-button" title="Retour au forum" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>{forum.name}</h1>
          <p style={{ color: '#aaa', margin: '0.5rem 0 0' }}>{forum.description}</p>
        </div>
      </header>

      <div className="forum-actions" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="reset-btn" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
           Nouveau Sujet
        </button>
      </div>

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

        {forum.topics.length > 0 ? forum.topics.map((topic) => (
          <Link key={topic.id} href={`/forum/topic/${topic.id}`} className="forum-item">
            <div className="forum-info">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {topic.isSticky && <Pin size={16} className="text-secondary" style={{ transform: 'rotate(45deg)' }} />}
                {topic.title}
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
        )) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
            Aucun sujet dans ce forum pour le moment.
          </div>
        )}
      </div>
    </main>
  );
}
