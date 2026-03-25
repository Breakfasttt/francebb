"use client";

import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Bookmark, Clock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import ProfileSidebar from "@/app/profile/component/ProfileSidebar";
import ProfileActivity from "@/app/profile/component/ProfileActivity";
import ProfileEdit from "@/app/profile/component/ProfileEdit";
import ProfilePM from "@/app/profile/component/ProfilePM";
import ProfileSettings from "@/app/profile/component/ProfileSettings";
import { getUserStats, getUserActivity } from "@/app/profile/actions";
import { getFollowedTopics } from "@/app/forum/actions";
import "./page.css";

type ProfileTab = "followed" | "activity" | "edit" | "palmares" | "pm" | "settings";

export default function ProfilePage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin?callbackUrl=/profile");
    },
  });

  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ postCount: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("followed");

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

  const sanitizeTab = (tab: string | null): ProfileTab => {
    if (tab === "edit") return "edit";
    if (tab === "palmares") return "palmares";
    if (tab === "pm") return "pm";
    if (tab === "activity") return "activity";
    if (tab === "settings") return "settings";
    return "followed";
  };

  useEffect(() => {
    async function fetchData() {
      if (status === "loading") return;
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/users/${session.user.id}`);
        const userData = await response.json();
        setUser(userData);

        const userStats = await getUserStats(session.user.id);
        setStats(userStats);
        const userActivities = await getUserActivity(session.user.id);
        setActivities(userActivities);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session, status]);

  useEffect(() => {
    if (activeTab === "followed") {
      loadFollowedTopics();
    }
  }, [activeTab]);

  useEffect(() => {
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
    setFollowPage(page);
    setFollowedLoading(false);
  }

  function setFollowPage(page: number) {
    setFollowedPage(page);
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
          <h1 className="page-title">Mon Compte</h1>
          <p style={{ color: '#888', margin: '0.5rem 0 0 0' }}>
            Gérez vos informations et votre activité
          </p>
        </div>
      </header>

      <div className="profile-content-layout">
        <ProfileSidebar 
          user={user} 
          postCount={stats.postCount}
          isOwnProfile={true}
          activeTab={activeTab}
          onTabChange={(tab: any) => setActiveTab(tab as ProfileTab)}
          isModerator={isModerator}
        />

        <div className="profile-main-content">
          {activeTab === "activity" && (
            <ProfileActivity activities={activities} userName={user.name} />
          )}

          {activeTab === "followed" && (
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

          {activeTab === "edit" && (
            <ProfileEdit user={user} postCount={stats.postCount} onUpdate={() => window.location.reload()} />
          )}

          {activeTab === "palmares" && (
            <div className="premium-card empty-state fade-in">
              <Trophy size={48} />
              <h3>Palmarès NAF</h3>
              <p>Cette fonctionnalité sera prochainement synchronisée avec votre profil NAF.</p>
            </div>
          )}

          {activeTab === "pm" && (
            <ProfilePM />
          )}

          {activeTab === "settings" && (
            <ProfileSettings user={user} />
          )}
        </div>
      </div>
    </main>
  );
}
