"use client";

import { DatabaseBackup, LayoutList, OctagonAlert, ShieldCheck, Users } from "lucide-react";

export type AdminTab = "coachs" | "roles" | "structure" | "backup" | "reset";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  isSuperAdmin?: boolean;
}

export default function AdminSidebar({ activeTab, onTabChange, isSuperAdmin = false }: AdminSidebarProps) {
  return (
    <aside className="premium-card profile-sidebar-wrapper">
      <h2 style={{ fontSize: '1.2rem', margin: '0 0 1.5rem 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Tableau de bord
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={() => onTabChange("roles")}
          className={`action-button full-width ${activeTab === "roles" ? 'primary-btn' : 'secondary-btn'}`}
          style={{ justifyContent: 'flex-start' }}
        >
          <ShieldCheck size={18} /> <span>Liste des Rôles</span>
        </button>
        <button
          onClick={() => onTabChange("coachs")}
          className={`action-button full-width ${activeTab === "coachs" ? 'primary-btn' : 'secondary-btn'}`}
          style={{ justifyContent: 'flex-start' }}
        >
          <Users size={18} /> <span>Rôles des Membres</span>
        </button>
        <button
          onClick={() => onTabChange("structure")}
          className={`action-button full-width ${activeTab === "structure" ? 'primary-btn' : 'secondary-btn'}`}
          style={{ justifyContent: 'flex-start' }}
        >
          <LayoutList size={18} /> <span>Structure du Forum</span>
        </button>
      </div>

      {isSuperAdmin && (
        <>
          <div style={{ margin: '2rem 0 1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => onTabChange("backup")}
              className={`action-button full-width ${activeTab === "backup" ? 'primary-btn' : 'secondary-btn'}`}
              style={{ justifyContent: 'flex-start' }}
            >
              <DatabaseBackup size={18} /> <span>Sauvegardes (BDD)</span>
            </button>
            <button
              onClick={() => onTabChange("reset")}
              className={`action-button full-width ${activeTab === "reset" ? 'danger-btn' : 'secondary-btn'}`}
              style={{ justifyContent: 'flex-start', ...(activeTab !== "reset" && { color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }) }}
            >
              <OctagonAlert size={18} /> <span>Zone de Danger</span>
            </button>
          </div>
        </>
      )}


      <style jsx>{`
        .profile-sidebar-wrapper {
          display: flex;
          flex-direction: column;
          padding: 2rem;
          width: 300px;
          flex-shrink: 0;
        }
        .action-button {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .full-width { width: 100%; }
        .primary-btn { 
          background: rgba(194, 29, 29, 0.2); 
          color: var(--primary); 
          border: 1px solid var(--primary); 
        }
        .secondary-btn { 
          background: rgba(255,255,255,0.02); 
          color: #888; 
          border: 1px solid var(--glass-border); 
        }
        .secondary-btn:hover { 
          background: rgba(255,255,255,0.05); 
          color: #ccc; 
        }
        .danger-btn { 
          background: #ef4444; 
          color: white; 
          border: 1px solid #ef4444; 
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
        }
      `}</style>
    </aside>
  );
}
