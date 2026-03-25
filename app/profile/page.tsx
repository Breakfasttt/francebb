"use client";

import { use } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Trophy, Settings } from "lucide-react";

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
  const { data: session, status } = useSession();
  
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ postCount: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  type ProfileTab = "activity" | "palmares" | "pm" | "edit";
  const sanitizeTab = (tab: string | null): ProfileTab => {
    if (tab === "activity" || tab === "palmares" || tab === "pm" || tab === "edit") return tab;
    return "activity";
  };
  const [activeTab, setActiveTab] = useState<ProfileTab>(() => sanitizeTab(tabParam));
  const [loading, setLoading] = useState(true);

  type FollowedTopic = {
    id: string;
    title: string;
    updatedAt: Date;
    forumId: string;
  };
  const [followedTopics, setFollowedTopics] = useState<FollowedTopic[]>([]);
  const [followedLoading, setFollowedLoading] = useState(false);
  const [showFollowedTopics, setShowFollowedTopics] = useState(false);

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
    // Synchronise l'onglet avec le paramètre d'URL (ex: /profile?tab=pm)
    setActiveTab(sanitizeTab(tabParam));
  }, [tabParam]);

  if (loading || status === "loading") return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Chargement...</div>;
  if (!user) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Utilisateur introuvable.</div>;

  const isOwnProfile = session?.user?.id === user.id;
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
          onTabChange={setActiveTab}
          isModerator={isModerator}
        />

        <div className="profile-main-content">
          {activeTab === "activity" && (
            <>
              <ProfileActivity activities={activities} userName={user.name} />

              {isOwnProfile && (
                <div className="premium-card followed-topics-card fade-in">
                  <button
                    type="button"
                    className="followed-topics-toggle"
                    onClick={async () => {
                      setShowFollowedTopics((v) => !v);
                      // Lazy-load: only fetch when opening.
                      if (!showFollowedTopics && followedTopics.length === 0) {
                        setFollowedLoading(true);
                        const topics = await getFollowedTopics();
                        setFollowedTopics(topics as FollowedTopic[]);
                        setFollowedLoading(false);
                      }
                    }}
                  >
                    Sujet suivi
                  </button>

                  {showFollowedTopics && (
                    <div className="followed-topics-content">
                      {followedLoading ? (
                        <div className="followed-topics-empty">Chargement...</div>
                      ) : followedTopics.length === 0 ? (
                        <div className="followed-topics-empty">Aucun sujet suivi pour le moment.</div>
                      ) : (
                        <div className="followed-topics-list">
                          {followedTopics.map((t) => (
                            <Link
                              key={t.id}
                              href={`/forum/topic/${t.id}`}
                              className="followed-topic-item"
                            >
                              <span className="followed-topic-title">{t.title}</span>
                              <span className="followed-topic-date">
                                {t.updatedAt ? t.updatedAt.toLocaleDateString("fr-FR") : ""}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
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

        .followed-topic-item {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.9rem 1rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.2s;
          text-decoration: none;
          color: inherit;
        }

        .followed-topic-item:hover {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.04);
          transform: translateY(-2px);
        }

        .followed-topic-title {
          font-weight: 800;
          color: #fff;
          line-height: 1.3;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .followed-topic-date {
          color: #666;
          font-size: 0.8rem;
          white-space: nowrap;
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
