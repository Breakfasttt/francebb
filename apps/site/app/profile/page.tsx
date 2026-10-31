"use client";

/**
 * Page « Mon compte » `/profile` (refonte, carte 092, ADR 0006).
 * - Sur ordinateur : la carte du membre à gauche, les onglets et leur contenu à droite.
 * - Sur téléphone : une seule colonne ; la carte du membre, puis la rangée des onglets (qui défile de côté), puis le
 *   contenu. Avant la refonte, les onglets étaient rangés dans le panneau « Plus » de la barre du bas.
 * L'onglet ouvert est lu dans l'adresse (`?tab=followed|activity|articles|ressources|blocked|edit|settings`) : chaque
 * onglet est un lien, qu'on peut partager ou rouvrir. Sans paramètre (ou avec une valeur inconnue), ce sont les
 * sujets suivis.
 */
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, type ComponentProps } from "react";
import Link from "next/link";
import { UserX } from "lucide-react";
import { Card, EmptyState, LinkTabs, Skeleton } from "@bbfrance/ui";

import ForumListHeader from "@/app/forum/component/ForumListHeader";
import ProfileSidebar from "@/app/profile/component/ProfileSidebar";
import ProfileActivity from "@/app/profile/component/ProfileActivity";
import ProfileEdit from "@/app/profile/component/ProfileEdit";
import ProfileSettings from "@/app/profile/component/ProfileSettings";
import ProfileArticles from "@/app/profile/component/ProfileArticles";
import ProfileResources from "@/app/profile/component/ProfileResources";
import ProfileBlockedUsers from "@/app/profile/component/ProfileBlockedUsers";
import ProfileFollowedTopics from "@/app/profile/component/ProfileFollowedTopics";
import { getRoleLabels, getUserStats, getUserActivity } from "@/app/profile/actions";
import { isModerator as checkIsModerator } from "@/lib/roles";
import { PROFILE_LAYOUT_CLASS, PROFILE_PAGE_CLASS } from "@/app/profile/component/profileLayout";

const TABS = [
  { id: "followed", label: "Sujets suivis" },
  { id: "activity", label: "Activité du forum" },
  { id: "articles", label: "Mes articles" },
  { id: "ressources", label: "Mes ressources" },
  { id: "blocked", label: "Utilisateurs bloqués" },
  { id: "edit", label: "Éditer mon profil" },
  { id: "settings", label: "Gérer mon compte" },
] as const;

type ProfileTab = (typeof TABS)[number]["id"];

const sanitizeTab = (tab: string | null): ProfileTab => TABS.find((t) => t.id === tab)?.id ?? "followed";

/** Lien d'onglet sans retour en haut de la page : le contenu change juste sous les onglets. */
function TabLink(props: ComponentProps<typeof Link>) {
  return <Link scroll={false} {...props} />;
}

export default function ProfilePage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // Visiteur non connecté : page de connexion du site, qui le ramènera ici ensuite
      redirect(`/auth/login?callbackUrl=${encodeURIComponent("/profile")}`);
    },
  });

  const searchParams = useSearchParams();
  const activeTab = sanitizeTab(searchParams.get("tab"));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- fiche renvoyée par /api/users/[id], non typée
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ postCount: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- messages renvoyés par getUserActivity
  const [activities, setActivities] = useState<any[]>([]);
  const [roleLabels, setRoleLabels] = useState<Record<string, string>>({});

  async function fetchData() {
    if (status === "loading") return;
    if (!session?.user?.id) return;

    // Carte 063 : la page s'affiche dès que la fiche du membre est arrivée. Le nombre de messages, l'activité et les
    // libellés des rôles arrivent ensuite et complètent la page. Les chargements restent l'un après l'autre : la
    // petite base des tests ne supporte qu'une connexion à la fois.
    try {
      const response = await fetch(`/api/users/${session.user.id}`);
      setUser(await response.json());
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }

    try {
      setStats(await getUserStats(session.user.id));
      setActivities(await getUserActivity(session.user.id));
      setRoleLabels(await getRoleLabels());
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rechargé quand la session change, comme avant la refonte
  }, [session, status]);

  // Carte 063 : le titre de la page s'affiche tout de suite, sans attendre les données du membre.
  const header = (
    <ForumListHeader title="Mon compte" subtitle="Gérez vos informations et votre activité" backHref="/" backTitle="Retour à l'accueil" />
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
  if (!user || user.error) {
    return (
      <div className={PROFILE_PAGE_CLASS}>
        {header}
        <Card><EmptyState icon={<UserX size={32} />} title="Utilisateur introuvable." /></Card>
      </div>
    );
  }

  const isModerator = checkIsModerator(session?.user?.role);
  const tabs = TABS.map((t) => ({ label: t.label, href: `/profile?tab=${t.id}`, active: t.id === activeTab }));

  return (
    <div className={PROFILE_PAGE_CLASS}>
      {header}

      <div className={PROFILE_LAYOUT_CLASS}>
        <ProfileSidebar user={user} postCount={stats.postCount} isOwnProfile roleLabels={roleLabels} />

        <section aria-label={TABS.find((t) => t.id === activeTab)?.label} className="flex min-w-0 flex-col gap-4">
          <LinkTabs label="Onglets du profil" tabs={tabs} linkComponent={TabLink} className="-mx-3 px-3 lg:mx-0 lg:px-0" />

          {activeTab === "followed" && <ProfileFollowedTopics />}
          {activeTab === "activity" && <ProfileActivity activities={activities} userName={user.name} />}
          {activeTab === "articles" && <ProfileArticles userId={user.id} isOwnProfile />}
          {activeTab === "ressources" && <ProfileResources userId={user.id} />}
          {activeTab === "blocked" && <ProfileBlockedUsers roleLabels={roleLabels} />}
          {activeTab === "edit" && (
            <ProfileEdit user={user} postCount={stats.postCount} onUpdate={() => window.location.reload()} isModerator={isModerator} />
          )}
          {activeTab === "settings" && <ProfileSettings user={user} onUpdate={fetchData} />}
        </section>
      </div>
    </div>
  );
}
