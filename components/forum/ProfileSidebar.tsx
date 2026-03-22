"use client";

import { User } from "@prisma/client";
import { User as UserIcon, MapPin, Trophy, MessageSquare, Shield, AlertTriangle, Ban, UserCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleBanUser } from "@/app/profile/actions";
import Modal from "@/components/Modal";

interface ProfileSidebarProps {
  user: any;
  postCount: number;
  isOwnProfile: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isModerator?: boolean;
}

export default function ProfileSidebar({ 
  user, 
  postCount, 
  isOwnProfile, 
  activeTab, 
  onTabChange,
  isModerator = false
}: ProfileSidebarProps) {
  const [isPending, startTransition] = useTransition();
  const [showBanModal, setShowBanModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleToggleBan = () => {
    startTransition(async () => {
      await toggleBanUser(user.id);
      setShowBanModal(false);
    });
  };

  const navItems = isOwnProfile ? [
    { id: "activity", label: "Activité du forum", icon: <MessageSquare size={18} /> },
    { id: "palmares", label: "Palmarès NAF", icon: <Trophy size={18} /> },
    { id: "pm", label: "Messages privés", icon: <MessageSquare size={18} /> },
    { id: "edit", label: "Éditer mon profil", icon: <UserIcon size={18} /> },
  ] : [
    { id: "activity", label: "Activité du forum", icon: <MessageSquare size={18} /> },
    ...(user.nafNumber ? [{ id: "palmares", label: "Palmarès NAF", icon: <Trophy size={18} /> }] : []),
  ];

  const regionLabels: Record<string, string> = {
    "IDF": "R1 - Île-de-France",
    "Nord-Ouest": "R2 - Nord-Ouest",
    "Nord-Est": "R3 - Nord-Est",
    "Sud-Est": "R4 - Sud-Est",
    "Sud-Ouest": "R5 - Sud-Ouest",
  };

  return (
    <div className="profile-sidebar-wrapper">
      <div className="premium-card profile-summary-box">
        {user.isBanned && (
          <div className="banned-badge">
            <Ban size={14} /> <span>BANNI</span>
          </div>
        )}
        
        <div className="profile-avatar-container">
          {user.image ? (
            <img src={user.image} alt={user.name || ""} className="profile-avatar-large" />
          ) : (
            <div className="profile-avatar-placeholder">
              <UserIcon size={48} />
            </div>
          )}
        </div>

        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-role">{user.role || "COACH"}</p>

        <div className="profile-stats-grid">
          <div className="stat-item">
            <span className="stat-label">NAF</span>
            <span className="stat-value">
              {user.nafNumber ? (
                <a 
                  href={`https://member.thenaf.net/index.php?module=NAF&type=coachpage&coach=${user.nafNumber}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                >
                  {user.nafNumber}
                </a>
              ) : "—"}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Messages</span>
            <span className="stat-value">{postCount}</span>
          </div>
        </div>

        <div className="profile-info-list">
          {user.region && (
            <div className="info-item">
              <MapPin size={16} />
              <span>{regionLabels[user.region] || user.region}</span>
            </div>
          )}
          {user.league && (
            <div className="info-item">
              <Shield size={16} />
              <span>{user.league}</span>
            </div>
          )}
        </div>

        {!isOwnProfile && (
          <div className="profile-actions">
            <button 
              onClick={() => setShowReportModal(true)}
              className="action-button secondary-btn full-width"
            >
              <AlertTriangle size={16} />
              <span>Signaler</span>
            </button>

            {isModerator && (
              <button 
                onClick={() => setShowBanModal(true)}
                className={`action-button full-width ${user.isBanned ? 'success-btn' : 'danger-btn'}`}
                disabled={isPending}
              >
                {user.isBanned ? <UserCheck size={16} /> : <Ban size={16} />}
                <span>{user.isBanned ? "Débannir" : "Bannir"}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="premium-card profile-nav-box">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <Modal 
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        onConfirm={handleToggleBan}
        title={user.isBanned ? "Débannir l'utilisateur" : "Bannir l'utilisateur"}
        message={user.isBanned 
          ? `Voulez-vous vraiment débannir ${user.name} ?` 
          : `Voulez-vous vraiment bannir ${user.name} ? Il ne pourra plus poster sur le forum.`
        }
      />

      <Modal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onConfirm={() => setShowReportModal(false)} // Simulation for now
        title="Signaler le profil"
        message={`Voulez-vous vraiment signaler le profil de ${user.name} aux modérateurs ?`}
      />

      <style jsx>{`
        .profile-sidebar-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 300px;
          flex-shrink: 0;
        }
        .profile-summary-box {
          position: relative;
          padding: 2rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .banned-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #ef4444;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
        .profile-avatar-container {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          padding: 4px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          margin-bottom: 1.5rem;
        }
        .profile-avatar-large {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid var(--glass-bg);
        }
        .profile-avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #555;
          border: 4px solid var(--glass-bg);
        }
        .profile-name {
          margin: 0;
          font-size: 1.5rem;
          letter-spacing: -0.02em;
        }
        .profile-role {
          margin: 0.2rem 0 1.5rem 0;
          font-size: 0.8rem;
          color: var(--primary);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .profile-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: #555;
          font-weight: 800;
        }
        .stat-value {
          font-size: 1.2rem;
          font-weight: 600;
          color: #eee;
        }
        .profile-info-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          width: 100%;
          margin-bottom: 1.5rem;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-size: 0.9rem;
          color: #aaa;
        }
        .profile-actions {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          width: 100%;
        }
        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .full-width { width: 100%; }
        .success-btn { background: #22c55e; color: white; border: none; }
        .danger-btn { background: #ef4444; color: white; border: none; }
        
        .profile-nav-box {
          padding: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: #888;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .nav-item:hover {
          background: rgba(255,255,255,0.03);
          color: #ccc;
        }
        .nav-item.active {
          background: rgba(194, 29, 29, 0.1);
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
