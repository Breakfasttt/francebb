"use client";

import { useTransition, useState } from "react";
import { ROLE_LABELS, UserRole, canEditTargetRole, getAllowedRolesToAssign, canManageRoles, isModerator, getRoleLabel } from "@/lib/roles";
import { updateUserRole, toggleBanUser, deleteUser } from "@/app/membres/actions";
import Link from "next/link";
import { Mail, Ban, Trash2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  users: any[];
  currentUserRole: UserRole;
  currentUserId: string;
}

export default function MembersTable({ users, currentUserRole, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (confirm(`Voulez-vous vraiment changer le rôle de cet utilisateur vers ${ROLE_LABELS[newRole]} ?`)) {
      startTransition(async () => {
        try {
          await updateUserRole(userId, newRole);
          toast.success("Rôle mis à jour");
        } catch (error: any) {
          toast.error(error.message);
        }
      });
    }
  };

  const handleToggleBan = async (userId: string, currentBanStatus: boolean) => {
    const action = currentBanStatus ? "débannir" : "bannir";
    let reason = "";
    if (!currentBanStatus) {
      const input = prompt("Raison du bannissement (obligatoire) :");
      if (input === null) return;
      if (!input.trim()) {
        toast.error("La raison est obligatoire pour bannir un utilisateur.");
        return;
      }
      reason = input.trim();
    } else {
      if (!confirm("Voulez-vous vraiment débannir cet utilisateur ?")) return;
    }

    startTransition(async () => {
      try {
        await toggleBanUser(userId, !currentBanStatus, reason);
        toast.success(`Utilisateur ${currentBanStatus ? 'débanni' : 'banni'} avec succès`);
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("ATTENTION : Cette action est IRREVERSIBLE. Toutes les données de cet utilisateur (messages, topics, conversations) seront supprimées définitivement. Confirmez-vous ?")) {
      startTransition(async () => {
        try {
          await deleteUser(userId);
          toast.success("Utilisateur supprimé définitivement");
        } catch (error: any) {
          toast.error(error.message);
        }
      });
    }
  };

  const showRoles = canManageRoles(currentUserRole);
  const showMod = isModerator(currentUserRole);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <th style={{ padding: '1rem' }}>Utilisateur</th>
            <th style={{ padding: '1rem' }}>Rôle</th>
            <th style={{ padding: '1rem' }}>N°NAF</th>
            <th style={{ padding: '1rem', textAlign: 'center' }}>MP</th>
            {showRoles && <th style={{ padding: '1rem' }}>Gestion des Rôles</th>}
            {showMod && <th style={{ padding: '1rem' }}>Modération</th>}
            {showMod && <th style={{ padding: '1rem' }}>Gestion</th>}
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => {
            const canEdit = canEditTargetRole(currentUserRole, user.role as UserRole);
            const selectableRoles = getAllowedRolesToAssign(currentUserRole);

            return (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: user.isBanned ? 0.5 : 1 }}>
                <td style={{ padding: '1rem' }}>
                  <Link href={`/profile?id=${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'inherit' }}>
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
                        defaultValue={user.role}
                        disabled={isPending}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
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
                        onClick={() => handleToggleBan(user.id, user.isBanned)}
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
                {showMod && (
                  <td style={{ padding: '1rem' }}>
                    {canEditTargetRole(currentUserRole, user.role as UserRole) || currentUserRole === "SUPERADMIN" ? (
                      <button 
                        disabled={isPending}
                        onClick={() => handleDeleteUser(user.id)}
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
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#555 italic' }}>Verrouillé</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

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
