import { prisma } from "@/lib/prisma";
import { ArrowLeft, MessageSquare, User } from "lucide-react";
import ForumSidebar from "@/components/forum/ForumSidebar";
import "../../forum.css";
import Link from "next/link";
import { notFound } from "next/navigation";


export const dynamic = "force-dynamic";

import MarkAsRead from "@/components/forum/MarkAsRead";

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
          author: true
        }
      }
    }
  });

  if (!topic) notFound();

  return (
    <main className="container forum-container" style={{ paddingBottom: '5rem' }}>
      <MarkAsRead topicId={id} />
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href={`/forum/${topic.forumId}`} className="back-button" title="Retour au forum" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: 'var(--secondary)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700 }}>
            {topic.forum.name}
          </span>
          <h1 style={{ margin: '0.5rem 0' }}>{topic.title}</h1>
        </div>
      </header>
 
       <div className="forum-layout">
         <div className="forum-main-content">

      <div className="posts-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {topic.posts.map((post, index) => (
          <div key={post.id} className="premium-card" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: '200px', padding: 0, overflow: 'hidden' }}>
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
                <span>Posté le {new Date(post.createdAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span>#{index + 1}</span>
              </div>
              <div style={{ color: '#ddd', lineHeight: '1.6', fontSize: '1.1rem', flex: 1 }}>
                {post.content}
              </div>
              <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button className="reset-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Citer</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-reply" style={{ marginTop: '3rem' }}>
        <div className="premium-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <MessageSquare size={20} className="text-secondary" />
            Réponse rapide
          </h3>
          <textarea
            placeholder="Écrivez votre message ici..."
            style={{
              width: '100%',
              minHeight: '150px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '1rem',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              marginBottom: '1.5rem'
            }}
          />
          <button className="reset-btn" style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '100%' }}>
            Envoyer ma réponse
          </button>
        </div>
      </div>
      </div>
      <ForumSidebar 
        forumId={topic.forumId} 
        forumName={topic.forum.name} 
        categoryId={topic.forum.categoryId || topic.forum.parentForum?.categoryId || undefined} 
        parentForumId={topic.forumId} 
      />
    </div>
  </main>
  );
}
