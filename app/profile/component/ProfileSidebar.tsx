"use client";

import { toggleBanUser } from "@/app/profile/actions";
import Modal from "@/common/components/Modal/Modal";
import UserAvatar from "@/common/components/UserAvatar/UserAvatar";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import StatusBadge from "@/common/components/StatusBadge/StatusBadge";
import StatItem from "@/common/components/StatItem/StatItem";
import TabSystem from "@/common/components/TabSystem/TabSystem";
import { Activity, AlertTriangle, Ban, Bookmark, MapPin, MessageSquare, Shield, Trophy, UserCheck, User as UserIcon, FileText } from "lucide-react";
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

  const navItems = (isOwnProfile ? [
    { id: "followed", label: "Sujets suivis", icon: <Bookmark size={18} /> },
    { id: "activity", label: "Activité du forum", icon: <Activity size={18} /> },
    { id: "articles", label: "Mes articles", icon: <FileText size={18} /> },
    { id: "palmares", label: "Palmarès NAF", icon: <Trophy size={18} /> },
    { id: "pm", label: "Messages privés", icon: <MessageSquare size={18} /> },
    { id: "edit", label: "Éditer mon profil", icon: <UserIcon size={18} /> },
    { id: "settings", label: "Gérer mon compte", icon: <Shield size={18} /> },
  ] : [
    { id: "activity", label: "Activité du forum", icon: <Activity size={18} /> },
    { id: "articles", label: "Articles", icon: <FileText size={18} /> },
    ...(user.nafNumber ? [{ id: "palmares", label: "Palmarès NAF", icon: <Trophy size={18} /> }] : []),
  ]).map(item => ({ ...item }));

  const regionLabels: Record<string, string> = {
    "IDF": "R1 - Île-de-France",
    "Nord-Ouest": "R2 - Nord-Ouest",
    "Nord-Est": "R3 - Nord-Est",
    "Sud-Est": "R4 - Sud-Est",
    "Sud-Ouest": "R5 - Sud-Ouest",
  };

  return (
    <div className="profile-sidebar-wrapper">
      <PremiumCard className="profile-summary-box" noOverflow>
        {user.isBanned && (
           <StatusBadge variant="banned" className="banned-badge" icon={<Ban size={12} />}>
             Banni
           </StatusBadge>
        )}

        {/* TabSystem DOCKÉ À DROITE */}
        <TabSystem 
          items={navItems}
          activeTab={activeTab}
          onTabChange={handleTabClick}
          variant="docked-sidebar"
          showLabels={false}
        />

        <div className="profile-avatar-container">
          <UserAvatar 
            image={user.image} 
            name={user.name} 
            postCount={postCount} 
            size={120} 
            isBanned={user.isBanned}
            selectedRank={user.avatarFrame}
          />
        </div>

        <div className="profile-summary-header">
          <h2 className="profile-name">{user.name}</h2>
          <span className="profile-role-plain">
            {user.role || "COACH"}
          </span>
        </div>

        <div className="profile-stats-grid">
           <StatItem 
              variant="vertical"
              label="NAF" 
              value={user.nafNumber ? (
                <a
                  href={`https://member.thenaf.net/index.php?module=NAF&type=coachpage&coach=${user.nafNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {user.nafNumber}
                </a>
              ) : "—"} 
           />
           <StatItem variant="vertical" label="Messages" value={postCount} />
        </div>

        {(user.region || user.league) && (
          <div className="profile-info-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', marginTop: '1rem' }}>
             {user.region && (
               <StatItem variant="horizontal" label="Région" value={regionLabels[user.region] || user.region} icon={<MapPin size={16} />} />
             )}
             {user.league && (
               <StatItem variant="horizontal" label="Ligue" value={user.league} icon={<Shield size={16} />} />
             )}
          </div>
        )}

        {!isOwnProfile && (
          <div className="profile-actions-column">
            {onContact && (
              <button onClick={onContact} className="action-button primary-btn">
                <MessageSquare size={16} /> <span>Message privé</span>
              </button>
            )}
            <button onClick={() => setShowReportModal(true)} className="action-button secondary-btn">
              <AlertTriangle size={16} /> <span>Signaler</span>
            </button>
            {isModerator && (
              <button
                onClick={() => setShowBanModal(true)}
                className={`action-button ${user.isBanned ? 'success-btn' : 'danger-btn'}`}
                disabled={isPending}
              >
                {user.isBanned ? <UserCheck size={16} /> : <Ban size={16} />}
                <span>{user.isBanned ? "Débannir" : "Bannir"}</span>
              </button>
            )}
          </div>
        )}
      </PremiumCard>

      <Modal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        onConfirm={handleToggleBan}
        title={user.isBanned ? "Débannir l'utilisateur" : "Bannir l'utilisateur"}
        message={user.isBanned ? `Voulez-vous vraiment débannir ${user.name} ?` : `Voulez-vous vraiment bannir ${user.name} ?`}
      />

      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onConfirm={() => setShowReportModal(false)}
        title="Signaler le profil"
        message={`Voulez-vous vraiment signaler le profil de ${user.name} ?`}
      />

      {/* Les styles sont maintenant dans app/profile/page.css pour garantir leur application globale */}
    </div>
  );
}
