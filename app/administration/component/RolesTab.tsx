"use client";

import { useEffect, useState, useTransition } from "react";
import { ShieldCheck, Plus, Trash2, ShieldAlert, GripVertical } from "lucide-react";
import { getAllRoles, createCustomRole, deleteCustomRole, reorderRoles } from "../actions";
import { getRolePower, UserRole } from "@/lib/roles";
import toast from "react-hot-toast";
import Modal from "@/common/components/Modal/Modal";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import CTAButton from "@/common/components/Button/CTAButton";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RolesTabProps {
  currentUserRole: UserRole;
  isSuperAdmin: boolean;
}

// ------ Composant Item triable interne ------
function SortableRoleItem({ role, myPower, isSuperAdmin, onDelete, disabled }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: role.name, disabled: role.isBaseRole || disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  const canDelete = !role.isBaseRole && (isSuperAdmin || role.power < myPower);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`role-card ${role.isBaseRole ? 'base-role' : 'custom-role'}`}
    >
      <div className="role-info">
        {!role.isBaseRole && !disabled ? (
          <div {...attributes} {...listeners} className="drag-handle" title="Glisser pour modifier la hiérarchie">
            <GripVertical size={20} style={{ color: "var(--text-muted)" }} />
          </div>
        ) : (
          <div className="drag-handle disabled">
             <div style={{width: 20}}></div>
          </div>
        )}

        <div className="role-main-info">
          <strong style={{ color: role.color || "var(--foreground)" }}>
            {role.label} 
            <code className="role-name">{role.name}</code>
          </strong>
          <span className="count-badge">{role._count?.users || 0} coachs</span>
        </div>
      </div>
      
      <div className="role-actions">
        {role.isBaseRole ? (
          <span className="locked-badge"><ShieldAlert size={14} /> Base</span>
        ) : canDelete ? (
          <button 
            onClick={() => onDelete(role.name)} 
            disabled={disabled} 
            className="delete-role-btn"
            title="Supprimer ce rôle"
            type="button"
          >
            <Trash2 size={16} />
          </button>
        ) : (
           <span className="locked-badge">Hiérarchie bloquée</span>
        )}
      </div>

      <style jsx>{`
        .role-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 1rem 0.8rem 0.5rem;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          margin-bottom: 0.6rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .role-card:hover {
          border-color: var(--primary-transparent);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .base-role { background: var(--glass-bg-accent); }
        .custom-role { background: var(--glass-bg); }
        
        .drag-handle { cursor: grab; display: flex; align-items: center; padding: 0.5rem; }
        .drag-handle:active { cursor: grabbing; }
        .drag-handle.disabled { cursor: not-allowed; opacity: 0.3; }
        
        .role-info { display: flex; align-items: center; gap: 0.8rem; flex: 1; }
        .role-main-info { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .role-main-info strong { color: var(--foreground); display: flex; align-items: center; gap: 0.6rem; font-size: 1rem; }
        .role-name { background: var(--glass-bg-accent); padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; color: var(--text-muted); font-family: monospace; }
        .count-badge { background: var(--primary-transparent); color: var(--primary); padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; }
        
        .locked-badge { 
          display: flex; 
          align-items: center; 
          gap: 0.4rem; 
          font-size: 0.75rem; 
          color: var(--text-muted); 
          background: var(--glass-bg-accent); 
          padding: 4px 10px; 
          border-radius: 8px; 
          font-weight: 600;
        }
        
        .delete-role-btn { 
          background: rgba(239, 68, 68, 0.1); 
          border: 1px solid rgba(239, 68, 68, 0.2); 
          color: #ef4444; 
          cursor: pointer; 
          padding: 0.5rem; 
          border-radius: 8px; 
          transition: all 0.2s; 
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .delete-role-btn:hover:not(:disabled) { 
          background: #ef4444; 
          color: white; 
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
        }
        .delete-role-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

// ------ Composant principal ------
export default function RolesTab({ currentUserRole, isSuperAdmin }: RolesTabProps) {
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [newName, setNewName] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#888888");
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  const myPower = getRolePower(currentUserRole);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadRoles(false);
  }, []);

  const loadRoles = async (silent = false) => {
    if (!silent) setIsLoading(true);
    const data = await getAllRoles();
    setRoles(data);
    if (!silent) setIsLoading(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLabel) return toast.error("Champs requis");
    
    startTransition(async () => {
      // Create it with a generic low power initially (like 5), the user can drag it after.
      const res = await createCustomRole({ name: newName, label: newLabel, color: newColor, power: 5 });
      if (res.success) {
        toast.success("Rôle créé ! Vous pouvez maintenant modifier son importance en le glissant dans la liste.");
        setNewName(""); setNewLabel(""); setNewColor("#888888");
        loadRoles(true);
      } else {
        toast.error(res.error || "Erreur lors de la création");
      }
    });
  };

  const handleDeleteClick = (roleName: string) => {
    setRoleToDelete(roleName);
  };

  const confirmDelete = () => {
    if (!roleToDelete) return;

    startTransition(async () => {
      const res = await deleteCustomRole(roleToDelete);
      if (res.success) {
        toast.success("Rôle supprimé ! Les concernés ont été rétrogradés.");
        setRoleToDelete(null);
        loadRoles(true);
      } else {
        toast.error(res.error || "Erreur de suppression");
      }
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = roles.findIndex(item => item.name === active.id);
      const newIndex = roles.findIndex(item => item.name === over.id);
      
      const newArray = arrayMove(roles, oldIndex, newIndex);

      // Validation front-end sur le MODERATOR
      const modIndex = newArray.findIndex(r => r.name === "MODERATOR");
      const movedItem = newArray[newIndex];
      
      if (modIndex !== -1 && newIndex < modIndex && !movedItem.isBaseRole) {
        toast.error("Impossible de placer un grade personnalisé au dessus de Modérateur.");
        return; // revert en ne mettant pas à jour le state
      }

      setRoles(newArray);

      // On push la nouvelle liste au serveur pour sauvegarder l'ordre
      const namesInOrder = newArray.map(r => r.name);
      startTransition(async () => {
        const res = await reorderRoles(namesInOrder);
        if (res.success) {
          toast.success("Hiérarchie mise à jour !");
          loadRoles(true);
        } else {
          toast.error(res.error || "Erreur lors de la sauvegarde.");
          loadRoles(true);
        }
      });
    }
  };

  return (
    <PremiumCard className="fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'var(--primary-transparent)', padding: '0.8rem', borderRadius: '12px', color: 'var(--primary)' }}>
          <ShieldCheck size={28} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--foreground)' }}>Configuration des Rôles</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Gérez les permissions et la hiérarchie sociale.</p>
        </div>
      </div>
      
      {/* CREATION FORM */}
      <form onSubmit={handleCreate} className="create-role-box">
        <h4 style={{ margin: '0 0 1.2rem 0', color: 'var(--foreground)', fontSize: '1rem', fontWeight: 700 }}>Créer un nouveau rôle personnalisé</h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="ID (ex: ARBITRE)" 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
            disabled={isPending}
            required
            className="premium-input-field"
          />
          <input 
            type="text" 
            placeholder="Label (ex: Arbitre Principal)" 
            value={newLabel} 
            onChange={e => setNewLabel(e.target.value)} 
            disabled={isPending}
            required
            className="premium-input-field flex-1"
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'var(--card-bg)', padding: '0 0.8rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Couleur:</label>
            <input 
              type="color"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              disabled={isPending}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, height: '32px', width: '32px' }}
            />
          </div>
          <CTAButton type="submit" isLoading={isPending} icon={<Plus size={18} />}>
            CRÉER LE RÔLE
          </CTAButton>
        </div>
      </form>

      {/* ROLES LIST DND */}
      <div style={{ marginTop: '3rem' }}>
        <h4 style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--foreground)', fontWeight: 700 }}>
          Hiérarchie des rôles
          {isPending && <span style={{fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'normal'}}>Sauvegarde...</span>}
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>
          L'ordre dans cette liste détermine "qui a le pouvoir sur qui". Glissez-déposez les rôles avec la poignée <GripVertical size={14} style={{verticalAlign:'middle', color: 'var(--primary)'}}/> pour modifier leur importance. 
          Les rôles de base sont des points d'ancrage fixes.
        </p>

        {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Chargement des rôles...</p> : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={roles.map(r => r.name)}
              strategy={verticalListSortingStrategy}
            >
              <div className="roles-list">
                {roles.map(r => (
                  <SortableRoleItem 
                    key={r.name} 
                    role={r} 
                    myPower={myPower}
                    isSuperAdmin={isSuperAdmin}
                    onDelete={handleDeleteClick}
                    disabled={isPending}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <style jsx>{`
        .create-role-box {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          padding: 1.8rem;
          border-radius: 16px;
        }
        .premium-input-field {
          background: var(--card-bg);
          border: 1px solid var(--glass-border);
          color: var(--foreground);
          padding: 0.8rem 1.2rem;
          border-radius: 10px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .premium-input-field:focus { 
          outline: none; 
          border-color: var(--primary); 
          box-shadow: 0 0 0 3px var(--primary-transparent);
        }
        .flex-1 { flex: 1; }
        .roles-list { display: flex; flex-direction: column; }
      `}</style>

      {/* MODALE DE SUPPRESSION */}
      {roleToDelete && (
        <Modal 
          isOpen={true} 
          onClose={() => setRoleToDelete(null)}
          onConfirm={confirmDelete}
          confirmText={isPending ? "Suppression en cours..." : "Oui, retirer ce rôle"}
          variant="danger"
          title="Confirmer la suppression"
        >
          <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <p style={{ color: 'var(--foreground)' }}>Êtes-vous certain de vouloir supprimer le rôle <strong>{roleToDelete}</strong> ?</p>
            <p style={{ color: 'var(--danger)', fontWeight: 'bold' }}>
              <ShieldAlert size={18} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }}/>
              Tous les coachs possédant actuellement ce rôle seront automatiquement rétrogradés au statut de "COACH".
            </p>
          </div>
        </Modal>
      )}
    </PremiumCard>
  );
}
