"use client";

import { useEffect, useState, useTransition } from "react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import UserAvatar from "@/common/components/UserAvatar/UserAvatar";
import { UserX, Shield, Trash2, Loader2, Info } from "lucide-react";
import { getBlockedUsers, toggleBlockUser } from "@/app/profile/actions";
import { toast } from "react-hot-toast";

export default function ProfileBlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadBlocked() {
      try {
        const users = await getBlockedUsers();
        setBlockedUsers(users);
      } catch (err) {
        console.error("Failed to load blocked users:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBlocked();
  }, []);

  const handleUnblock = (userId: string) => {
    startTransition(async () => {
      try {
        await toggleBlockUser(userId);
        setBlockedUsers(prev => prev.filter(u => u.id !== userId));
        toast.success("Utilisateur débloqué");
      } catch (err: any) {
        toast.error(err.message || "Erreur lors du déblocage");
      }
    });
  };

  if (loading) {
    return (
      <PremiumCard className="fade-in">
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <Loader2 className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Chargement de la liste noire...</p>
        </div>
      </PremiumCard>
    );
  }

  return (
    <div className="blocked-users-tab fade-in">
      <PremiumCard className="section-header-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <UserX size={24} style={{ color: 'var(--primary)' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Utilisateurs bloqués</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gérez les personnes dont vous ne souhaitez plus voir le contenu.</p>
          </div>
        </div>
      </PremiumCard>

      {blockedUsers.length === 0 ? (
        <PremiumCard className="empty-state">
          <div style={{ padding: '4rem 2rem', textAlign: 'center', opacity: 0.6 }}>
            <UserX size={48} style={{ marginBottom: '1rem' }} />
            <h3>Aucun utilisateur bloqué</h3>
            <p>Votre liste noire est vide. Vous pouvez bloquer un utilisateur depuis son profil.</p>
          </div>
        </PremiumCard>
      ) : (
        <div className="blocked-users-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {blockedUsers.map(user => (
            <PremiumCard key={user.id} className="blocked-user-card hover-subtle">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem' }}>
                <UserAvatar image={user.image} name={user.name} size={50} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <Shield size={12} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleUnblock(user.id)}
                  className="danger-hover shadow-hover"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-muted)',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title="Débloquer"
                  disabled={isPending}
                >
                  {isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                </button>
              </div>
            </PremiumCard>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        background: 'rgba(var(--primary-rgb), 0.05)', 
        borderRadius: '16px', 
        border: '1px solid var(--primary-transparent)',
        display: 'flex',
        gap: '1rem'
      }}>
        <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong>Note :</strong> Le blocage est à sens unique. Vous ne verrez plus les messages de ces utilisateurs et ils ne pourront plus vous contacter. Cependant, ils pourront toujours voir vos messages publics si vous ne les avez pas bloqués en retour (ou s'ils consultent le site sans être connectés).
        </p>
      </div>
    </div>
  );
}
