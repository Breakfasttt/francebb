"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Trophy, Settings, Bookmark, Clock, ArrowRight, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import ProfileSidebar from "@/app/profile/component/ProfileSidebar";
import ProfileActivity from "@/app/profile/component/ProfileActivity";
import ProfileEdit from "@/app/profile/component/ProfileEdit";
import ProfilePM from "@/app/profile/component/ProfilePM";
import { getUserStats, getUserActivity } from "@/app/profile/actions";
import { getFollowedTopics } from "@/app/forum/actions";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const tabParam = searchParams.get("tab");
  const [user, setUser] = useState<any>(null);
  const { data: session, status } = useSession();
  const isOwnProfile = session?.user?.id === user?.id;
  const [stats, setStats] = useState({ postCount: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  type ProfileTab = "activity" | "palmares" | "pm" | "edit" | "followed";
  const sanitizeTab = (tab: string | null): ProfileTab => {
    if (tab === "activity" || tab === "palmares" || tab === "pm" || tab === "edit" || tab === "followed") return tab;
    return "activity";
  };
  const [activeTab, setActiveTab] = useState<ProfileTab>(() => sanitizeTab(tabParam));
  const [loading, setLoading] = useState(true);

  type FollowedTopic = {
    id: string;
    title: string;
    updatedAt: Date;
    forumId: string;
    isUnread: boolean;
  };
  const [followedTopics, setFollowedTopics] = useState<FollowedTopic[]>([]);
  const [followedLoading, setFollowedLoading] = useState(false);
  const [followedPage, setFollowedPage] = useState(1);
  const [followedTotalPages, setFollowedTotalPages] = useState(1);

  async function fetchData() {
    // Wait for session to be loaded if no ID is provided
    if (status === "loading") return;
    
    const targetId = id || session?.user?.id;
    if (!targetId || targetId === "undefined") {
      if (status === "unauthenticated" && !id) {
         redirect("/");
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${targetId}`);
      if (!res.ok) {
        setUser(null);
        setLoading(false);
        return;
      }
      const userData = await res.json();
      if (userData.error) {
         setUser(null);
      } else {
         setUser(userData);
         const userStats = await getUserStats(targetId);
         setStats(userStats);
         const userActivities = await getUserActivity(targetId);
         setActivities(userActivities);
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [id, session, status]);

  useEffect(() => {
    // S'assure que si l'onglet "followed" est sélectionné, on charge les données
    if (activeTab === "followed" && isOwnProfile) {
      loadFollowedTopics();
    }
  }, [activeTab, isOwnProfile]);

  useEffect(() => {
    // Synchronise l'onglet local avec le paramètre d'URL au chargement ou changement d'URL
    const tab = sanitizeTab(tabParam);
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tabParam]);

  async function loadFollowedTopics(page: number = 1) {
    setFollowedLoading(true);
    const data = await getFollowedTopics(page);
    setFollowedTopics(data.topics as FollowedTopic[]);
    setFollowedTotalPages(data.totalPages);
    setFollowedPage(page);
    setFollowedLoading(false);
  }

  if (loading || status === "loading") return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Chargement...</div>;
  if (!user) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Utilisateur introuvable.</div>;

  const userRole = (session?.user as any)?.role;
  const isModerator = userRole === "ADMIN" || userRole === "MODERATOR";

  return (
    <main className="container profile-page-container">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href="/" className="back-button" title="Retour à l'accueil" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 className="page-title">{isOwnProfile ? "Mon Compte" : `Profil de ${user.name}`}</h1>
          <p style={{ color: '#888', margin: '0.5rem 0 0 0' }}>
            {isOwnProfile ? "Gérez vos informations et votre activité" : `Consultez le profil de ${user.name}`}
          </p>
        </div>
      </header>

      <div className="profile-content-layout">
        <ProfileSidebar 
          user={user} 
          postCount={stats.postCount}
          isOwnProfile={isOwnProfile}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as ProfileTab)}
          isModerator={isModerator}
        />

        <div className="profile-main-content">
          {activeTab === "activity" && (
            <ProfileActivity activities={activities} userName={user.name} />
          )}

          {activeTab === "followed" && isOwnProfile && (
            <div className="premium-card followed-topics-full-view fade-in">
              <div className="section-header-pm">
                <Bookmark size={20} className="header-icon" />
                <h3 className="activity-box-title">Mes Sujets suivis</h3>
              </div>

              <div className="followed-topics-content">
                {followedLoading ? (
                  <div className="followed-topics-empty">Chargement de vos suivis...</div>
                ) : followedTopics.length === 0 ? (
                  <div className="followed-topics-empty">Vous ne suivez aucun sujet pour le moment.</div>
                ) : (
                  <>
                    <div className="profile-activity-list">
                      {followedTopics.map((t) => (
                        <Link
                          key={t.id}
                          href={`/forum/topic/${t.id}`}
                          className={`premium-card activity-item ${t.isUnread ? 'is-unread' : ''}`}
                        >
                          <div className="activity-header">
                            <div className="activity-icon-container">
                              <Bookmark size={16} />
                              {t.isUnread && <div className="unread-dot-indicator" />}
                            </div>
                            <div className="activity-meta">
                              <div className="activity-type">
                                Sujet suivi 
                              </div>
                              <h4 className="activity-topic">{t.title}</h4>
                            </div>
                            <div className="activity-time">
                              <Clock size={12} />
                              <span>{t.updatedAt ? formatDistanceToNow(new Date(t.updatedAt), { addSuffix: true, locale: fr }) : ""}</span>
                            </div>
                          </div>
                          <div className="view-more">
                            <span>Voir le sujet <ArrowRight size={14} /></span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {followedTotalPages > 1 && (
                      <div className="pagination" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
                        <button 
                          disabled={followedPage === 1 || followedLoading} 
                          onClick={() => loadFollowedTopics(followedPage - 1)}
                          className="btn-pagination"
                        >
                          Précédent
                        </button>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>
                          Page {followedPage} / {followedTotalPages}
                        </span>
                        <button 
                          disabled={followedPage === followedTotalPages || followedLoading} 
                          onClick={() => loadFollowedTopics(followedPage + 1)}
                          className="btn-pagination"
                        >
                          Suivant
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "edit" && isOwnProfile && (
            <ProfileEdit user={user} onUpdate={fetchData} />
          )}

          {activeTab === "palmares" && (
            <div className="premium-card empty-state fade-in">
              <Trophy size={48} />
              <h3>Palmarès NAF</h3>
              <p>Cette fonctionnalité sera prochainement synchronisée avec votre profil NAF.</p>
            </div>
          )}

          {activeTab === "pm" && isOwnProfile && (
            <ProfilePM />
          )}
        </div>
      </div>

      <style jsx>{`
        .profile-page-container {
          padding-top: 2rem;
          padding-bottom: 4rem;
        }
        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }
        .back-button:hover {
          color: var(--primary);
        }
        .page-title {
          margin: 0;
          font-size: 2.5rem;
          letter-spacing: -0.03em;
        }
        .page-title span {
           color: var(--primary);
        }
        .profile-content-layout {
          display: flex;
          gap: 2.5rem;
          align-items: flex-start;
          margin-top: 2rem;
        }
        .profile-main-content {
          flex: 1;
        }
        .empty-state {
          padding: 5rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: #666;
        }
        .empty-state h3 {
          margin: 0;
          color: #eee;
        }
        .empty-state p {
          max-width: 300px;
          margin: 0 auto;
        }

        .followed-topics-card {
          margin-top: 2rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .followed-topics-toggle {
          background: transparent;
          border: 1px solid var(--glass-border);
          color: white;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          font-weight: 800;
          letter-spacing: 0.03em;
          transition: all 0.2s;
        }

        .followed-topics-toggle:hover {
          border-color: var(--primary);
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        }

        .followed-topics-full-view {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .section-header-pm {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .header-icon {
          color: var(--primary);
        }

        .activity-box-title {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 800;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .followed-topics-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .followed-topics-empty {
          color: #aaa;
          padding: 0.5rem 0.25rem;
        }

        .followed-topics-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .topic-main {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          min-width: 0;
        }

        /* Activity items styles shared with Sujets suivis */
        .profile-activity-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .activity-item {
          padding: 2.2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          text-decoration: none;
          color: inherit;
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.25s ease;
        }
        .activity-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--primary);
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }
        .activity-header {
          display: flex;
          align-items: center;
          gap: 1.8rem;
          padding: 0.8rem 1.25rem 0;
        }
        .activity-icon-container {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(255, 255, 255, 0.03);
          color: #888;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .activity-meta {
          flex: 1;
        }
        .activity-type {
          font-size: 0.70rem;
          text-transform: uppercase;
          color: #666;
          font-weight: 800;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }
        .activity-topic {
          margin: 0;
          font-size: 1.1rem;
          color: #fff;
          font-weight: 600;
          line-height: 1.4;
        }
        .activity-time {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #555;
          white-space: nowrap;
          margin-right: 1.5rem;
        }
        .view-more {
          display: flex;
          justify-content: flex-end;
          padding-left: 3.75rem;
        }
        .view-more span {
          font-size: 0.8rem;
          color: var(--primary);
          font-weight: 800;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0;
          transition: all 0.2s;
        }
        .activity-item:hover .view-more span {
          opacity: 1;
          transform: translateX(4px);
        }

        /* Unread topics highlight - Forced Global Scoping */
        :global(.premium-card.activity-item.is-unread) {
          background: rgba(255, 215, 0, 0.05) !important;
          border-color: #ffd700 !important;
        }
        :global(.activity-item.is-unread .activity-topic) {
          color: #ffd700 !important;
          text-shadow: 0 0 15px rgba(255, 215, 0, 0.3) !important;
        }
        :global(.activity-item.is-unread .activity-type) {
          color: #ffd700 !important;
          opacity: 0.8;
        }
        :global(.activity-item.is-unread .activity-icon-container) {
          color: #ffd700 !important;
          border-color: rgba(255, 215, 0, 0.5) !important;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.2) !important;
          position: relative;
        }
        :global(.unread-dot-indicator) {
          position: absolute !important;
          top: -4px !important;
          right: -4px !important;
          width: 10px !important;
          height: 10px !important;
          background: #ffd700 !important;
          border-radius: 50% !important;
          border: 2px solid #1a1a20 !important;
          box-shadow: 0 0 10px #ffd700 !important;
          animation: pulse-unread 2s infinite !important;
          z-index: 10 !important;
        }
        @keyframes pulse-unread {
          0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
          70% { transform: scale(1.1); opacity: 0.8; box-shadow: 0 0 0 6px rgba(255, 215, 0, 0); }
          100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
        }
        .btn-pagination {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .btn-pagination:hover:not(:disabled) {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.1);
        }
        .btn-pagination:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        @media (max-width: 900px) {
          .profile-content-layout {
            flex-direction: column;
          }
          .profile-sidebar-wrapper {
            width: 100% !important;
          }
        }
      `}</style>
    </main>
  );
}
