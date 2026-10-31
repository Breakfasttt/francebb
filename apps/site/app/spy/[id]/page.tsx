"use client";

/**
 * Profil d'un membre vu par un autre membre `/spy/[id]` (refonte, carte 092, ADR 0006) : même mise en page que
 * `/profile` (carte du membre à gauche sur ordinateur, en haut sur téléphone), avec deux onglets gardés dans
 * l'adresse (`?tab=activity|articles`) et les actions sur ce membre (message privé, signaler, bloquer, et bannir pour
 * un modérateur). Son propre identifiant renvoie vers `/profile`. Un visiteur non connecté est envoyé vers la page de
 * connexion, qui le ramène ici ensuite.
 */
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ComponentProps } from "react";
import { UserX } from "lucide-react";
import { Card, EmptyState, LinkTabs, Skeleton } from "@bbfrance/ui";

import ForumListHeader from "@/app/forum/component/ForumListHeader";
import { getUserActivity, getUserStats, getBlockedUsersIds, getRoleLabels } from "@/app/profile/actions";
import { isModerator as checkIsModerator } from "@/lib/roles";
import ProfileActivity from "@/app/profile/component/ProfileActivity";
import ProfileSidebar from "@/app/profile/component/ProfileSidebar";
import ProfileArticles from "@/app/profile/component/ProfileArticles";
import { PROFILE_LAYOUT_CLASS, PROFILE_PAGE_CLASS } from "@/app/profile/component/profileLayout";

type ProfileTab = "activity" | "articles";

const sanitizeTab = (tab: string | null): ProfileTab => (tab === "articles" ? "articles" : "activity");

/** Lien d'onglet sans retour en haut de la page : le contenu change juste sous les onglets. */
function TabLink(props: ComponentProps<typeof Link>) {
  return <Link scroll={false} {...props} />;
}

export default function SpyProfilePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const id = params.id as string;
  const searchParams = useSearchParams();
  const activeTab = sanitizeTab(searchParams.get("tab"));
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- fiche renvoyée par /api/users/[id], non typée
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ postCount: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- messages renvoyés par getUserActivity
  const [activities, setActivities] = useState<any[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [roleLabels, setRoleLabels] = useState<Record<string, string>>({});

  /** Charge la fiche du membre, ses chiffres, son activité et l'état du blocage. */
  async function loadProfile() {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      setUser(null);
      return;
    }
    setUser(await response.json());
    setStats(await getUserStats(id));
    setActivities(await getUserActivity(id));
    if (session?.user?.id) {
      const blockedIds = await getBlockedUsersIds();
      setIsBlocked(blockedIds.includes(id));
    }
  }

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      // Son propre identifiant renvoie vers /profile. Avant, redirect() était appelé dans le bloc try : son erreur
      // spéciale était attrapée par le catch, et la page affichait « Utilisateur introuvable » (carte 092).
      if (session?.user?.id === id) {
        router.replace("/profile");
        return;
      }

      try {
        await loadProfile();
        setRoleLabels(await getRoleLabels());
      } catch (error) {
        console.error("Error fetching spy profile data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status !== "loading") {
      if (!session) {
        router.push(`/auth/login?callbackUrl=/spy/${id}`);
        return;
      }
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rechargé quand le membre ou la session change, comme avant la refonte
  }, [id, session, status]);

  const refreshData = async () => {
    if (!id) return;
    try {
      await loadProfile();
    } catch (error) {
      console.error("Error refreshing spy profile data:", error);
    }
  };

  const header = (
    <ForumListHeader
      title={user ? <>Profil de {user.name}</> : "Profil d'un membre"}
      subtitle={user ? `Consultez le profil de ${user.name}` : undefined}
      backHref="/"
      backTitle="Retour à l'accueil"
    />
  );

  if (loading || status === "loading") {
    return (
      <div className={PROFILE_PAGE_CLASS}>
        {header}
        <div className={PROFILE_LAYOUT_CLASS} aria-label="Chargement du profil">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className={PROFILE_PAGE_CLASS}>
        {header}
        <Card><EmptyState icon={<UserX size={32} />} title="Utilisateur introuvable." /></Card>
      </div>
    );
  }

  const isModerator = checkIsModerator(session?.user?.role);
  const tabs = [
    { label: "Activité du forum", href: `/spy/${id}?tab=activity`, active: activeTab === "activity" },
    { label: "Articles", href: `/spy/${id}?tab=articles`, active: activeTab === "articles" },
  ];

  return (
    <div className={PROFILE_PAGE_CLASS}>
      {header}

      <div className={PROFILE_LAYOUT_CLASS}>
        <ProfileSidebar
          user={user}
          postCount={stats.postCount}
          isOwnProfile={false}
          isModerator={isModerator}
          roleLabels={roleLabels}
          isBlockedInitial={isBlocked}
          onRefresh={refreshData}
        />

        <section aria-label={activeTab === "articles" ? "Articles" : "Activité du forum"} className="flex min-w-0 flex-col gap-4">
          <LinkTabs label="Onglets du profil" tabs={tabs} linkComponent={TabLink} className="-mx-3 px-3 lg:mx-0 lg:px-0" />
          {activeTab === "activity" && <ProfileActivity activities={activities} userName={user.name} />}
          {activeTab === "articles" && <ProfileArticles userId={user.id} isOwnProfile={false} />}
        </section>
      </div>
    </div>
  );
}
