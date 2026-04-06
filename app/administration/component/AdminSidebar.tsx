"use client";

import { Database, DatabaseBackup, Globe, LayoutList, OctagonAlert, ShieldCheck, Users, Settings, Wrench } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import TabSystem, { TabItem } from "@/common/components/TabSystem/TabSystem";

export type AdminTab = "general" | "coachs" | "roles" | "structure" | "backup" | "reset" | "reference";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  isSuperAdmin?: boolean;
}

export default function AdminSidebar({ activeTab, onTabChange, isSuperAdmin = false }: AdminSidebarProps) {
  const standardTabs: TabItem[] = [
    { id: "general", label: "Configuration", icon: <Globe size={18} /> },
    { id: "roles", label: "Gestion des Rôles", icon: <ShieldCheck size={18} /> },
    { id: "coachs", label: "Membres & Accès", icon: <Users size={18} /> },
    { id: "structure", label: "Structure Forums", icon: <LayoutList size={18} /> },
    { id: "reference", label: "Données de Référence", icon: <Database size={18} /> },
  ];

  const advancedTabs: TabItem[] = [
    { id: "backup", label: "Sauvegardes (BDD)", icon: <DatabaseBackup size={18} /> },
    { id: "reset", label: "Zone de Danger", icon: <OctagonAlert size={18} /> },
  ];

  return (
    <PremiumCard as="aside" className="admin-sidebar-wrapper">
      <div className="sidebar-header">
        <div className="header-icon">
          <ShieldCheck size={24} />
        </div>
        <div className="header-text">
          <h2 className="sidebar-title">ADMINISTRATION</h2>
          <p className="sidebar-subtitle">Tableau de bord</p>
        </div>
      </div>

      <div className="sidebar-group">
        <h3 className="group-label"><Settings size={14} /> GÉNÉRAL</h3>
        <TabSystem 
          items={standardTabs}
          activeTab={activeTab}
          onTabChange={(id) => onTabChange(id as AdminTab)}
          orientation="vertical"
          variant="sidebar"
        />
      </div>

      {isSuperAdmin && (
        <div className="sidebar-group advanced-group">
          <div className="sidebar-separator"></div>
          <h3 className="group-label danger-label"><Wrench size={14} /> AVANCÉ</h3>
          <TabSystem 
            items={advancedTabs}
            activeTab={activeTab}
            onTabChange={(id) => onTabChange(id as AdminTab)}
            orientation="vertical"
            variant="sidebar"
            className="danger-tabs"
          />
        </div>
      )}

      <style jsx>{`
        :global(.admin-sidebar-wrapper) {
          display: flex;
          flex-direction: column;
          padding: 2.5rem 1.2rem !important;
          width: 320px;
          flex-shrink: 0;
          position: sticky;
          top: 7rem;
          align-self: flex-start;
          min-height: 500px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
          padding: 0 0.5rem;
        }

        .header-icon {
          background: var(--primary-transparent);
          color: var(--primary);
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          border: 1px solid var(--primary);
          box-shadow: 0 0 15px rgba(194, 29, 29, 0.2);
        }

        .sidebar-title {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 0;
          color: var(--primary);
          font-weight: 900;
        }

        .sidebar-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
          font-weight: 500;
        }

        .sidebar-group {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          width: 100%;
        }

        .group-label {
          font-size: 0.7rem;
          font-weight: 800;
          color: #555;
          letter-spacing: 1.5px;
          margin: 1rem 0 0.5rem 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          opacity: 0.8;
        }

        .advanced-group {
          margin-top: 1rem;
        }

        .sidebar-separator {
          height: 1px;
          background: var(--glass-border);
          width: 100%;
          opacity: 0.3;
          margin: 1rem 0;
        }

        :global(.tab-system.sidebar.vertical) {
          gap: 0.6rem;
          padding: 0 0.2rem;
        }

        :global(.danger-tabs .tab-item.active) {
            border-color: #ef4444 !important;
            color: #ef4444 !important;
            background: rgba(239, 68, 68, 0.1) !important;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.15) !important;
        }
        
        :global(.danger-tabs .tab-item:not(.active)) {
            color: #fca5a5;
            opacity: 0.7;
            border-color: rgba(239, 68, 68, 0.1);
        }

        :global(.danger-tabs .tab-item:hover:not(.active)) {
            background: rgba(239, 68, 68, 0.05);
            color: #ef4444;
            opacity: 1;
        }

        .danger-label {
          color: #ef4444;
          opacity: 0.6;
        }
      `}</style>
    </PremiumCard>
  );
}
