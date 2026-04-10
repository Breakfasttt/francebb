"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import ModerationSidebar, { ModerationTab } from "./component/ModerationSidebar";
import LogsTab from "./component/LogsTab";
import ReportsTab from "./component/ReportsTab";
import BannedUsersTab from "./component/BannedUsersTab";
import ResourceModerationTab from "./component/ResourceModerationTab";
import { isModerator } from "@/lib/roles";
import { getModerationSummaryCounts } from "./actions";

import "./page.css";
import "./page-mobile.css";


export default function ModerationPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin?callbackUrl=/moderation");
    },
  });

  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as ModerationTab;
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<ModerationTab>("logs");
  const [counts, setCounts] = useState<any>({});

  const fetchCounts = async () => {
    const res = await getModerationSummaryCounts();
    if (res) setCounts(res);
  };

  useEffect(() => {
    if (status === "loading") return;
    const userRole = (session?.user as any)?.role;
    if (!isModerator(userRole)) {
      redirect("/");
    }
    fetchCounts();
  }, [session, status]);

  useEffect(() => {
    const validTabs: ModerationTab[] = ["logs", "users", "reports_post", "reports_topic", "reports_user", "reports_article", "reports_ligue", "reports_user_banned", "resources_validation"];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: ModerationTab) => {
    if (tab === "users") {
      router.push("/membres");
      return;
    }
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (status === "loading") {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;
  if (!isModerator(userRole)) return null;

  return (
    <main className="container moderation-container">
      <PageHeader 
        title={<><span>Modération</span></>}
        subtitle="Suivi des signalements et audit des actions"
        backHref="/"
        backTitle="Retour à l'accueil"
      />

      <div className="moderation-content-layout">
        <ModerationSidebar activeTab={activeTab} onTabChange={handleTabChange} counts={counts} />

        <div className="moderation-main-content">
          {activeTab === "logs" && (
            <LogsTab userRole={userRole} />
          )}

          {activeTab === "reports_post" && (
            <ReportsTab type="POST" title="Signalements de messages" onActionSuccess={fetchCounts} />
          )}

          {activeTab === "reports_topic" && (
            <ReportsTab type="TOPIC" title="Signalements de sujets" onActionSuccess={fetchCounts} />
          )}

          {activeTab === "reports_user" && (
            <ReportsTab type="USER" title="Signalements de coachs" onActionSuccess={fetchCounts} />
          )}

          {activeTab === "reports_article" && (
            <ReportsTab type="ARTICLE" title="Signalements d'articles" onActionSuccess={fetchCounts} />
          )}

          {activeTab === "reports_ligue" && (
            <ReportsTab type="LIGUE" title="Signalements de ligues" onActionSuccess={fetchCounts} />
          )}

          {activeTab === "reports_user_banned" && (
            <BannedUsersTab />
          )}

          {activeTab === "resources_validation" && (
            <ResourceModerationTab onActionSuccess={fetchCounts} />
          )}
        </div>
      </div>
    </main>
  );
}
