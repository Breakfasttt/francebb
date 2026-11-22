"use client";

/**
 * Page de modération `/moderation` (refonte, carte 099, ADR 0006), réservée aux modérateurs et aux rôles supérieurs.
 * L'onglet ouvert est lu dans l'adresse (`?tab=logs|reports_post|reports_topic|reports_user|reports_article|
 * reports_ligue|reports_user_banned|resources_validation`) ; sans paramètre, c'est le premier onglet qui a des cas en
 * attente, ou le journal s'il n'y en a aucun (carte 221) ; une valeur inconnue ouvre le journal. Le dernier onglet,
 * « Membres (page à part) », mène à l'annuaire `/membres`. Les onglets des signalements et des ressources portent une
 * pastille avec le nombre d'éléments en attente ; sur téléphone, une ligne sous les onglets rappelle les cas en
 * attente des autres onglets, que la rangée qui défile peut cacher.
 * Mise en page commune avec l'administration : `StaffPageLayout` (onglets en colonne sur ordinateur, en rangée en haut
 * de la page sur téléphone).
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { AlertTriangle, BookOpen, FileText, Layout, MessageSquare, Trophy, Users, UserX } from "lucide-react";
import { Skeleton } from "@bbfrance/ui";
import StaffPageLayout from "@/common/components/StaffPageLayout/StaffPageLayout";
import LogsTab from "./component/LogsTab";
import ReportsTab from "./component/ReportsTab";
import BannedUsersTab from "./component/BannedUsersTab";
import ResourceModerationTab from "./component/ResourceModerationTab";
import { isModerator } from "@/lib/roles";
import { getModerationSummaryCounts } from "./actions";

const TABS = [
  { id: "logs", label: "Journal d'audit", icon: FileText },
  { id: "reports_post", label: "Messages signalés", icon: MessageSquare },
  { id: "reports_topic", label: "Sujets signalés", icon: AlertTriangle },
  { id: "reports_user", label: "Coachs signalés", icon: Users },
  { id: "reports_article", label: "Articles signalés", icon: BookOpen },
  { id: "reports_ligue", label: "Ligues signalées", icon: Trophy },
  { id: "reports_user_banned", label: "Coachs bannis", icon: UserX },
  { id: "resources_validation", label: "Ressources à valider", icon: Layout },
  { id: "users", label: "Membres (page à part)", icon: Users },
] as const;

/** Onglets qui portent des cas en attente, dans l'ordre de la colonne : le premier non vide s'ouvre par défaut. */
const PENDING_TABS = ["reports_post", "reports_topic", "reports_user", "reports_article", "reports_ligue", "resources_validation"] as const;

/** Libellé court d'un onglet dans le rappel des cas en attente (téléphone). */
const SHORT_LABELS: Record<(typeof PENDING_TABS)[number], [string, string]> = {
  reports_post: ["message", "messages"],
  reports_topic: ["sujet", "sujets"],
  reports_user: ["coach", "coachs"],
  reports_article: ["article", "articles"],
  reports_ligue: ["ligue", "ligues"],
  resources_validation: ["ressource", "ressources"],
};

type ModerationTab = (typeof TABS)[number]["id"];

/** Onglets de signalement : type de contenu signalé et titre de la liste. */
const REPORT_TABS = {
  reports_post: { type: "POST", title: "Signalements de messages" },
  reports_topic: { type: "TOPIC", title: "Signalements de sujets" },
  reports_user: { type: "USER", title: "Signalements de coachs" },
  reports_article: { type: "ARTICLE", title: "Signalements d'articles" },
  reports_ligue: { type: "LIGUE", title: "Signalements de ligues" },
} as const;

/**
 * Onglet ouvert. « Membres » n'a pas de contenu ici (c'est un lien vers /membres) : `?tab=users` ouvre le journal.
 * Sans paramètre, le premier onglet qui a des cas en attente ; `null` tant que les compteurs ne sont pas lus.
 */
const sanitizeTab = (tab: string | null, counts: Record<string, number> | null): ModerationTab | null => {
  if (tab === null) {
    if (!counts) return null;
    return PENDING_TABS.find((id) => (counts[id] ?? 0) > 0) ?? "logs";
  }
  return TABS.find((t) => t.id === tab && t.id !== "users")?.id ?? "logs";
};

export default function ModerationPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // Visiteur non connecté : page de connexion du site, qui le ramènera ici ensuite
      redirect(`/auth/login?callbackUrl=${encodeURIComponent("/moderation")}`);
    },
  });

  const searchParams = useSearchParams();
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const activeTab = sanitizeTab(searchParams.get("tab"), counts);

  const fetchCounts = async () => {
    const res = await getModerationSummaryCounts();
    setCounts(res ?? {});
  };

  useEffect(() => {
    if (status === "loading") return;
    const userRole = session?.user?.role;
    if (!isModerator(userRole)) {
      redirect("/");
    }
    getModerationSummaryCounts().then((res) => setCounts(res ?? {}));
  }, [session, status]);

  const userRole = session?.user?.role;
  const tabs = TABS.map((tab) => {
    const Icon = tab.icon;
    return {
      label: tab.label,
      href: tab.id === "users" ? "/membres" : `/moderation?tab=${tab.id}`,
      active: tab.id === activeTab,
      count: counts?.[tab.id],
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

  const report = activeTab && activeTab in REPORT_TABS ? REPORT_TABS[activeTab as keyof typeof REPORT_TABS] : null;
  // Téléphone : cas en attente des autres onglets, visibles sans ouvrir le tiroir des onglets
  const otherPending = PENDING_TABS.filter((id) => id !== activeTab && (counts?.[id] ?? 0) > 0);

  return (
    <StaffPageLayout {...layoutProps} contentLabel={TABS.find((t) => t.id === activeTab)?.label}>
      {otherPending.length > 0 && (
        <div className="-my-2 flex flex-wrap items-center gap-x-4 text-[0.95rem] text-bb-text-muted lg:hidden">
          <span>En attente aussi :</span>
          {otherPending.map((id) => (
            <Link
              key={id}
              href={`/moderation?tab=${id}`}
              scroll={false}
              className="inline-flex min-h-11 items-center font-semibold text-bb-accent-text underline underline-offset-2"
            >
              {counts?.[id]} {SHORT_LABELS[id][(counts?.[id] ?? 0) > 1 ? 1 : 0]}
            </Link>
          ))}
        </div>
      )}
      {activeTab === null && <Skeleton className="h-96 w-full" />}
      {activeTab === "logs" && <LogsTab userRole={userRole} />}
      {report && <ReportsTab key={report.type} type={report.type} title={report.title} onActionSuccess={fetchCounts} />}
      {activeTab === "reports_user_banned" && <BannedUsersTab />}
      {activeTab === "resources_validation" && <ResourceModerationTab onActionSuccess={fetchCounts} />}
    </StaffPageLayout>
  );
}
