"use client";

import { toggleBanUser } from "@/app/profile/actions";
import Modal from "@/common/components/Modal/Modal";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import UserAvatar from "@/common/components/UserAvatar/UserAvatar";
import { Activity, AlertTriangle, Ban, Bookmark, MapPin, MessageSquare, Shield, Trophy, UserCheck, User as UserIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface ProfileSidebarProps {
  user: any;
  postCount: number;
  isOwnProfile: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isModerator?: boolean;
  onContact?: () => void;
}

export default function ProfileSidebar({
  user,
  postCount,
  isOwnProfile,
  activeTab,
  onTabChange,
  isModerator = false,
  onContact
}: ProfileSidebarProps) {
  const [isPending, startTransition] = useTransition();
  const [showBanModal, setShowBanModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabClick = (id: string) => {
    onTabChange(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleToggleBan = () => {
    startTransition(async () => {
      await toggleBanUser(user.id);
      setShowBanModal(false);
    });
  };

  const navItems = isOwnProfile ? [
    { id: "followed", label: "Sujets suivis", icon: <Bookmark size={18} /> },
    { id: "activity", label: "Activité du forum", icon: <Activity size={18} /> },
    { id: "palmares", label: "Palmarès NAF", icon: <Trophy size={18} /> },
    { id: "pm", label: "Messages privés", icon: <MessageSquare size={18} /> },
    { id: "edit", label: "Éditer mon profil", icon: <UserIcon size={18} /> },
    { id: "settings", label: "Gérer mon compte", icon: <Shield size={18} /> },
  ] : [
    { id: "activity", label: "Activité du forum", icon: <Activity size={18} /> },
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

        <div className="profile-avatar-container" id="profile-avatar-debug">
          <UserAvatar 
            image={user.image} 
            name={user.name} 
            postCount={postCount} 
            size={120} 
            isBanned={user.isBanned}
            selectedRank={user.avatarFrame}
          />
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

        {(user.region || user.league) && (
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
        )}

        {!isOwnProfile && (
          <div className="profile-actions">
            {onContact && (
              <button
                onClick={onContact}
                className="action-button primary-btn full-width"
              >
                <MessageSquare size={16} />
                <span>Message privé</span>
              </button>
            )}
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

        {/* Floating Icons Navigation (Docked on the right edge) */}
        <div className="profile-floating-nav">
          {navItems.map((item) => (
            <Tooltip key={item.id} text={item.label} position="right">
              <button
                onClick={() => handleTabClick(item.id)}
                className={`nav-icon-item ${activeTab === item.id ? 'active' : ''}`}
              >
                {item.icon}
              </button>
            </Tooltip>
          ))}
        </div>
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
          position: sticky;
          top: 6.5rem;
          align-self: flex-start;
        }
        .profile-summary-box {
          position: relative;
          padding: 2rem 1.25rem 1.25rem 1.25rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 255px;
          z-index: 2;
          border-top-right-radius: 0;
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
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
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
          margin-bottom: 1rem;
          padding-bottom: 1rem;
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
          gap: 0.4rem;
          width: 100%;
          margin-bottom: 0.4rem;
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
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 1.2rem;
          margin-top: 0.8rem;
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
        .primary-btn { background: var(--primary); color: white; border: none; }
        .secondary-btn { background: rgba(255,255,255,0.05); color: #888; border: 1px solid var(--glass-border); }
        .success-btn { background: #22c55e; color: white; border: none; }
        .danger-btn { background: #ef4444; color: white; border: none; }
        
        .profile-floating-nav {
          position: absolute;
          left: 254px;
          top: -1px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 10px 0;
          width: 46px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          border-left: none;
          border-radius: 0 12px 12px 0;
          box-shadow: 12px 0 30px rgba(0,0,0,0.3);
          z-index: 1;
        }
        .nav-icon-item {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: #888;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-icon-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #ccc;
        }
        .nav-icon-item.active {
          background: rgba(194, 29, 29, 0.2);
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
