"use client";

import { ArrowLeft, Trophy } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BackButton from "@/common/components/BackButton/BackButton";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { redirect, useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import EmptyState from "@/common/components/EmptyState/EmptyState";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";

import { getUserActivity, getUserStats, startConversation, getBlockedUsersIds } from "@/app/profile/actions";
import { isModerator as checkIsModerator } from "@/lib/roles";
import ProfileActivity from "@/app/profile/component/ProfileActivity";
import ProfileSidebar from "@/app/profile/component/ProfileSidebar";
import ProfileArticles from "@/app/profile/component/ProfileArticles";
import "./page.css";
import "./page-mobile.css";


type ProfileTab = "activity" | "articles";

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
  const [isBlocked, setIsBlocked] = useState(false);

  const sanitizeTab = (tab: string | null): ProfileTab => {
    if (tab === "articles") return "articles";
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

        // Fetch block status if logged in
        if (session?.user?.id) {
          const blockedIds = await getBlockedUsersIds();
          setIsBlocked(blockedIds.includes(id));
        }
      } catch (error) {
        console.error("Error fetching spy profile data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status !== "loading") {
      if (!session) {
        router.push(`/auth/login?callback=/spy/${id}`);
        return;
      }
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
  const isModerator = checkIsModerator(userRole);

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
      <PageHeader 
        title={<>Profil de <span>{user.name}</span></>} 
        subtitle={`Consultez le profil de ${user.name}`}
        backHref="/"
        backTitle="Retour à l'accueil"
      />

      <div className="profile-content-layout">
        <ProfileSidebar
          user={user}
          postCount={stats.postCount}
          isOwnProfile={false}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as ProfileTab)}
          isModerator={isModerator}
          onContact={handleContact}
          isBlockedInitial={isBlocked}
        />

        <div className="profile-main-content">
          {activeTab === "activity" && (
            <ProfileActivity activities={activities} userName={user.name} />
          )}

          {activeTab === "articles" && (
            <ProfileArticles userId={user.id} isOwnProfile={false} />
          )}

        </div>
      </div>
    </main>
  );
}
