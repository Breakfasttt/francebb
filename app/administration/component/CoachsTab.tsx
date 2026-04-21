"use client";

import UserAvatar from "@/common/components/UserAvatar/UserAvatar";
import { getRolePower, UserRole, isModerator } from "@/lib/roles";
import { Search, Users, ShieldAlert, Loader2 } from "lucide-react";
import Pagination from "@/common/components/Pagination/Pagination";
import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { getAllRoles, searchCoaches, updateCoachRole } from "../actions";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import StatusBadge from "@/common/components/StatusBadge/StatusBadge";
import EmptyState from "@/common/components/EmptyState/EmptyState";
import ClassicSelect from "@/common/components/Form/ClassicSelect";
import { useIsMobile } from "@/common/hooks/useIsMobile";

interface CoachsTabProps {
  currentUserRole: UserRole;
  isSuperAdmin: boolean;
}

export default function CoachsTab({ currentUserRole, isSuperAdmin }: CoachsTabProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isMobile = useIsMobile();

  const [dbRoles, setDbRoles] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;

  const myPower = getRolePower(currentUserRole);

  const availableRoles = dbRoles
    .filter(role => role.name !== "SUPERADMIN")
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
    const timeout = setTimeout(() => {
      loadUsers(newQuery, 1);
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
        loadUsers(query, currentPage);
      } else {
        toast.error(res.error || "Erreur lors de la mise à jour");
      }
    });
  };

  return (
    <PremiumCard className="fade-in" style={{ padding: isMobile ? '1.2rem' : '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexDirection: isMobile ? 'column' : 'row' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', alignSelf: isMobile ? 'flex-start' : 'center' }}>
          <Users size={28} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: isMobile ? '1.2rem' : '1.4rem' }}>Rôles des Membres</h3>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '2rem' }}>
        Recherchez un utilisateur pour lui attribuer un nouveau rôle.
        Vous ne pouvez affecter que des rôles <strong style={{ color: 'var(--foreground)' }}>inférieurs au vôtre</strong>.
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
        {isLoading && <div className="loading-indicator"><Loader2 size={20} className="animate-spin" color="var(--primary)" /></div>}
      </div>

      <div className="users-list">
        {!isLoading && users.length === 0 && (
          <EmptyState 
            variant="ghost" 
            title="Aucun utilisateur trouvé" 
            description="Essayez une autre recherche." 
          />
        )}

        {users.map((user) => {
          const power = getRolePower(user.role);
          const isSuper = user.role === "SUPERADMIN";
          const canManage = isSuperAdmin || (myPower > power && !isSuper);

          return (
            <div key={user.id} className={`user-item ${isSuper ? 'super-item' : ''} ${isMobile ? 'user-item-mobile' : ''}`}>
              <div className="user-info">
                <UserAvatar 
                  image={user.image} 
                  name={user.name} 
                  size={isMobile ? 32 : 40} 
                  postCount={user._count?.posts || 0} 
                  selectedRank={user.avatarFrame} 
                  isModerator={isModerator(user.role)}
                />
                <div className="user-text">
                  <strong style={{ fontSize: isMobile ? '0.95rem' : '1.1rem' }}>{user.name}</strong>
                  <StatusBadge 
                    variant={user.role?.toLowerCase().includes('admin') ? 'admin' : user.role?.toLowerCase().includes('modo') ? 'moderator' : 'coach'}
                  >
                    {user.role}
                  </StatusBadge>
                </div>
              </div>

              <div className="user-actions" style={{ marginTop: isMobile ? '1rem' : '0', width: isMobile ? '100%' : 'auto' }}>
                {canManage ? (
                  <ClassicSelect
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={isPending}
                    size="sm"
                    containerStyle={{ width: isMobile ? "100%" : "150px" }}
                  >
                    <option value={user.role} disabled>{user.role} (Actuel)</option>
                    {availableRoles.map(role => (
                      <option key={role.name} value={role.name}>{role.name}</option>
                    ))}
                  </ClassicSelect>
                ) : (
                  <div className="locked-badge" style={{ width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "center" : "flex-start" }}>
                    <ShieldAlert size={16} />
                    <span>Action restreinte</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem' }}>
         <Pagination 
           currentPage={currentPage}
           totalPages={totalPages}
           onPageChange={handlePageChange}
         />
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
          color: var(--text-muted);
        }
        .search-input {
          width: 100%;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          padding: 0.8rem 1rem 0.8rem 3rem;
          border-radius: 12px;
          color: var(--foreground);
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-transparent);
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
          padding: 1rem 1.2rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          transition: all 0.2s;
        }
        .user-item-mobile {
          flex-direction: column;
          align-items: flex-start;
          padding: 1.2rem;
        }
        .user-item:hover {
          border-color: var(--primary-transparent);
          transform: translateX(4px);
        }
        .user-item.super-item {
          border-color: rgba(255, 215, 0, 0.4);
          background: rgba(255, 215, 0, 0.05);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }
        .user-text {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .user-text strong {
          color: var(--foreground);
        }
        .locked-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 0.8rem;
          background: rgba(255,255,255,0.05);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PremiumCard>
  );
}
