import { ArrowLeft, Clock, MessageSquare } from "lucide-react";
import Link from "next/link";
import { parseInlineBBCode } from "@/lib/bbcode";
import { getUnreadTopics } from "../actions";
import UnreadSidebar from "./component/UnreadSidebar";
import "../page.css";

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 20;

export default async function UnreadPostsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr || "1", 10));
  const { topics: unreadTopics, total } = await getUnreadTopics(currentPage, POSTS_PER_PAGE);
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <main className="container forum-container">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href="/forum" className="back-button" title="Retour au forum" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>Messages <span>non lus</span></h1>
          <p style={{ color: '#aaa', margin: '0.5rem 0 0' }}>Liste des sujets ayant de nouvelles activités depuis votre dernière visite</p>
        </div>
      </header>
 
       <div className="forum-layout">
         <div className="forum-main-content">


      <div className="forums-list" style={{ borderTop: '1px solid var(--glass-border)', borderRadius: '12px', background: 'rgba(26, 26, 32, 0.4)', backdropFilter: 'blur(10px)' }}>
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

        {unreadTopics.length > 0 ? unreadTopics.map((topic) => (
          <Link key={topic.id} href={`/forum/topic/${topic.id}`} className="forum-item has-new">
            <div className="forum-info">
              <h3 style={{ color: '#ffd700' }} dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.title) }} />
              <p>Dans <strong dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.forum.name) }} /> • Par {topic.author.name}</p>
            </div>

            <div className="forum-stats">
              <div><span className="stat-val">{topic._count.posts}</span> msgs</div>
            </div>

            <div className="forum-last-post">
              <span className="last-post-meta">
                <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {new Date(topic.updatedAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </Link>
        )) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <MessageSquare size={48} color="#444" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ color: '#888', marginBottom: '0.5rem' }}>Aucun nouveau message</h2>
            <p style={{ color: '#555' }}>Vous êtes à jour ! Tous les sujets ont été lus.</p>
            <Link href="/forum" className="widget-button" style={{ display: 'inline-flex', width: 'auto', marginTop: '2rem', padding: '0.8rem 2rem' }}>
              Retour à l'index du forum
            </Link>
          </div>
        )}
      </div>
       </div>
       <UnreadSidebar currentPage={currentPage} totalPages={totalPages} />
     </div>
   </main>
  );
}
