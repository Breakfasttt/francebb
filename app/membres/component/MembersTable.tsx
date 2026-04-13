"use client";

import React, { useTransition, useState, useEffect } from "react";
import { ROLE_LABELS, UserRole, canEditTargetRole, getAllowedRolesToAssign, canManageRoles, isModerator, getRoleLabel, getRolePower } from "@/lib/roles";
import { updateUserRole, toggleBanUser, deleteUser } from "@/app/membres/actions";
import Link from "next/link";
import { Mail, Ban, Trash2, CheckCircle2, Search, Shield, Globe, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/common/components/Modal/Modal";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import StatusBadge from "@/common/components/StatusBadge/StatusBadge";
import Pagination from "@/common/components/Pagination/Pagination";
import ClassicButton from "@/common/components/Button/ClassicButton";
import AdminButton from "@/common/components/Button/AdminButton";
import DangerButton from "@/common/components/Button/DangerButton";

import ClassicSelect from "@/common/components/Form/ClassicSelect";
import "./MembersTable.css";

const USERS_PER_PAGE = 25;

interface Props {
  users: any[];
  currentUserRole: UserRole;
  currentUserId: string;
  allLigues: { id: string, name: string, acronym: string }[];
  allRegions: { key: string, label: string }[];
}

export default function MembersTable({ users, currentUserRole, currentUserId, allLigues, allRegions }: Props) {
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedLigue, setSelectedLigue] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [banDetails, setBanDetails] = useState("");
  
  type SortConfig = { key: "name" | "role" | "naf" | "region" | "ligue"; direction: "asc" | "desc" } | null;
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const [roleModal, setRoleModal] = useState<{ isOpen: boolean, userId: string, newRole: UserRole | "", roleLabel: string }>({ isOpen: false, userId: "", newRole: "", roleLabel: "" });
  const [banModal, setBanModal] = useState<{ isOpen: boolean, userId: string, isBanning: boolean, userName: string }>({ isOpen: false, userId: "", isBanning: false, userName: "" });
  const [banReason, setBanReason] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, userId: string, userName: string }>({ isOpen: false, userId: "", userName: "" });

  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedRegion, selectedLigue, sortConfig]);

  const handleRoleSelect = (userId: string, newRole: UserRole) => {
    setRoleModal({ isOpen: true, userId, newRole, roleLabel: ROLE_LABELS[newRole] });
  };

  const confirmRoleChange = () => {
    if (!roleModal.userId || !roleModal.newRole) return;
    startTransition(async () => {
      try {
        await updateUserRole(roleModal.userId, roleModal.newRole as UserRole);
        toast.success("Rôle mis à jour");
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setRoleModal({ isOpen: false, userId: "", newRole: "", roleLabel: "" });
      }
    });
  };

  const handleToggleBanClick = (userId: string, currentBanStatus: boolean, userName: string) => {
    setBanReason("");
    setBanDetails("");
    setBanModal({ isOpen: true, userId, isBanning: !currentBanStatus, userName });
  };

  async function confirmBanToggle() {
    if (banModal.isBanning && !banReason.trim()) {
      toast.error("Veuillez sélectionner une raison");
      return;
    }

    startTransition(async () => {
      try {
        const fullReason = banDetails.trim() 
          ? `[${banReason}] ${banDetails.trim()}` 
          : banReason;

        const res = await toggleBanUser(banModal.userId, banModal.isBanning, fullReason);
        if (res.success) {
          toast.success(banModal.isBanning ? "Utilisateur banni" : "Utilisateur débanni");
          setBanModal(v => ({...v, isOpen: false}));
          setBanReason("");
          setBanDetails("");
          router.refresh();
        }
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de l'opération");
      }
    });
  }

  const handleDeleteClick = (userId: string, userName: string) => {
    setDeleteModal({ isOpen: true, userId, userName });
  };

  const confirmDelete = () => {
    startTransition(async () => {
      try {
        await deleteUser(deleteModal.userId);
        toast.success("Utilisateur supprimé définitivement");
        router.refresh();
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setDeleteModal({ isOpen: false, userId: "", userName: "" });
      }
    });
  };

  const showRoles = canManageRoles(currentUserRole);
  const showMod = isModerator(currentUserRole);
  const showDelete = currentUserRole === "SUPERADMIN";

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "" || u.role === selectedRole;
    const matchesRegion = selectedRegion === "" || u.region === selectedRegion;
    const matchesLigue = selectedLigue === "" || u.ligues?.some((l: any) => l.id === selectedLigue);
    
    return matchesSearch && matchesRole && matchesRegion && matchesLigue;
  });

  const handleSort = (key: "name" | "role" | "naf" | "region" | "ligue") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig) return 0;
    
    if (sortConfig.key === "name") {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return sortConfig.direction === "asc" ? -1 : 1;
      if (nameA > nameB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    }
    
    if (sortConfig.key === "role") {
      const powerA = getRolePower(a.role);
      const powerB = getRolePower(b.role);
      // For roles, higher power first when asc
      if (powerA < powerB) return sortConfig.direction === "asc" ? 1 : -1;
      if (powerA > powerB) return sortConfig.direction === "asc" ? -1 : 1;
      return 0;
    }
    
    if (sortConfig.key === "naf") {
      const nafA = a.nafNumber ? parseInt(a.nafNumber, 10) : Infinity;
      const nafB = b.nafNumber ? parseInt(b.nafNumber, 10) : Infinity;
      
      if (nafA === Infinity && nafB === Infinity) return 0;
      if (nafA < nafB) return sortConfig.direction === "asc" ? -1 : 1;
      if (nafA > nafB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    }

    if (sortConfig.key === "region") {
      const regA = a.region || "";
      const regB = b.region || "";
      if (regA < regB) return sortConfig.direction === "asc" ? -1 : 1;
      if (regA > regB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    }

    if (sortConfig.key === "ligue") {
      const ligA = a.ligues?.[0]?.acronym || "";
      const ligB = b.ligues?.[0]?.acronym || "";
      if (ligA < ligB) return sortConfig.direction === "asc" ? -1 : 1;
      if (ligA > ligB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    }
    
    return 0;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRole("");
    setSelectedRegion("");
    setSelectedLigue("");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(sortedUsers.length / USERS_PER_PAGE);
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  return (
    <PremiumCard className="members-table-card fade-in">
      <div className="members-filter-section">
        <div className="members-search-wrapper">
          <div className="search-input-group">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher un coach par son nom..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="premium-search-input"
            />
          </div>
        </div>

        <div className="members-filters-grid">
          <ClassicSelect 
            label="Rôle"
            icon={<Shield size={14} />}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Tous les rôles</option>
            {Object.entries(ROLE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </ClassicSelect>
      
          <ClassicSelect 
            label="Région"
            icon={<Globe size={14} />}
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="">Toutes les régions</option>
            {allRegions.map(region => (
              <option key={region.key} value={region.key}>{region.label}</option>
            ))}
          </ClassicSelect>
      
          <ClassicSelect 
            label="Ligue"
            icon={<Trophy size={14} />}
            value={selectedLigue}
            onChange={(e) => setSelectedLigue(e.target.value)}
          >
            <option value="">Toutes les ligues</option>
            {allLigues.map(ligue => (
              <option key={ligue.id} value={ligue.id}>[{ligue.acronym}] {ligue.name}</option>
            ))}
          </ClassicSelect>

          <div className="filter-actions">
            <ClassicButton 
              onClick={resetFilters}
              className="reset-btn-full"
            >
              Réinitialiser
            </ClassicButton>
          </div>
        </div>
      </div>

      <div className="members-list-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Utilisateur {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? '↓' : '↑') : ''}
              </th>
              <th onClick={() => handleSort('role')} className="sortable">
                Rôle {sortConfig?.key === 'role' ? (sortConfig.direction === 'asc' ? '↓' : '↑') : ''}
              </th>
              <th onClick={() => handleSort('naf')} className="sortable">
                N°NAF {sortConfig?.key === 'naf' ? (sortConfig.direction === 'asc' ? '↓' : '↑') : ''}
              </th>
              <th onClick={() => handleSort('region')} className="sortable">
                Région {sortConfig?.key === 'region' ? (sortConfig.direction === 'asc' ? '↓' : '↑') : ''}
              </th>
              <th onClick={() => handleSort('ligue')} className="sortable">
                Ligue(s) {sortConfig?.key === 'ligue' ? (sortConfig.direction === 'asc' ? '↓' : '↑') : ''}
              </th>
              <th style={{ textAlign: 'center' }}>MP</th>
              {showRoles && <th>Gestion des Rôles</th>}
              {showMod && <th>Modération</th>}
              {showDelete && <th>Gestion</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? paginatedUsers.map(user => {
              const canEdit = canEditTargetRole(currentUserRole, user.role as UserRole);
              const selectableRoles = getAllowedRolesToAssign(currentUserRole);

              return (
                <tr key={user.id} style={{ opacity: user.isBanned ? 0.5 : 1 }}>
                  <td>
                    <Link href={`/spy/${user.id}`} className="user-cell">
                      {user.image && <img src={user.image} alt="" className="user-avatar-sm" />}
                      <span className="user-name-wrapper">
                        {user.name} {user.isBanned && <StatusBadge variant="banned" icon={<Ban size={10} />}>Banni</StatusBadge>}
                      </span>
                    </Link>
                  </td>
                  <td>
                    <StatusBadge 
                      variant={user.role?.toLowerCase().includes('admin') ? 'admin' : user.role?.toLowerCase().includes('modo') ? 'moderator' : 'coach'}
                    >
                      {getRoleLabel(user.role)}
                    </StatusBadge>
                  </td>
                  <td>
                    {user.nafNumber ? (
                      <a 
                        href={`https://member.thenaf.net/index.php?module=NAF&type=coachpage&coach=${user.nafNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="naf-link"
                      >
                        {user.nafNumber}
                      </a>
                    ) : "—"}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {allRegions.find(r => r.key === user.region)?.label || user.region || "—"}
                  </td>
                  <td>
                    <div className="ligues-list">
                      {user.ligues && user.ligues.length > 0 ? user.ligues.map((l: any) => (
                        <span key={l.id} className="ligue-mini-badge">
                          {l.acronym}
                        </span>
                      )) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {user.id !== currentUserId && !user.isBanned && (
                      <ClassicButton 
                        href={`/profile?tab=pm&recipientId=${user.id}`}
                        icon={Mail}
                        size="sm"
                      >
                        MP
                      </ClassicButton>
                    )}
                  </td>
                  {showRoles && (
                    <td>
                      {canEdit ? (
                        <ClassicSelect 
                          value={user.role}
                          disabled={isPending}
                          onChange={(e) => handleRoleSelect(user.id, e.target.value as UserRole)}
                          size="sm"
                        >
                          <option value={user.role} disabled>Changer le rôle...</option>
                          {selectableRoles.map(role => (
                            <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                          ))}
                        </ClassicSelect>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Verrouillé</span>
                      )}
                    </td>
                  )}
                  {showMod && (
                    <td>
                      {canEditTargetRole(currentUserRole, user.role as UserRole) || currentUserRole === "SUPERADMIN" ? (
                        <AdminButton 
                          onClick={() => handleToggleBanClick(user.id, user.isBanned, user.name)}
                          isLoading={isPending}
                          size="sm"
                          style={{ 
                            background: user.isBanned ? "#22c55e" : "#ef4444", 
                            color: "white",
                            borderColor: user.isBanned ? "#22c55e" : "#ef4444" 
                          }}
                        >
                          {user.isBanned ? <><CheckCircle2 size={14} /> Débannir</> : <><Ban size={14} /> Bannir</>}
                        </AdminButton>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Verrouillé</span>
                      )}
                    </td>
                  )}
                  {showDelete && (
                    <td>
                      <DangerButton 
                        onClick={() => handleDeleteClick(user.id, user.name)}
                        isLoading={isPending}
                        icon={Trash2}
                        size="sm"
                      >
                        Supprimer
                      </DangerButton>
                    </td>
                  )}
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Aucun membre ne correspond à vos critères de recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => {
            setCurrentPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>

      <Modal 
        isOpen={roleModal.isOpen} 
        onClose={() => setRoleModal(v => ({...v, isOpen: false}))}
        onConfirm={confirmRoleChange}
        title="Changement de rôle"
        message={`Voulez-vous vraiment changer le rôle de cet utilisateur vers "${roleModal.roleLabel}" ?`}
      />

      <Modal
        isOpen={banModal.isOpen}
        onClose={() => setBanModal(v => ({...v, isOpen: false}))}
        onConfirm={confirmBanToggle}
        title={banModal.isBanning ? "Bannir l'utilisateur" : "Débannir l'utilisateur"}
        confirmText={banModal.isBanning ? "Bannir" : "Débannir"}
        variant={banModal.isBanning ? "admin" : "primary"}
      >
        <p style={{ color: '#ccc', marginBottom: '1rem', lineHeight: 1.5 }}>
          {banModal.isBanning 
            ? `Vous êtes sur le point de bannir ${banModal.userName}. Veuillez indiquer la raison du bannissement.`
            : `Voulez-vous vraiment débannir ${banModal.userName} ?`
          }
        </p>
        
        {banModal.isBanning && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="ban-reasons-group">
              <label style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Raison du bannissement</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {BAN_REASONS.map(r => (
                  <button 
                    key={r}
                    type="button"
                    onClick={() => setBanReason(r)}
                    style={{
                      textAlign: 'left',
                      padding: '0.7rem 1rem',
                      background: banReason === r ? 'var(--primary-transparent)' : 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid',
                      borderColor: banReason === r ? 'var(--primary)' : 'var(--glass-border)',
                      borderRadius: '8px',
                      color: banReason === r ? 'var(--primary)' : 'var(--foreground)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: banReason === r ? 700 : 400,
                      transition: 'all 0.2s'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="ban-details-group">
              <label style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Précisions additionnelles</label>
              <textarea 
                value={banDetails}
                onChange={(e) => setBanDetails(e.target.value)}
                placeholder="Détaillez le motif si nécessaire..."
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  color: 'var(--foreground)',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  minHeight: '100px',
                  fontFamily: 'inherit',
                  resize: 'none'
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal(v => ({...v, isOpen: false}))}
        onConfirm={confirmDelete}
        title="Suppression définitive"
      >
        <p style={{ color: '#fca5a5', lineHeight: 1.5 }}>
          <strong>ATTENTION :</strong> Cette action est <strong>IRRÉVERSIBLE</strong>.
        </p>
        <p style={{ color: '#ccc', marginTop: '0.5rem', lineHeight: 1.5 }}>
          Toutes les données de {deleteModal.userName} (messages, topics, conversations privées) 
          seront supprimées définitivement de la base de données.
        </p>
        <p style={{ color: '#eab308', marginTop: '1rem', lineHeight: 1.5, background: 'rgba(234, 179, 8, 0.1)', padding: '0.8rem', borderRadius: '6px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
          <strong>RAPPEL SUPERADMIN :</strong> Cette option ne doit être utilisée <strong>QUE</strong> pour purger les faux comptes, les comptes buggés, ou vider les comptes abandonnés/fantômes. 
          Pour les cas classiques de modération, privilégiez le bannissement.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <ClassicButton onClick={() => setDeleteModal(v => ({...v, isOpen: false}))}>
            Annuler
          </ClassicButton>
          <DangerButton 
            onClick={confirmDelete} 
            isLoading={isPending}
          >
            Confirmer la suppression
          </DangerButton>
        </div>
      </Modal>

      <style jsx>{`
        .role-badge {
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          background: rgba(255,255,255,0.1);
        }
        .role-superadmin { background: #9333ea; color: white; }
        .role-admin { background: #ef4444; color: white; }
        .role-conseil-orga { background: #f59e0b; color: black; }
        .role-moderator { background: #3b82f6; color: white; }
        .role-orga { background: #10b981; color: white; }
        .role-coach { background: #4b5563; color: white; }
      `}</style>
    </PremiumCard>
  );
}
