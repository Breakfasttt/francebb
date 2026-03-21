import { getUnreadMessagesCount, getRecentPosts, getRandomPostUrl, getUnreadTopicsCount } from "@/app/forum/actions";
import Link from "next/link";
import { MessageSquare, Mail, Repeat, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { PlusCircle } from "lucide-react";
import DeleteForumButton from "./DeleteForumButton";

export default async function ForumSidebar({ forumId, forumName, categoryId, parentForumId }: { forumId?: string; forumName?: string; categoryId?: string; parentForumId?: string }) {
  const unreadMessages = await getUnreadMessagesCount();
  const recentPosts = await getRecentPosts(3);
  const unreadTopics = await getUnreadTopicsCount();
  const session = await auth();
  const canCreateForum = isModerator(session?.user?.role);

  async function handleRandomPost() {
    "use server";
    const url = await getRandomPostUrl();
    redirect(url);
  }

  return (
    <aside className="forum-sidebar">
      <div className="sidebar-widget-container">
        {/* Messages Privés */}
        {unreadMessages > 0 && (
          <div className="sidebar-widget message-widget animate-pulse-subtle">
            <Link href="/forum/messages" className="widget-link">
              <Mail size={20} className="text-secondary" />
              <span>{unreadMessages} message{unreadMessages > 1 ? 's' : ''} privé{unreadMessages > 1 ? 's' : ''} non lu{unreadMessages > 1 ? 's' : ''}</span>
            </Link>
          </div>
        )}

        {/* Nouveau Sujet */}
        {forumId && (
          <div className="sidebar-widget new-topic-widget">
            <Link href={`/forum/new-topic?forumId=${forumId}`} className="widget-button" style={{ background: 'var(--primary)' }}>
              <PlusCircle size={18} />
              <span>Nouveau Sujet</span>
            </Link>
          </div>
        )}

        {/* Posts Non Lus */}
        <div className="sidebar-widget unread-widget">
          <Link href="/forum/unread" className="widget-button">
            <MessageSquare size={18} />
            <span>Voir les posts non lus ({unreadTopics})</span>
          </Link>
        </div>

        {/* Recent Posts */}
        <div className="sidebar-widget recent-posts-widget">
          <h3>
            <Clock size={16} />
            Dernières activités
          </h3>
          <div className="recent-posts-list">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/forum/topic/${post.topic.id}`} className="recent-post-item">
                <span className="recent-post-topic">{post.topic.title}</span>
                <span className="recent-post-meta">
                  Par <strong>{post.author.name}</strong> • {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Random Post */}
        <div className="sidebar-widget random-widget">
          <form action={handleRandomPost}>
            <button type="submit" className="widget-button secondary-btn">
              <Repeat size={18} />
              <span>Lire un post aléatoire</span>
            </button>
          </form>
        </div>

        {/* Admin Tools */}
        {canCreateForum && (
          <div className="sidebar-widget admin-widget" style={{ border: '1px solid rgba(194, 29, 29, 0.3)', background: 'rgba(194, 29, 29, 0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ color: 'var(--primary)', margin: 0 }}>
              <PlusCircle size={16} />
              Administration
            </h3>
            
            <Link 
              href={`/forum/new-forum?categoryId=${categoryId || ''}&parentForumId=${parentForumId || ''}`} 
              className="widget-button" 
              style={{ background: 'var(--primary)' }}
            >
              <PlusCircle size={18} />
              <span>Nouveau forum</span>
            </Link>

            {forumId && <DeleteForumButton forumId={forumId} forumName={forumName || ""} />}
          </div>
        )}
      </div>
    </aside>
  );
}
