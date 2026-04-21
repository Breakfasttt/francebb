"use client";

import MobilePortal from "@/common/components/MobilePortal/MobilePortal";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import TabSystem, { TabItem } from "@/common/components/TabSystem/TabSystem";
import { useIsMobile } from "@/common/hooks/useIsMobile";
import { BookOpen, Database, DatabaseBackup, Globe, LayoutList, Mail, OctagonAlert, Settings, ShieldCheck, Users, Wrench } from "lucide-react";

export type AdminTab = "general" | "coachs" | "roles" | "structure" | "backup" | "reset" | "reference" | "howtoplay" | "info-mails";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  isSuperAdmin?: boolean;
}

export default function AdminSidebar({ activeTab, onTabChange, isSuperAdmin = false }: AdminSidebarProps) {
  const isMobile = useIsMobile();

  const standardTabs: TabItem[] = [
    { id: "general", label: "Configuration", icon: <Globe size={18} /> },
    { id: "roles", label: "Gestion des Rôles", icon: <ShieldCheck size={18} /> },
    { id: "coachs", label: "Membres & Accès", icon: <Users size={18} /> },
    { id: "structure", label: "Structure Forum", icon: <LayoutList size={18} /> },
    { id: "reference", label: "Données de Référence", icon: <Database size={18} /> },
    { id: "howtoplay", label: "Guide du Débutant", icon: <BookOpen size={18} /> },
    { id: "info-mails", label: "Annonces Email", icon: <Mail size={18} /> },
  ];

  const advancedTabs: TabItem[] = [
    { id: "backup", label: "Sauvegardes (BDD)", icon: <DatabaseBackup size={18} /> },
    { id: "reset", label: "Zone de Danger", icon: <OctagonAlert size={18} /> },
  ];

  // --- MOBILE : rendu léger, inline styles pour éviter conflits CSS ---
  if (isMobile) {
    return (
      <MobilePortal targetId="mobile-page-sidebar-slot">
        <div className="admin-sidebar-mobile">
          <TabSystem
            items={standardTabs}
            activeTab={activeTab}
            onTabChange={(id) => onTabChange(id as AdminTab)}
            orientation="vertical"
            variant="sidebar"
            noPortal={true}
          />

          {isSuperAdmin && (
            <>
              <div className="admin-sidebar-mobile-separator" />
              <TabSystem
                items={advancedTabs}
                activeTab={activeTab}
                onTabChange={(id) => onTabChange(id as AdminTab)}
                orientation="vertical"
                variant="sidebar"
                className="danger-tabs"
                noPortal={true}
              />
            </>
          )}
        </div>
      </MobilePortal>
    );
  }

  // --- DESKTOP : rendu complet avec PremiumCard ---
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
          color: var(--text-muted);
          letter-spacing: 1.5px;
          margin: 1rem 0 0.5rem 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          opacity: 0.6;
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

        :global(.danger-tabs .tab-item) {
            border-color: rgba(185, 28, 28, 0.3) !important;
            color: rgba(185, 28, 28, 0.8) !important;
            background: rgba(185, 28, 28, 0.05) !important;
        }

        :global(.danger-tabs .tab-item .tab-icon) {
            color: var(--danger) !important;
        }

        :global(.danger-tabs .tab-item.active) {
            background: var(--btn-danger-bg) !important;
            color: white !important;
            border-color: var(--btn-danger-bg) !important;
            box-shadow: 0 4px 15px rgba(185, 28, 28, 0.3) !important;
            opacity: 1 !important;
        }

        :global(.danger-tabs .tab-item.active .tab-icon) {
            color: white !important;
        }
 
        :global(.danger-tabs .tab-item:hover:not(.active)) {
            background: var(--btn-danger-bg) !important;
            color: white !important;
            border-color: var(--btn-danger-bg) !important;
            opacity: 1 !important;
        }

        :global(.danger-tabs .tab-item:hover:not(.active) .tab-icon) {
            color: white !important;
        }

        .danger-label {
            color: var(--danger);
            font-weight: 800;
            opacity: 1;
            margin-top: 2.5rem;
        }
      `}</style>
    </PremiumCard>
  );
}
