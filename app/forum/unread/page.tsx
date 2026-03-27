import { MessageSquare, Clock, CheckCircle2, Inbox, Trophy } from "lucide-react";
import Link from "next/link";
import Pagination from "@/common/components/Pagination/Pagination";
import toast from "react-hot-toast";
import BackButton from "@/common/components/BackButton/BackButton";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { parseInlineBBCode } from "@/lib/bbcode";
import { getUnreadTopics } from "../actions";
import UnreadSidebar from "./component/UnreadSidebar";
import MarkAllAsReadButton from "../component/MarkAllAsReadButton";
import MarkTopicReadButton from "./component/MarkTopicReadButton";
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
      <PageHeader
        title={<>Messages <span>non lus</span></>}
        subtitle="Liste des sujets ayant de nouvelles activités depuis votre dernière visite"
        backHref="/forum"
        backTitle="Retour au forum"
      />

      <div className="forum-layout" style={totalPages > 1 ? {} : { gridTemplateColumns: '1fr' }}>
        <div className="forum-main-content">
          <div className="forums-list" style={{ borderTop: '1px solid var(--glass-border)', borderRadius: '12px', background: 'var(--card-bg)', backdropFilter: 'blur(10px)' }}>
            <div className="forum-item-header" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 80px 120px 200px',
              padding: '1rem 1.5rem',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid var(--glass-border)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              alignItems: 'center'
            }}>
              <span>Sujet</span>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                 <MarkAllAsReadButton />
              </div>
              <span style={{ textAlign: 'center' }}>Messages</span>
              <span style={{ paddingLeft: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>Dernier message</span>
            </div>

            {unreadTopics.length > 0 ? unreadTopics.map((topic) => (
              <div key={topic.id} className="forum-item has-new" style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 80px 120px 200px',
                padding: '1.2rem 1.5rem',
                borderBottom: '1px solid var(--glass-border)',
                alignItems: 'center'
              }}>
                <Link href={`/forum/topic/${topic.id}`} className="forum-info" style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {topic.tournamentId && <Trophy size={16} color="var(--accent)" />}
                    <h3 style={{ color: 'var(--unread-marker)', margin: 0 }} dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.title) }} />
                  </div>
                  <p style={{ margin: '0.3rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Dans <strong dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.forum.name) }} /> • Par {topic.author.name}</p>
                </Link>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <MarkTopicReadButton topicId={topic.id} />
                </div>

                <div className="forum-stats" style={{ textAlign: 'center', display: 'block' }}>
                  <div><span className="stat-val">{topic._count.posts}</span> msgs</div>
                </div>

                <div className="forum-last-post" style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '1.5rem' }}>
                  <span className="last-post-meta">
                    <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {new Date(topic.updatedAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )) : (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <MessageSquare size={48} color="var(--text-muted)" style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Aucun nouveau message</h2>
                <p style={{ color: 'var(--text-muted)' }}>Vous êtes à jour ! Tous les sujets ont été lus.</p>
                <Link href="/forum" className="widget-button" style={{ display: 'inline-flex', width: 'auto', marginTop: '2rem', padding: '0.8rem 2rem' }}>
                  Retour à l'index du forum
                </Link>
              </div>
            )}
          </div>
        </div>
        {totalPages > 1 && <UnreadSidebar currentPage={currentPage} totalPages={totalPages} />}
      </div>
    </main>
  );
}
