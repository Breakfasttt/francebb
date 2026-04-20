import { 
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
import GlobalPortal from "@/common/components/GlobalPortal/GlobalPortal";

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

  const content = (
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


        {/* Nouveau Sujet / Tournoi */}
        {session && forumId && (!isLocked || canCreateForum) && (
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
        {session && !forumId && !categoryId && !parentForumId && unreadTopics > 0 && (
          <PremiumCard className="sidebar-widget unread-widget" noOverflow>
            <div className="sidebar-widget-group">
              <ClassicButton href="/forum/unread" icon={<MessageSquare size={18} />} style={{ flex: 1 }}>
                Posts non lus ({unreadTopics})
              </ClassicButton>
              <MarkAllAsReadButton />
            </div>
          </PremiumCard>
        )}

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
  );

  return (
    <>
      <aside className="forum-sidebar desktop-only">
        {content}
      </aside>

      {/* Téléportation vers la sidebar mobile */}
      <GlobalPortal target="#mobile-page-sidebar-slot">
        <div className="mobile-sidebar-section mobile-only">
          {content}
        </div>
      </GlobalPortal>
    </>
  );
}
