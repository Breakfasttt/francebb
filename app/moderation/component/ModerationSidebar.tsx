"use client";

import { FileText, MessageSquare, AlertTriangle, Users, BookOpen, Trophy, Info, UserX, Layout } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import TabSystem, { TabItem } from "@/common/components/TabSystem/TabSystem";

export type ModerationTab = 
  | "logs" 
  | "users"
  | "reports_post" 
  | "reports_topic" 
  | "reports_user" 
  | "reports_article" 
  | "reports_ligue"
  | "reports_user_banned"
  | "resources_validation";

interface ModerationSidebarProps {
  activeTab: ModerationTab;
  onTabChange: (tab: ModerationTab) => void;
  counts?: { [key: string]: number };
}

export default function ModerationSidebar({ activeTab, onTabChange, counts }: ModerationSidebarProps) {
  const tabs: TabItem[] = [
    { id: "logs", label: "Journal d'audit", icon: <FileText size={18} /> },
    { id: "users", label: "Utilisateurs", icon: <Users size={18} /> },
    { id: "reports_post", label: "Messages signalés", icon: <MessageSquare size={18} />, badge: counts?.reports_post },
    { id: "reports_topic", label: "Sujets signalés", icon: <AlertTriangle size={18} />, badge: counts?.reports_topic },
    { id: "reports_user", label: "Coachs signalés", icon: <Users size={18} />, badge: counts?.reports_user },
    { id: "reports_article", label: "Articles signalés", icon: <BookOpen size={18} />, badge: counts?.reports_article },
    { id: "reports_ligue", label: "Ligues signalées", icon: <Trophy size={18} />, badge: counts?.reports_ligue },
    { id: "reports_user_banned", label: "Coachs bannis", icon: <UserX size={18} /> },
    { id: "resources_validation", label: "Validation Ressources", icon: <Layout size={18} />, badge: counts?.resources_validation },
  ];

  return (
    <PremiumCard as="aside" className="moderation-sidebar-wrapper">
      <h2 className="sidebar-title">
        <Info size={20} />
        Modération
      </h2>

      <TabSystem 
        items={tabs}
        activeTab={activeTab}
        onTabChange={(id) => onTabChange(id as ModerationTab)}
        orientation="vertical"
        variant="sidebar"
      />

      <style jsx>{`
        :global(.moderation-sidebar-wrapper) {
          display: flex;
          flex-direction: column;
          padding: 2.5rem 1.5rem !important;
          width: 320px;
          flex-shrink: 0;
          position: sticky;
          top: 7rem;
          align-self: flex-start;
          min-height: 400px;
        }
        :global(.moderation-sidebar-wrapper) .sidebar-title {
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin: 0 0 2rem 0;
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          font-weight: 800;
          opacity: 0.9;
        }
        :global(.tab-system.sidebar.vertical) {
          gap: 0.8rem;
          padding: 0 0.5rem;
        }
      `}</style>
    </PremiumCard>
  );
}
