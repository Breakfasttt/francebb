"use client";

import { toggleBanUser, toggleBlockUser } from "@/app/profile/actions";
import Modal from "@/common/components/Modal/Modal";
import UserAvatar from "@/common/components/UserAvatar/UserAvatar";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import StatusBadge from "@/common/components/StatusBadge/StatusBadge";
import StatItem from "@/common/components/StatItem/StatItem";
import TabSystem from "@/common/components/TabSystem/TabSystem";
import { Activity, AlertTriangle, Ban, Bookmark, MapPin, MessageSquare, Shield, Trophy, UserCheck, User as UserIcon, FileText, UserX, Layout } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import ProfileArticles from "@/app/profile/component/ProfileArticles";
import ReportModal from "@/common/components/ReportModal/ReportModal";
import ClassicButton from "@/common/components/Button/ClassicButton";
import AdminButton from "@/common/components/Button/AdminButton";
import DangerButton from "@/common/components/Button/DangerButton";
import { isModerator as checkIsModerator } from "@/lib/roles";
import "../page.css";

interface ProfileSidebarProps {
  user: any;
  postCount: number;
  isOwnProfile: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isModerator?: boolean;
  onContact?: () => void;
  isBlockedInitial?: boolean;
}

export default function ProfileSidebar({
  user,
  postCount,
  isOwnProfile,
  activeTab,
  onTabChange,
  isModerator = false,
  onContact,
  isBlockedInitial = false
}: ProfileSidebarProps) {
  const [isPending, startTransition] = useTransition();
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(isBlockedInitial);

  useEffect(() => {
    setIsBlocked(isBlockedInitial);
  }, [isBlockedInitial]);

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
    if (!user.isBanned && !banReason.trim()) {
      alert("Une raison est obligatoire pour bannir un utilisateur.");
      return;
    }

    startTransition(async () => {
      await toggleBanUser(user.id, banReason.trim());
      setShowBanModal(false);
      setBanReason("");
    });
  };

  const handleToggleBlock = () => {
    startTransition(async () => {
      try {
        const res = await toggleBlockUser(user.id);
        setIsBlocked(res.isBlocked);
        setShowBlockModal(false);
      } catch (err: any) {
        alert(err.message);
        setShowBlockModal(false);
      }
    });
  };

  const navItems = (isOwnProfile ? [
    { id: "followed", label: "Sujets suivis", icon: <Bookmark size={18} /> },
    { id: "activity", label: "Activité du forum", icon: <Activity size={18} /> },
    { id: "articles", label: "Mes articles", icon: <FileText size={18} /> },
    { id: "ressources", label: "Mes ressources", icon: <Layout size={18} /> },
    { id: "pm", label: "Messages privés", icon: <MessageSquare size={18} /> },
    { id: "blocked", label: "Utilisateurs bloqués", icon: <UserX size={18} /> },
    { id: "edit", label: "Éditer mon profil", icon: <UserIcon size={18} /> },
    { id: "settings", label: "Gérer mon compte", icon: <Shield size={18} /> },
  ] : [
    { id: "activity", label: "Activité du forum", icon: <Activity size={18} /> },
    { id: "articles", label: "Articles", icon: <FileText size={18} /> },
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

        {(user.region || user.equipe || (user.ligues && user.ligues.length > 0) || user.ligueCustom) && (
          <div className="profile-info-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', marginTop: '1rem' }}>
             {user.region && (
               <StatItem variant="horizontal" label="Région" value={regionLabels[user.region] || user.region} icon={<MapPin size={16} />} />
             )}
             {user.equipe && (
               <StatItem variant="horizontal" label="Équipe" value={user.equipe} icon={<Trophy size={16} />} />
             )}
             
             {((user.ligues && user.ligues.length > 0) || user.ligueCustom) && (
               <div className="stat-item-container horizontal" style={{ alignItems: 'flex-start' }}>
                 <span className="stat-icon" style={{ marginTop: '2px' }}><Shield size={16} /></span>
                 <div className="stat-content" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                   <span className="stat-label">Ligues</span>
                   <div className="multi-ligue-display" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                     {/* Ligues référencées */}
                     {user.ligues?.map((ligue: any) => (
                       <Link 
                         key={ligue.id} 
                         href={`/ligue/${ligue.id}`} 
                         title={ligue.name}
                         style={{ 
                           fontSize: '0.7rem', 
                           background: 'var(--primary-transparent)', 
                           color: 'var(--primary)', 
                           padding: '0.2rem 0.6rem', 
                           borderRadius: '6px', 
                           textDecoration: 'none',
                           fontWeight: 800,
                           border: '1px solid var(--primary)',
                           whiteSpace: 'nowrap'
                         }}
                       >
                         {ligue.acronym || ligue.name}
                       </Link>
                     ))}
                     
                     {/* Ligues personnalisées */}
                     {user.ligueCustom?.split(',').map((s: string) => s.trim()).filter(Boolean).map((custom: string, idx: number) => (
                       <span 
                         key={`custom-${idx}`}
                         style={{ 
                           fontSize: '0.7rem', 
                           background: 'rgba(255, 255, 255, 0.05)', 
                           color: 'var(--text-muted)', 
                           padding: '0.2rem 0.6rem', 
                           borderRadius: '6px', 
                           fontWeight: 700,
                           border: '1px solid var(--glass-border)',
                           fontStyle: 'italic',
                           whiteSpace: 'nowrap'
                         }}
                       >
                         {custom}
                       </span>
                     ))}
                   </div>
                 </div>
               </div>
             )}
          </div>
        )}

        {!isOwnProfile && (
          <div className="profile-actions-column">
            {onContact && (
              <ClassicButton onClick={onContact} icon={MessageSquare} fullWidth>
                Message privé
              </ClassicButton>
            )}
            <ClassicButton onClick={() => setShowReportModal(true)} icon={AlertTriangle} fullWidth>
              Signaler
            </ClassicButton>
            {!checkIsModerator(user.role) && (
              <ClassicButton 
                onClick={() => setShowBlockModal(true)} 
                isLoading={isPending}
                icon={UserX}
                fullWidth
                style={{ 
                  background: isBlocked ? "var(--success)" : undefined,
                  color: isBlocked ? "white" : undefined,
                  borderColor: isBlocked ? "var(--success)" : undefined
                }}
              >
                {isBlocked ? "Débloquer" : "Bloquer"}
              </ClassicButton>
            )}
            {isModerator && (
              <AdminButton
                onClick={() => setShowBanModal(true)}
                isLoading={isPending}
                icon={user.isBanned ? UserCheck : Ban}
                fullWidth
                style={{ 
                  background: user.isBanned ? "#2E7D32" : "#ef4444", 
                  color: "white",
                  borderColor: user.isBanned ? "#2E7D32" : "#ef4444"
                }}
              >
                {user.isBanned ? "Débannir" : "Bannir"}
              </AdminButton>
            )}
          </div>
        )}
      </PremiumCard>

      <Modal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        onConfirm={handleToggleBan}
        title={user.isBanned ? "Débannir l'utilisateur" : "Bannir l'utilisateur"}
        variant={user.isBanned ? "primary" : "danger"}
      >
        <p style={{ marginBottom: user.isBanned ? '0' : '1.5rem' }}>
          {user.isBanned 
            ? `Voulez-vous vraiment débannir ${user.name} ?` 
            : `Voulez-vous vraiment bannir ${user.name} ? Veuillez indiquer un motif.`}
        </p>

        {!user.isBanned && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', opacity: 0.7, fontWeight: 600 }}>Raison du bannissement</label>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Ex: Spam, propos inappropriés..."
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '0.8rem',
                color: 'white',
                minHeight: '80px',
                outline: 'none',
                resize: 'none'
              }}
              autoFocus
            />
          </div>
        )}
      </Modal>

      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={user.id}
        targetType="USER"
        itemTitle={user.name}
      />

      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleToggleBlock}
        title={isBlocked ? "Débloquer l'utilisateur" : "Bloquer l'utilisateur"}
        message={isBlocked 
          ? `Voulez-vous vraiment débloquer ${user.name} ? Ses messages seront de nouveau visibles.` 
          : `Voulez-vous vraiment bloquer ${user.name} ? Ses messages seront masqués et il ne pourra plus vous contacter.`}
      />

      {/* Les styles sont maintenant dans app/profile/page.css pour garantir leur application globale */}
    </div>
  );
}
