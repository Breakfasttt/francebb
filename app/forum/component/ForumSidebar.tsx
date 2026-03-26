import { 
  getUnreadMessagesCount, 
  getRecentPosts, 
  getRandomPostUrl, 
  getUnreadTopicsCount,
  getSubForumCount
} from "@/app/forum/actions";
import Link from "next/link";
import { MessageSquare, Mail, Repeat, Clock, Bell, Search, FileText, Trophy, Lock as LockIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { PlusCircle } from "lucide-react";
import DeleteForumButton from "@/app/forum/component/DeleteForumButton";
import MarkAllAsReadButton from "@/app/forum/component/MarkAllAsReadButton";
import NewForumButton from "@/app/forum/component/NewForumButton";
import LockButton from "@/app/forum/component/LockButton";
import SidebarPagination from "@/app/forum/component/SidebarPagination";

const POSTS_PER_PAGE = 20;

export default async function ForumSidebar({ 
  forumId, 
  forumName, 
  categoryId, 
  parentForumId,
  isLocked,
  isTournamentForum,
  currentPage,
  totalPages
}: { 
  forumId?: string; 
  forumName?: string; 
  categoryId?: string; 
  parentForumId?: string;
  isLocked?: boolean;
  isTournamentForum?: boolean;
  currentPage?: number;
  totalPages?: number;
}) {
  const unreadMessages = await getUnreadMessagesCount();
  const recentPosts = await getRecentPosts(3);
  const unreadTopics = await getUnreadTopicsCount();
  const subForumCount = parentForumId ? await getSubForumCount(parentForumId) : 0;
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
          {/* 1. Pages Block (Forum / Search) */}
          {(totalPages && totalPages > 1) && (
            <SidebarPagination 
              currentPage={currentPage || 1}
              totalPages={totalPages}
            />
          )}

          {/* Messages Privés */}
          {unreadMessages > 0 && (
            <div className="sidebar-widget message-widget animate-pulse-subtle">
              <Link href="/forum/messages" className="widget-link">
                <Mail size={20} className="text-secondary" />
                <span>{unreadMessages} message{unreadMessages > 1 ? 's' : ''} privé{unreadMessages > 1 ? 's' : ''} non lu{unreadMessages > 1 ? 's' : ''}</span>
              </Link>
            </div>
          )}

          {/* Nouveau Sujet / Tournoi */}
          {forumId && (!isLocked || canCreateForum) && (
            <div className="sidebar-widget new-topic-widget" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {isTournamentForum && (
                <Link href={`/forum/new-tournament?forumId=${forumId}`} className="widget-button" style={{ background: 'var(--accent)', color: 'var(--background)' }}>
                  <Trophy size={18} />
                  <span>Nouveau Tournoi</span>
                </Link>
              )}
              <Link href={`/forum/new-topic?forumId=${forumId}`} className="widget-button" style={{ background: 'var(--primary)' }}>
                <PlusCircle size={18} />
                <span>Nouveau Sujet</span>
              </Link>
            </div>
          )}

          {forumId && isLocked && !canCreateForum && (
            <div className="sidebar-widget new-topic-widget" style={{ opacity: 0.6 }}>
              <div className="widget-button" style={{ background: 'var(--glass-bg)', border: 'none', cursor: 'not-allowed', color: 'var(--text-muted)' }}>
                <LockIcon size={18} />
                <span>Forum verrouillé</span>
              </div>
            </div>
          )}

          {/* Recherche Avancée */}
          <div className="sidebar-widget search-widget">
            <Link href={forumId ? `/forum/search?forumId=${forumId}` : `/forum/search`} className="widget-button" style={{ background: 'var(--glass-bg)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}>
              <Search size={18} />
              <span>Recherche avancée</span>
            </Link>
          </div>

          {/* Posts Non Lus */}
          {!forumId && !categoryId && !parentForumId && unreadTopics > 0 && (
            <div className="sidebar-widget unread-widget" style={{ display: 'flex', gap: '4px' }}>
              <Link href="/forum/unread" className="widget-button secondary-btn" style={{ flex: 1 }}>
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
                Dernières réponses
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
                      <span className="recent-post-topic" style={{ color: !post.isRead ? 'var(--unread-marker)' : 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {post.topic.forum.isLocked && <LockIcon size={12} style={{ color: 'var(--primary)', opacity: 0.8 }} />}
                        {post.topic.tournamentId ? (
                           <Trophy size={13} style={{ color: !post.isRead ? 'var(--accent)' : 'var(--foreground)', opacity: !post.isRead ? 1 : 0.6, flexShrink: 0 }} />
                        ) : (
                           <FileText size={13} style={{ color: !post.isRead ? 'var(--unread-marker)' : 'var(--text-secondary)', flexShrink: 0 }} />
                        )}
                        {post.topic.title}
                        {!post.isRead && <Bell size={12} fill="var(--unread-marker)" color="var(--unread-marker)" className="animate-pulse-subtle" />}
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
            <div className="sidebar-widget admin-widget" style={{ border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ color: 'var(--primary)', margin: 0 }}>
                <PlusCircle size={16} />
                Administration
              </h3>
              
              <NewForumButton 
                categoryId={categoryId}
                parentForumId={parentForumId}
                subForumCount={subForumCount}
              />

              {forumId && <DeleteForumButton forumId={forumId} forumName={forumName || ""} />}
              {forumId && (
                <LockButton 
                  id={forumId} 
                  type="forum" 
                  isLocked={isLocked || false} 
                />
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
