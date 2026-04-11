import { 
  getUnreadMessagesCount, 
  getRecentPosts, 
  getRandomPostUrl, 
  getUnreadTopicsCount,
  getSubForumCount
} from "@/app/forum/actions";
import Link from "next/link";
import { MessageSquare, Mail, Repeat, Clock, Bell, Search, FileText, Trophy, Users, Lock as LockIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { PlusCircle } from "lucide-react";
import DeleteForumButton from "@/app/forum/component/DeleteForumButton";
import MarkAllAsReadButton from "@/app/forum/component/MarkAllAsReadButton";
import NewForumButton from "@/app/forum/component/NewForumButton";
import LockButton from "@/app/forum/component/LockButton";
import Pagination from "@/common/components/Pagination/Pagination";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import CTAButton from "@/common/components/Button/CTAButton";
import ClassicButton from "@/common/components/Button/ClassicButton";
import AdminButton from "@/common/components/Button/AdminButton";

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
            <PremiumCard className="sidebar-widget pagination-widget" style={{ padding: '1rem' }}>
              <Pagination 
                currentPage={currentPage || 1}
                totalPages={totalPages}
                variant="sidebar"
                baseUrl={forumId ? `/forum/${forumId}` : undefined}
              />
            </PremiumCard>
          )}

          {/* Messages Privés */}
          {unreadMessages > 0 && (
            <PremiumCard className="sidebar-widget message-widget animate-pulse-subtle">
              <Link href="/forum/messages" className="widget-link">
                <Mail size={20} className="text-secondary" />
                <span>{unreadMessages} message{unreadMessages > 1 ? 's' : ''} privé{unreadMessages > 1 ? 's' : ''} non lu{unreadMessages > 1 ? 's' : ''}</span>
              </Link>
            </PremiumCard>
          )}

          {/* Nouveau Sujet / Tournoi */}
          {forumId && (!isLocked || canCreateForum) && (
            <PremiumCard className="sidebar-widget nav-widget">
              {isTournamentForum && (
                <CTAButton href={`/forum/new-tournament?forumId=${forumId}`} icon={<Trophy size={18} />}>
                  Nouveau Tournoi
                </CTAButton>
              )}
              <CTAButton href={`/forum/new-topic?forumId=${forumId}`} icon={<PlusCircle size={18} />}>
                Nouveau Sujet
              </CTAButton>
            </PremiumCard>
          )}

          {forumId && isLocked && !canCreateForum && (
            <div className="sidebar-widget-group">
              <ClassicButton 
                disabled 
                icon={<LockIcon size={18} />}
                style={{ opacity: 0.6 }}
              >
                Forum verrouillé
              </ClassicButton>
            </div>
          )}

          {/* Recherche Avancée */}
          <PremiumCard className="sidebar-widget nav-widget">
            <ClassicButton href={forumId ? `/forum/search?forumId=${forumId}` : `/forum/search`} icon={<Search size={18} />}>
              Recherche avancée
            </ClassicButton>
            
            <ClassicButton href="/membres" icon={<Users size={18} />}>
              Les membres
            </ClassicButton>
          </PremiumCard>

          {/* Posts Non Lus */}
          {!forumId && !categoryId && !parentForumId && unreadTopics > 0 && (
            <PremiumCard className="sidebar-widget unread-widget">
              <div className="sidebar-widget-group">
                <ClassicButton href="/forum/unread" icon={<MessageSquare size={18} />} style={{ flex: 1 }}>
                  Posts non lus ({unreadTopics})
                </ClassicButton>
                <MarkAllAsReadButton />
              </div>
            </PremiumCard>
          )}

          {/* Recent Posts - Only on main forum to save space 
          {!forumId && (
            <PremiumCard className="sidebar-widget recent-posts-widget">
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
            </PremiumCard>
          )}
          */}


          {/* Admin Tools */}
          {canCreateForum && (
            <PremiumCard className="sidebar-widget admin-widget premium">
              <h3 style={{ color: 'var(--primary)', margin: 0 }}>
                <PlusCircle size={16} />
                Administration
              </h3>
              
              <div className="admin-actions-list">
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
            </PremiumCard>
          )}
        </div>
      </div>
    </aside>
  );
}
