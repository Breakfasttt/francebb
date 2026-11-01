"use client";

/**
 * Page de modération `/moderation` (refonte, carte 099, ADR 0006), réservée aux modérateurs et aux rôles supérieurs.
 * L'onglet ouvert est lu dans l'adresse (`?tab=logs|reports_post|reports_topic|reports_user|reports_article|
 * reports_ligue|reports_user_banned|resources_validation`) ; sans paramètre, ou avec une valeur inconnue, c'est le
 * journal. L'onglet « Utilisateurs » mène à l'annuaire des membres `/membres`. Les onglets des signalements et des
 * ressources portent une pastille avec le nombre d'éléments en attente.
 * Mise en page commune avec l'administration : `StaffPageLayout` (onglets en colonne sur ordinateur, en rangée en haut
 * de la page sur téléphone).
 */
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { AlertTriangle, BookOpen, FileText, Layout, MessageSquare, Trophy, Users, UserX } from "lucide-react";
import StaffPageLayout from "@/common/components/StaffPageLayout/StaffPageLayout";
import LogsTab from "./component/LogsTab";
import ReportsTab from "./component/ReportsTab";
import BannedUsersTab from "./component/BannedUsersTab";
import ResourceModerationTab from "./component/ResourceModerationTab";
import { isModerator } from "@/lib/roles";
import { getModerationSummaryCounts } from "./actions";

const TABS = [
  { id: "logs", label: "Journal d'audit", icon: FileText },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "reports_post", label: "Messages signalés", icon: MessageSquare },
  { id: "reports_topic", label: "Sujets signalés", icon: AlertTriangle },
  { id: "reports_user", label: "Coachs signalés", icon: Users },
  { id: "reports_article", label: "Articles signalés", icon: BookOpen },
  { id: "reports_ligue", label: "Ligues signalées", icon: Trophy },
  { id: "reports_user_banned", label: "Coachs bannis", icon: UserX },
  { id: "resources_validation", label: "Ressources à valider", icon: Layout },
] as const;

type ModerationTab = (typeof TABS)[number]["id"];

/** Onglets de signalement : type de contenu signalé et titre de la liste. */
const REPORT_TABS = {
  reports_post: { type: "POST", title: "Signalements de messages" },
  reports_topic: { type: "TOPIC", title: "Signalements de sujets" },
  reports_user: { type: "USER", title: "Signalements de coachs" },
  reports_article: { type: "ARTICLE", title: "Signalements d'articles" },
  reports_ligue: { type: "LIGUE", title: "Signalements de ligues" },
} as const;

/** « Utilisateurs » n'a pas de contenu ici (c'est un lien vers /membres) : l'adresse `?tab=users` ouvre le journal. */
const sanitizeTab = (tab: string | null): ModerationTab =>
  TABS.find((t) => t.id === tab && t.id !== "users")?.id ?? "logs";

export default function ModerationPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // Visiteur non connecté : page de connexion du site, qui le ramènera ici ensuite
      redirect(`/auth/login?callbackUrl=${encodeURIComponent("/moderation")}`);
    },
  });

  const searchParams = useSearchParams();
  const activeTab = sanitizeTab(searchParams.get("tab"));
  const [counts, setCounts] = useState<Record<string, number>>({});

  const fetchCounts = async () => {
    const res = await getModerationSummaryCounts();
    if (res) setCounts(res);
  };

  useEffect(() => {
    if (status === "loading") return;
    const userRole = session?.user?.role;
    if (!isModerator(userRole)) {
      redirect("/");
    }
    getModerationSummaryCounts().then((res) => {
      if (res) setCounts(res);
    });
  }, [session, status]);

  const userRole = session?.user?.role;
  const tabs = TABS.map((tab) => {
    const Icon = tab.icon;
    return {
      label: tab.label,
      href: tab.id === "users" ? "/membres" : `/moderation?tab=${tab.id}`,
      active: tab.id === activeTab,
      count: counts[tab.id],
      icon: <Icon size={18} aria-hidden="true" className="shrink-0" />,
    };
  });

  const layoutProps = {
    title: "Modération",
    subtitle: "Suivi des signalements et audit des actions",
    tabsLabel: "Onglets de la modération",
    tabs,
  };

  if (status === "loading") return <StaffPageLayout {...layoutProps} loading />;
  if (!isModerator(userRole)) return null;

  const report = activeTab in REPORT_TABS ? REPORT_TABS[activeTab as keyof typeof REPORT_TABS] : null;

  return (
    <StaffPageLayout {...layoutProps} contentLabel={TABS.find((t) => t.id === activeTab)?.label}>
      {activeTab === "logs" && <LogsTab userRole={userRole} />}
      {report && <ReportsTab key={report.type} type={report.type} title={report.title} onActionSuccess={fetchCounts} />}
      {activeTab === "reports_user_banned" && <BannedUsersTab />}
      {activeTab === "resources_validation" && <ResourceModerationTab onActionSuccess={fetchCounts} />}
    </StaffPageLayout>
  );
}
