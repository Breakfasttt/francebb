"use client";

import { ArrowLeft, Trophy } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BackButton from "@/common/components/BackButton/BackButton";
import { redirect, useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getUserActivity, getUserStats, startConversation } from "@/app/profile/actions";
import ProfileActivity from "@/app/profile/component/ProfileActivity";
import ProfileSidebar from "@/app/profile/component/ProfileSidebar";
import "./page.css";

type ProfileTab = "activity" | "palmares";

export default function SpyProfilePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const id = params.id as string;
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ postCount: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("activity");

  const sanitizeTab = (tab: string | null): ProfileTab => {
    if (tab === "palmares") return "palmares";
    return "activity";
  };

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      try {
        // Rediriger vers /profile si l'ID est celui de l'utilisateur connecté
        if (session?.user?.id === id) {
          redirect("/profile");
        }

        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
          setUser(null);
          return;
        }
        const userData = await response.json();
        setUser(userData);

        const userStats = await getUserStats(id);
        setStats(userStats);
        const userActivities = await getUserActivity(id);
        setActivities(userActivities);
      } catch (error) {
        console.error("Error fetching spy profile data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status !== "loading") {
      fetchData();
    }
  }, [id, session, status]);

  useEffect(() => {
    const tab = sanitizeTab(tabParam);
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tabParam]);

  if (loading || status === "loading") return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Chargement...</div>;
  if (!user) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Utilisateur introuvable.</div>;

  const userRole = (session?.user as any)?.role;
  const isModerator = userRole === "ADMIN" || userRole === "MODERATOR";

  const handleContact = async () => {
    if (!session?.user) {
      redirect("/api/auth/signin");
      return;
    }
    try {
      const res = await startConversation(user.id);
      if (res.success) {
        router.push(`/profile?tab=pm&conversationId=${res.conversationId}`);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <main className="container profile-page-container">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <BackButton href="/" title="Retour à l'accueil" style={{ position: 'absolute', left: 0 }} />
        <div style={{ textAlign: 'center' }}>
          <h1 className="page-title">Profil de <span>{user.name}</span></h1>
          <p style={{ color: '#888', margin: '0.5rem 0 0 0' }}>
            Consultez le profil de {user.name}
          </p>
        </div>
      </header>

      <div className="profile-content-layout">
        <ProfileSidebar
          user={user}
          postCount={stats.postCount}
          isOwnProfile={false}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as ProfileTab)}
          isModerator={isModerator}
          onContact={handleContact}
        />

        <div className="profile-main-content">
          {activeTab === "activity" && (
            <ProfileActivity activities={activities} userName={user.name} />
          )}

          {activeTab === "palmares" && (
            <div className="premium-card empty-state fade-in">
              <Trophy size={48} />
              <h3>Palmarès NAF</h3>
              <p>Ce coach n'a pas encore de palmarès enregistré.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
