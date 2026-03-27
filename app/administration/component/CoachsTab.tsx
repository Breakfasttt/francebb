"use client";

import UserAvatar from "@/common/components/UserAvatar/UserAvatar";
import { getRolePower, UserRole } from "@/lib/roles";
import { Search, Mail, Ban, ShieldCheck, UserCheck, ShieldOff, MoreHorizontal, UserX, AlertTriangle, Users, ShieldAlert } from "lucide-react";
import Pagination from "@/common/components/Pagination/Pagination";
import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { getAllRoles, searchCoaches, updateCoachRole } from "../actions";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";

interface CoachsTabProps {
  currentUserRole: UserRole;
  isSuperAdmin: boolean;
}

export default function CoachsTab({ currentUserRole, isSuperAdmin }: CoachsTabProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [dbRoles, setDbRoles] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10; // Define how many users per page

  const myPower = getRolePower(currentUserRole);

  const availableRoles = dbRoles
    .filter(role => role.name !== "SUPERADMIN") // Personne ne peut accorder SUPERADMIN via l'UI
    .filter(role => isSuperAdmin || role.power < myPower)
    .sort((a, b) => b.power - a.power);

  useEffect(() => {
    loadUsers("");
    loadRoles();
  }, []);

  const loadRoles = async () => {
    const rolesData = await getAllRoles();
    setDbRoles(rolesData);
  };

  const loadUsers = async (searchQuery: string, page: number = 1) => {
    setIsLoading(true);
    const data = await searchCoaches(searchQuery, page, usersPerPage);
    setUsers(data.users);
    setTotalPages(data.totalPages);
    setCurrentPage(page);
    setIsLoading(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    // Debounce simple
    const timeout = setTimeout(() => {
      loadUsers(newQuery, 1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timeout);
  };

  const handlePageChange = (page: number) => {
    loadUsers(query, page);
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    startTransition(async () => {
      const res = await updateCoachRole(userId, newRole);
      if (res.success) {
        toast.success("Rôle mis à jour");
        loadUsers(query, currentPage); // Reload current page to reflect changes
      } else {
        toast.error(res.error || "Erreur lors de la mise à jour");
      }
    });
  };

  return (
    <PremiumCard className="fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Users size={28} color="var(--primary)" />
        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Rôles des Membres</h3>
      </div>

      <p style={{ color: '#ccc', lineHeight: 1.6, marginBottom: '2rem' }}>
        Recherchez un utilisateur pour lui attribuer un nouveau rôle.
        Vous ne pouvez affecter que des rôles <strong style={{ color: 'white' }}>strictement inférieurs au vôtre</strong>.
      </p>

      <div className="search-bar-container">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher par pseudo..."
          value={query}
          onChange={handleSearch}
          className="search-input"
        />
        {isLoading && <span className="loading-indicator">⏳</span>}
      </div>

      <div className="users-list">
        {users.length === 0 && !isLoading && (
          <div className="empty-state">Aucun coach trouvé ou base vide.</div>
        )}

        {users.map(u => {
          const uPower = getRolePower(u.role);
          const canEdit = isSuperAdmin || (myPower > uPower && u.role !== "SUPERADMIN");
          const roleConfig = dbRoles.find(r => r.name === u.role);
          const userColor = roleConfig ? roleConfig.color : "#666";

          return (
            <div key={u.id} className={`user-item ${u.role === "SUPERADMIN" ? "super-item" : ""}`}>
              <div className="user-info">
                <UserAvatar image={u.image} name={u.name} size={40} selectedRank={u.avatarFrame} isBanned={u.isBanned} />
                <div className="user-text">
                  <strong>{u.name}</strong>
                  <span className="role-badge" style={{ background: userColor, color: u.role === "SUPERADMIN" ? "black" : "white" }}>
                    {roleConfig ? roleConfig.label : u.role}
                  </span>
                </div>
              </div>

              <div className="user-actions">
                {canEdit ? (
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={isPending}
                    className="role-select"
                  >
                    {!availableRoles.find(r => r.name === u.role) && (
                      <option value={u.role} disabled>{u.role}</option>
                    )}
                    {availableRoles.map(r => (
                      <option key={r.name} value={r.name}>{r.label}</option>
                    ))}
                  </select>
                ) : (
                  <div className="locked-badge">
                    <ShieldAlert size={16} /> Verrouillé (Hiérarchie)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .search-bar-container {
          position: relative;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          color: #666;
        }
        .search-input {
          width: 100%;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          padding: 1rem 1rem 1rem 3rem;
          border-radius: 8px;
          color: var(--foreground);
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .search-input:focus {
          outline: none;
          border-color: var(--primary);
        }
        .loading-indicator {
          position: absolute;
          right: 1.5rem;
        }
        .users-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .user-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
        }
        .user-item.super-item {
          border-color: rgba(234, 179, 8, 0.4);
          background: rgba(234, 179, 8, 0.05);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .user-text {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .user-text strong {
          color: var(--foreground);
          font-size: 1.1rem;
        }
        .role-badge {
          display: inline-block;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 800;
          width: fit-content;
        }
        .role-select {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--foreground);
          padding: 0.6rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        .role-select:focus {
          outline: none;
          border-color: var(--primary);
        }
        .locked-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #888;
          font-size: 0.8rem;
          background: rgba(255,255,255,0.05);
          padding: 0.5rem 1rem;
          border-radius: 8px;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
      `}</style>
    </PremiumCard>
  );
}
