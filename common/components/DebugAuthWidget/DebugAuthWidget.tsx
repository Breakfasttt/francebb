"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { getTestUsers, createQuickTestUser } from "@/app/debugActions";
import { User, Plus, Shield, LogOut, RefreshCw } from "lucide-react";

export default function DebugAuthWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [testUsers, setTestUsers] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("COACH");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    const users = await getTestUsers();
    setTestUsers(users);
  };

  if (process.env.NODE_ENV !== "development") return null;

  const handleSwitch = async (userId: string) => {
    // On retire l'ancien cookie de simulation s'il existe pour éviter les conflits
    document.cookie = "simulated_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // Connexion via Auth.js Credentials
    await signIn("dev-login", { 
      userId,
      callbackUrl: window.location.pathname,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    
    setLoading(true);
    try {
      const res = await createQuickTestUser(newName, newRole);
      if (res.success) {
        setNewName("");
        await loadUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.2rem',
      right: '1.2rem',
      zIndex: 9999,
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #ff0055, #ff5500)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '0.6rem 1rem',
            cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(255, 0, 85, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            fontSize: '0.85rem'
          }}
          title="Switch de Compte Dev"
        >
          <User size={16} />
          Dev Auth
        </button>
      )}

      {isOpen && (
        <div style={{
          background: 'rgba(20, 20, 25, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.25rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          width: '300px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Switcher Dev</h3>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem'}}
            >
              ×
            </button>
          </div>

          {/* Liste des utilisateurs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.3rem' }}>
            {testUsers.length === 0 && <div style={{ fontSize: '0.8rem', opacity: 0.5, textAlign: 'center' }}>Aucun compte de test.</div>}
            {testUsers.map(user => (
              <button
                key={user.id}
                onClick={() => handleSwitch(user.id)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#eee',
                  padding: '0.6rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,0,85,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <img src={user.image} style={{ width: '24px', height: '24px', borderRadius: '50%' }} alt="" />
                <div style={{ flex: 1 }}>
                  <div>{user.name}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{user.role}</div>
                </div>
                <RefreshCw size={12} opacity={0.3} />
              </button>
            ))}
          </div>

          {/* Création rapide */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.75rem', color: '#aaa' }}>Créer à la volée :</div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <input 
                type="text" 
                placeholder="Nom du coach..." 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  color: 'white',
                  fontSize: '0.85rem'
                }}
              />
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <select 
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    color: 'white',
                    fontSize: '0.8rem',
                    flex: 1
                  }}
                >
                  <option value="COACH">Coach</option>
                  <option value="MODERATOR">Modo</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERADMIN">SuperAdmin</option>
                </select>
                <button 
                  type="submit" 
                  disabled={loading || !newName}
                  style={{
                    background: '#22c55e',
                    border: 'none',
                    borderRadius: '8px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >
                  <Plus size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
