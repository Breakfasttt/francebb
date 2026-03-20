"use client";

import { useTransition } from "react";
import { ROLE_LABELS, ROLE_POWER, UserRole, canEditTargetRole, getAllowedRolesToAssign } from "@/lib/roles";
import { updateUserRole } from "@/app/admin/users/actions";

interface Props {
  users: any[];
  currentUserRole: UserRole;
}

export default function AdminUserTable({ users, currentUserRole }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (confirm(`Voulez-vous vraiment changer le rôle de cet utilisateur vers ${ROLE_LABELS[newRole]} ?`)) {
      startTransition(async () => {
        try {
          await updateUserRole(userId, newRole);
        } catch (error: any) {
          alert(error.message);
        }
      });
    }
  };

  return (
    <div className="premium-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
      <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
            <th style={{ padding: '1rem' }}>Utilisateur</th>
            <th style={{ padding: '1rem' }}>Email</th>
            <th style={{ padding: '1rem' }}>Rôle Actuel</th>
            <th style={{ padding: '1rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => {
            const canEdit = canEditTargetRole(currentUserRole, user.role as UserRole);
            const selectableRoles = getAllowedRolesToAssign(currentUserRole);

            return (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {user.image && <img src={user.image} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />}
                    <span>{user.name}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem', color: '#888' }}>{user.email}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`role-badge role-${user.role.toLowerCase().replace('_', '-')}`}>
                    {ROLE_LABELS[user.role as UserRole]}
                  </span>
                </td>
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
                        outline: 'none'
                      }}
                    >
                      <option value={user.role} disabled>Changer le rôle...</option>
                      {selectableRoles.map(role => (
                        <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#555 italic' }}>Verrouillé (Rang insuffisant)</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <style jsx>{`
        .role-badge {
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(255,255,255,0.1);
        }
        .role-admin { background: #ff4444; color: white; }
        .role-rc-naf { background: #ffaa00; color: black; }
        .role-moderator { background: #0088ff; color: white; }
        .role-orga { background: #00cc66; color: white; }
        .role-coach { background: #888; color: white; }
      `}</style>
    </div>
  );
}
