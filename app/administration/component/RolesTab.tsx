"use client";

import { useEffect, useState, useTransition } from "react";
import { ShieldCheck, Plus, Trash2, ShieldAlert } from "lucide-react";
import { getAllRoles, createCustomRole, deleteCustomRole } from "../actions";
import { getRolePower, UserRole } from "@/lib/roles";
import toast from "react-hot-toast";

interface RolesTabProps {
  currentUserRole: UserRole;
  isSuperAdmin: boolean;
}

export default function RolesTab({ currentUserRole, isSuperAdmin }: RolesTabProps) {
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [newName, setNewName] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newPower, setNewPower] = useState(1);

  const myPower = getRolePower(currentUserRole);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setIsLoading(true);
    const data = await getAllRoles();
    setRoles(data);
    setIsLoading(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLabel) return toast.error("Champs requis");
    
    startTransition(async () => {
      const res = await createCustomRole({ name: newName, label: newLabel, power: Number(newPower) });
      if (res.success) {
        toast.success("Rôle créé avec succès !");
        setNewName(""); setNewLabel(""); setNewPower(1);
        loadRoles();
      } else {
        toast.error(res.error || "Erreur lors de la création");
      }
    });
  };

  const handleDelete = (roleName: string) => {
    if (!window.confirm(`Supprimer le rôle ${roleName} ? Les utilisateurs seront rétrogradés COACH.`)) return;

    startTransition(async () => {
      const res = await deleteCustomRole(roleName);
      if (res.success) {
        toast.success("Rôle supprimé !");
        loadRoles();
      } else {
        toast.error(res.error || "Erreur de suppression");
      }
    });
  };

  return (
    <div className="premium-card fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <ShieldCheck size={28} color="var(--primary)" />
        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Configuration des Rôles</h3>
      </div>
      
      {/* CREATION FORM */}
      <form onSubmit={handleCreate} className="create-role-box">
        <h4>Créer un nouveau rôle</h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="ID unique (ex: ARBITRE)" 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
            disabled={isPending}
            required
            className="default-input flex-1"
          />
          <input 
            type="text" 
            placeholder="Label (ex: Arbitre Principal)" 
            value={newLabel} 
            onChange={e => setNewLabel(e.target.value)} 
            disabled={isPending}
            required
            className="default-input flex-1"
          />
          <input 
            type="number" 
            placeholder="Puissance (1-100)" 
            value={newPower} 
            onChange={e => setNewPower(parseInt(e.target.value))} 
            disabled={isPending}
            min={1} 
            max={isSuperAdmin ? 100 : myPower - 1}
            required
            className="default-input"
            style={{ width: '120px' }}
          />
          <button type="submit" disabled={isPending} className="action-button primary-btn flex-shrink-0">
            <Plus size={18} /> CRÉER
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>*La puissance détermine la hiérarchie. Vous ne pouvez accorder une puissance supérieure ou égale à la vôtre ({myPower}).</p>
      </form>

      {/* ROLES LIST */}
      <div style={{ marginTop: '2rem' }}>
        <h4>Rôles existants</h4>
        {isLoading ? <p>Chargement...</p> : (
          <div className="roles-list">
            {roles.map(r => {
              const canDelete = !r.isBaseRole && (isSuperAdmin || r.power < myPower);

              return (
                <div key={r.name} className={`role-card ${r.isBaseRole ? 'base-role' : 'custom-role'}`}>
                  <div className="role-info">
                    <strong>{r.label} <code className="role-name">{r.name}</code></strong>
                    <span className="power-badge">Puissance: {r.power}</span>
                    <span className="count-badge">{r._count?.users || 0} coachs affectés</span>
                  </div>
                  <div className="role-actions">
                    {r.isBaseRole ? (
                      <span className="locked-badge"><ShieldAlert size={14} /> Base</span>
                    ) : canDelete ? (
                      <button 
                        onClick={() => handleDelete(r.name)} 
                        disabled={isPending} 
                        className="delete-icon-btn"
                        title="Supprimer ce rôle"
                        type="button"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <span className="locked-badge">Hiérarchie bloquée</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .create-role-box {
          background: rgba(0,0,0,0.3);
          border: 1px dashed var(--glass-border);
          padding: 1.5rem;
          border-radius: 8px;
        }
        .create-role-box h4 { margin-top: 0; margin-bottom: 1rem; color: #ccc; }
        .default-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 0.8rem 1rem;
          border-radius: 8px;
        }
        .default-input:focus { outline: none; border-color: var(--primary); }
        .flex-1 { flex: 1; }
        .primary-btn { padding: 0.8rem 1.5rem; background: var(--primary); color: white; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s; }
        .primary-btn:hover { background: #dc2626; }
        .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .roles-list { display: flex; flex-direction: column; gap: 0.8rem; }
        .role-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
        }
        .base-role { background: rgba(255,255,255,0.02); }
        .custom-role { background: rgba(59, 130, 246, 0.05); border-color: rgba(59, 130, 246, 0.2); }
        .role-info { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .role-info strong { color: white; display: flex; align-items: center; gap: 0.5rem; }
        .role-name { background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; color: #888; }
        .power-badge { background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; color: #eee; }
        .count-badge { background: rgba(34, 197, 94, 0.2); color: #4ade80; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; }
        .locked-badge { display: flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; color: #888; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; }
        .delete-icon-btn { background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.5rem; border-radius: 4px; transition: background 0.2s; }
        .delete-icon-btn:hover { background: rgba(239, 68, 68, 0.1); }
        .delete-icon-btn:disabled { opacity: 0.5; }
      `}</style>
    </div>
  );
}
