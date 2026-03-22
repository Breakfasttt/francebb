"use client";

import { use } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Trophy, Settings } from "lucide-react";

import ProfileSidebar from "@/components/forum/ProfileSidebar";
import ProfileActivity from "@/components/forum/ProfileActivity";
import ProfileEdit from "@/components/forum/ProfileEdit";
import ProfilePM from "@/components/profile/ProfilePM";
import { getUserStats, getUserActivity } from "@/app/profile/actions";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { data: session, status } = useSession();
  
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ postCount: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("activity");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchData();
  }, [id, session, status]);

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
            <ProfileActivity activities={activities} userName={user.name} />
          )}

          {activeTab === "edit" && isOwnProfile && (
            <ProfileEdit user={user} />
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
