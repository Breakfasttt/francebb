/**
 * Onglet de gestion des utilisateurs bannis.
 * Permet de lister les bannissements actifs et de débannir des utilisateurs.
 */
"use client";

import { useEffect, useState } from "react";
import { getBannedUsers, unbanUserAction } from "../actions";
import { Loader2, UserX, UserCheck, Clock, ShieldAlert } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import Pagination from "@/common/components/Pagination/Pagination";
import AdminButton from "@/common/components/Button/AdminButton";
import { useIsMobile } from "@/common/hooks/useIsMobile";

export default function BannedUsersTab() {
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getBannedUsers(page);
    setUsers(data.users);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleUnbanClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsConfirmOpen(true);
  };

  const onConfirmUnban = async () => {
    if (!selectedUserId) return;
    
    const res = await unbanUserAction(selectedUserId);
    setIsConfirmOpen(false);
    
    if (res.success) {
      toast.success("Utilisateur débanni");
      fetchUsers();
    } else {
      toast.error(res.error || "Erreur serveur");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="banned-users-tab">
      <div className="tab-header" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <UserX size={20} color="var(--danger)" />
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Utilisateurs bannis</h3>
        <span className="action-badge danger" style={{ marginLeft: 'auto' }}>{users.length} bannis</span>
      </div>

        {users.length === 0 ? (
          <PremiumCard>
            <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>Aucun utilisateur banni pour le moment.</p>
          </PremiumCard>
        ) : isMobile ? (
          <div className="moderation-mobile-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {users.map((user) => (
              <PremiumCard key={user.id} style={{ padding: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div className="report-author">
                    {user.image ? (
                      <img src={user.image} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                    ) : (
                      <UserX size={18} />
                    )}
                    <span style={{ fontWeight: 600 }}>{user.name || "Inconnu"}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock size={12} />
                    {user.bannedAt ? format(new Date(user.bannedAt), "dd/MM/yyyy", { locale: fr }) : "N/A"}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ opacity: 0.6, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>Banni par:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <ShieldAlert size={14} color="var(--primary)" />
                      <span>{user.bannedBy}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ opacity: 0.6, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>Raison:</span>
                    <p style={{ margin: '0.2rem 0 0 0', opacity: 0.9 }}>{user.banReason || "Non spécifiée"}</p>
                  </div>

                  <AdminButton 
                    onClick={() => handleUnbanClick(user.id)}
                    size="sm"
                    icon={UserCheck}
                    style={{ 
                      marginTop: '0.5rem',
                      width: '100%',
                      background: "#22c55e", 
                      color: "white", 
                      borderColor: "transparent" 
                    }}
                  >
                    Débannir
                  </AdminButton>
                </div>
              </PremiumCard>
            ))}
          </div>
        ) : (
          <PremiumCard style={{ padding: '0' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="moderation-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Banni par</th>
                    <th>Raison</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="moderation-row">
                      <td className="moderation-cell">
                        <div className="report-author" style={{ justifyContent: 'center' }}>
                          {user.image ? (
                            <img src={user.image} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                          ) : (
                            <UserX size={14} />
                          )}
                          <span>{user.name || "Inconnu"}</span>
                        </div>
                      </td>
                      <td className="moderation-cell">
                        <div className="report-author" style={{ justifyContent: 'center' }}>
                          <ShieldAlert size={14} color="var(--primary)" />
                          <span>{user.bannedBy}</span>
                        </div>
                      </td>
                      <td className="moderation-cell" style={{ maxWidth: '250px' }}>
                        <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>{user.banReason || "Non spécifiée"}</span>
                      </td>
                      <td className="moderation-cell">
                        <div style={{ fontSize: '0.8rem', opacity: 0.6, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} />
                          {user.bannedAt.getTime() > 0 ? format(new Date(user.bannedAt), "dd/MM/yyyy", { locale: fr }) : "N/A"}
                        </div>
                      </td>
                      <td className="moderation-cell">
                        <AdminButton 
                          onClick={() => handleUnbanClick(user.id)}
                          size="sm"
                          icon={UserCheck}
                          style={{ background: "#22c55e", color: "white", borderColor: "transparent" }}
                        >
                          Débannir
                        </AdminButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PremiumCard>
        )}

      <Pagination 
        currentPage={page}
        totalPages={Math.ceil(total / 10)}
        onPageChange={(p: number) => { setPage(p); window.scrollTo(0, 0); }}
        className="moderation-pagination"
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onConfirmUnban}
        title="Débannir l'utilisateur"
        message="Voulez-vous vraiment débannir cet utilisateur ? Il pourra à nouveau se connecter et interagir sur la plateforme."
        confirmLabel="Débannir"
        isDanger={false}
      />
    </div>
  );
}
