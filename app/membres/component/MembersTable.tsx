"use client";

import { useTransition, useState } from "react";
import { ROLE_LABELS, UserRole, canEditTargetRole, getAllowedRolesToAssign, canManageRoles, isModerator, getRoleLabel, getRolePower } from "@/lib/roles";
import { updateUserRole, toggleBanUser, deleteUser } from "@/app/membres/actions";
import Link from "next/link";
import { Mail, Ban, Trash2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/common/components/Modal/Modal";

interface Props {
  users: any[];
  currentUserRole: UserRole;
  currentUserId: string;
}

export default function MembersTable({ users, currentUserRole, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  
  type SortConfig = { key: "name" | "role" | "naf"; direction: "asc" | "desc" } | null;
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const [roleModal, setRoleModal] = useState<{ isOpen: boolean, userId: string, newRole: UserRole | "", roleLabel: string }>({ isOpen: false, userId: "", newRole: "", roleLabel: "" });
  const [banModal, setBanModal] = useState<{ isOpen: boolean, userId: string, isBanning: boolean, userName: string }>({ isOpen: false, userId: "", isBanning: false, userName: "" });
  const [banReason, setBanReason] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, userId: string, userName: string }>({ isOpen: false, userId: "", userName: "" });

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
    setBanModal({ isOpen: true, userId, isBanning: !currentBanStatus, userName });
  };

  const confirmBanToggle = () => {
    if (banModal.isBanning && !banReason.trim()) {
      toast.error("La raison est obligatoire pour bannir un utilisateur.");
      return;
    }
    startTransition(async () => {
      try {
        await toggleBanUser(banModal.userId, banModal.isBanning, banReason.trim());
        toast.success(`Utilisateur ${!banModal.isBanning ? 'débanni' : 'banni'} avec succès`);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setBanModal({ isOpen: false, userId: "", isBanning: false, userName: "" });
      }
    });
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setDeleteModal({ isOpen: true, userId, userName });
  };

  const confirmDelete = () => {
    startTransition(async () => {
      try {
        await deleteUser(deleteModal.userId);
        toast.success("Utilisateur supprimé définitivement");
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

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (key: "name" | "role" | "naf") => {
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
    
    return 0;
  });

  return (
    <div className="premium-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <input 
          type="text" 
          placeholder="Rechercher un membre..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.6rem 1rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--glass-border)',
            borderRadius: '6px',
            color: 'white',
            width: '100%',
            maxWidth: '300px',
            outline: 'none'
          }}
        />
      </div>
      <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
            <th onClick={() => handleSort('name')} style={{ padding: '1rem', cursor: 'pointer', userSelect: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
              Utilisateur {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? '↓' : '↑') : ''}
            </th>
            <th onClick={() => handleSort('role')} style={{ padding: '1rem', cursor: 'pointer', userSelect: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
              Rôle {sortConfig?.key === 'role' ? (sortConfig.direction === 'asc' ? '↓' : '↑') : ''}
            </th>
            <th onClick={() => handleSort('naf')} style={{ padding: '1rem', cursor: 'pointer', userSelect: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
              N°NAF {sortConfig?.key === 'naf' ? (sortConfig.direction === 'asc' ? '↓' : '↑') : ''}
            </th>
            <th style={{ padding: '1rem', textAlign: 'center' }}>MP</th>
            {showRoles && <th style={{ padding: '1rem' }}>Gestion des Rôles</th>}
            {showMod && <th style={{ padding: '1rem' }}>Modération</th>}
            {showDelete && <th style={{ padding: '1rem' }}>Gestion</th>}
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map(user => {
            const canEdit = canEditTargetRole(currentUserRole, user.role as UserRole);
            const selectableRoles = getAllowedRolesToAssign(currentUserRole);

            return (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: user.isBanned ? 0.5 : 1 }}>
                <td style={{ padding: '1rem' }}>
                  <Link href={`/spy/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'inherit' }}>
                    {user.image && <img src={user.image} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />}
                    <span style={{ fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
                      {user.name} {user.isBanned && "(Banni)"}
                    </span>
                  </Link>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className={`role-badge role-${user.role.toLowerCase().replace('_', '-')}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#888' }}>
                  {user.nafNumber ? (
                    <a 
                      href={`https://member.thenaf.net/index.php?module=NAF&type=coachpage&coach=${user.nafNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}
                    >
                      {user.nafNumber}
                    </a>
                  ) : "—"}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  {user.id !== currentUserId && !user.isBanned && (
                    <Link 
                      href={`/profile?tab=pm&recipientId=${user.id}`}
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.4rem 0.8rem', 
                        background: 'rgba(34, 197, 94, 0.1)', 
                        border: '1px solid rgba(34, 197, 94, 0.2)', 
                        borderRadius: '6px', 
                        color: '#4ade80', 
                        fontSize: '0.75rem', 
                        textDecoration: 'none',
                        fontWeight: 700,
                        transition: 'all 0.2s'
                      }}
                    >
                      <Mail size={14} /> MP
                    </Link>
                  )}
                </td>
                {showRoles && (
                  <td style={{ padding: '1rem' }}>
                    {canEdit ? (
                      <select 
                        value={user.role}
                        disabled={isPending}
                        onChange={(e) => handleRoleSelect(user.id, e.target.value as UserRole)}
                        style={{ 
                          background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid var(--glass-border)',
                          color: 'white',
                          padding: '0.4rem',
                          borderRadius: '6px',
                          outline: 'none',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value={user.role} disabled>Changer le rôle...</option>
                        {selectableRoles.map(role => (
                          <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#555 italic' }}>Verrouillé</span>
                    )}
                  </td>
                )}
                {showMod && (
                  <td style={{ padding: '1rem' }}>
                    {canEditTargetRole(currentUserRole, user.role as UserRole) || currentUserRole === "SUPERADMIN" ? (
                      <button 
                        disabled={isPending}
                        onClick={() => handleToggleBanClick(user.id, user.isBanned, user.name)}
                        style={{ 
                          background: user.isBanned ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                          border: `1px solid ${user.isBanned ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          color: user.isBanned ? '#4ade80' : '#f87171',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          cursor: isPending ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        {user.isBanned ? <><CheckCircle2 size={14} /> Débannir</> : <><Ban size={14} /> Bannir</>}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#555 italic' }}>Verrouillé</span>
                    )}
                  </td>
                )}
                {showDelete && (
                  <td style={{ padding: '1rem' }}>
                    <button 
                      disabled={isPending}
                      onClick={() => handleDeleteClick(user.id, user.name)}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        color: '#ef4444',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        cursor: isPending ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

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
      >
        <p style={{ color: '#ccc', marginBottom: '1rem', lineHeight: 1.5 }}>
          {banModal.isBanning 
            ? `Vous êtes sur le point de bannir ${banModal.userName}. Veuillez indiquer la raison du bannissement.`
            : `Voulez-vous vraiment débannir ${banModal.userName} ?`
          }
        </p>
        
        {banModal.isBanning && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#888', fontWeight: 600 }}>Raison du bannissement (obligatoire)</label>
            <input 
              type="text" 
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Ex: Spam répété, insulte..."
              style={{
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--glass-border)',
                borderRadius: '6px',
                padding: '0.8rem',
                color: 'white',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button 
            onClick={() => setBanModal(v => ({...v, isOpen: false}))} 
            style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button 
            onClick={confirmBanToggle} 
            disabled={isPending}
            style={{ background: banModal.isBanning ? '#ef4444' : '#22c55e', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Confirmer
          </button>
        </div>
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
          <button 
            onClick={() => setDeleteModal(v => ({...v, isOpen: false}))} 
            style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button 
            onClick={confirmDelete} 
            disabled={isPending}
            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Confirmer la suppression
          </button>
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
    </div>
  );
}
