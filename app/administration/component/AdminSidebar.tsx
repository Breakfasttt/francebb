"use client";

import { Database, DatabaseBackup, Globe, LayoutList, OctagonAlert, ShieldCheck, Users } from "lucide-react";
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
    { id: "general", label: "Paramètres Généraux", icon: <Globe size={18} /> },
    { id: "roles", label: "Liste des Rôles", icon: <ShieldCheck size={18} /> },
    { id: "coachs", label: "Rôles des Membres", icon: <Users size={18} /> },
    { id: "structure", label: "Structure du Forum", icon: <LayoutList size={18} /> },
    { id: "reference", label: "Données de Référence", icon: <Database size={18} /> },
  ];

  const adminTabs: TabItem[] = [
    { id: "backup", label: "Sauvegardes (BDD)", icon: <DatabaseBackup size={18} /> },
    { id: "reset", label: "Zone de Danger", icon: <OctagonAlert size={18} /> },
  ];

  return (
    <PremiumCard as="aside" className="profile-sidebar-wrapper">
      <h2 className="sidebar-title">
        Tableau de bord
      </h2>

      <TabSystem 
        items={standardTabs}
        activeTab={activeTab}
        onTabChange={(id) => onTabChange(id as AdminTab)}
        orientation="vertical"
        variant="sidebar"
      />

      {isSuperAdmin && (
        <>
          <div className="sidebar-separator"></div>
          <TabSystem 
            items={adminTabs}
            activeTab={activeTab}
            onTabChange={(id) => onTabChange(id as AdminTab)}
            orientation="vertical"
            variant="sidebar"
            className="admin-tabs"
          />
        </>
      )}

      <style jsx>{`
        .profile-sidebar-wrapper {
          display: flex;
          flex-direction: column;
          padding: 2.2rem 1.5rem;
          width: 320px;
          flex-shrink: 0;
          position: sticky;
          top: 6.5rem;
          align-self: flex-start;
        }
        .sidebar-title {
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 2rem 0;
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center; /* Centrage du titre */
          gap: 0.6rem;
          font-weight: 800;
          opacity: 0.9;
        }
        .sidebar-separator {
          margin: 2rem 0;
          border-top: 1px solid var(--glass-border);
          opacity: 0.3;
        }
        :global(.tab-system.sidebar.vertical) {
          gap: 0.8rem; /* Plus d'espace entre les boutons */
          padding: 0 0.5rem; /* Marge pour ne pas coller aux bords de la carte */
        }
        :global(.admin-tabs .tab-item.active) {
            border-color: #ef4444;
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
        }
        :global(.admin-tabs .tab-item:not(.active)) {
            color: #ef4444;
            opacity: 0.7;
        }
      `}</style>
    </PremiumCard>
  );
}
