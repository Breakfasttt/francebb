import { getUnreadMessagesCount, getRecentPosts, getRandomPostUrl, getUnreadTopicsCount } from "@/app/forum/actions";
import Link from "next/link";
import { MessageSquare, Mail, Repeat, Clock, Bell, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { PlusCircle } from "lucide-react";
import DeleteForumButton from "./DeleteForumButton";
import MarkAllAsReadButton from "./MarkAllAsReadButton";

const POSTS_PER_PAGE = 20;

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
      <div className="sidebar-sticky-inner">
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

          {/* Recherche Avancée */}
          <div className="sidebar-widget search-widget">
            <Link href={forumId ? `/forum/search?forumId=${forumId}` : `/forum/search`} className="widget-button" style={{ background: 'rgba(255,255,255,0.05)', color: '#ccc', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Search size={18} />
              <span>Recherche avancée</span>
            </Link>
          </div>

          {/* Posts Non Lus */}
          {!forumId && !categoryId && !parentForumId && unreadTopics > 0 && (
            <div className="sidebar-widget unread-widget" style={{ display: 'flex', gap: '4px' }}>
              <Link href="/forum/unread" className="widget-button" style={{ flex: 1 }}>
                <MessageSquare size={18} />
                <span>Posts non lus ({unreadTopics})</span>
              </Link>
              <MarkAllAsReadButton />
            </div>
          )}

          {/* Recent Posts - Only on main forum to save space */}
          {!forumId && (
            <div className="sidebar-widget recent-posts-widget">
              <h3>
                <Clock size={16} />
                Dernières activités
              </h3>
              <div className="recent-posts-list">
                {recentPosts.map((post) => {
                  const page = Math.ceil(post.topic._count.posts / POSTS_PER_PAGE);
                  const postUrl = `/forum/topic/${post.topic.id}?page=${page}#post-${post.id}`;
                  
                  return (
                    <Link 
                      key={post.id} 
                      href={postUrl} 
                      className={`recent-post-item ${!post.isRead ? 'has-new' : ''}`}
                    >
                      <span className="recent-post-topic" style={{ color: !post.isRead ? 'var(--accent)' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {post.topic.title}
                        {!post.isRead && <Bell size={12} fill="var(--accent)" color="var(--accent)" className="animate-pulse-subtle" />}
                      </span>
                      <span className="recent-post-meta">
                        Par <strong>{post.author.name}</strong> • {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Random Post - Only on main forum */}
          {!forumId && (
            <div className="sidebar-widget random-widget">
              <form action={handleRandomPost}>
                <button type="submit" className="widget-button secondary-btn">
                  <Repeat size={18} />
                  <span>Lire un post aléatoire</span>
                </button>
              </form>
            </div>
          )}

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
      </div>
    </aside>
  );
}
