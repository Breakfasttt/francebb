"use client";

import { useEffect, useState, useTransition } from "react";
import { ShieldCheck, Plus, Trash2, ShieldAlert, GripVertical } from "lucide-react";
import { getAllRoles, createCustomRole, deleteCustomRole, reorderRoles } from "../actions";
import { getRolePower, UserRole } from "@/lib/roles";
import toast from "react-hot-toast";
import Modal from "@/common/components/Modal/Modal";

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
            <GripVertical size={20} color="#888" />
          </div>
        ) : (
          <div className="drag-handle disabled">
             <div style={{width: 20}}></div>
          </div>
        )}

        <strong style={{ color: role.color }}>{role.label} <code className="role-name">{role.name}</code></strong>
        <span className="count-badge">{role._count?.users || 0} coachs</span>
      </div>
      
      <div className="role-actions">
        {role.isBaseRole ? (
          <span className="locked-badge"><ShieldAlert size={14} /> Base</span>
        ) : canDelete ? (
          <button 
            onClick={() => onDelete(role.name)} 
            disabled={disabled} 
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

      <style jsx>{`
        .role-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1rem 1rem 0.5rem;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
          background: #111;
          margin-bottom: 0.5rem;
        }
        .base-role { background: rgba(255,255,255,0.02); }
        .custom-role { background: rgba(59, 130, 246, 0.05); border-color: rgba(59, 130, 246, 0.2); }
        .drag-handle { cursor: grab; display: flex; align-items: center; padding: 0.5rem; }
        .drag-handle:active { cursor: grabbing; }
        .drag-handle.disabled { cursor: not-allowed; opacity: 0.5; }
        
        .role-info { display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; }
        .role-info strong { color: white; display: flex; align-items: center; gap: 0.5rem; }
        .role-name { background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; color: #888; }
        .count-badge { background: rgba(34, 197, 94, 0.2); color: #4ade80; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; }
        .locked-badge { display: flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; color: #888; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; }
        .delete-icon-btn { background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.5rem; border-radius: 4px; transition: background 0.2s; }
        .delete-icon-btn:disabled { opacity: 0.5; }
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
    <div className="premium-card fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <ShieldCheck size={28} color="var(--primary)" />
        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Configuration des Rôles</h3>
      </div>
      
      {/* CREATION FORM */}
      <form onSubmit={handleCreate} className="create-role-box">
        <h4>Créer un nouveau rôle personnalisé</h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="ID (ex: ARBITRE)" 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
            disabled={isPending}
            required
            className="default-input"
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0 0.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <label style={{ fontSize: '0.8rem', color: '#ccc' }}>Couleur:</label>
            <input 
              type="color"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              disabled={isPending}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, height: '30px' }}
            />
          </div>
          <button type="submit" disabled={isPending} className="action-button primary-btn flex-shrink-0">
            <Plus size={18} /> CRÉER
          </button>
        </div>
      </form>

      {/* ROLES LIST DND */}
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Hiérarchie des rôles
          {isPending && <span style={{fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'normal'}}>Sauvegarde...</span>}
        </h4>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          L'ordre dans cette liste détermine "qui a le pouvoir sur qui". Glissez-déposez les rôles bleus avec la poignée <GripVertical size={14} style={{verticalAlign:'middle'}}/> pour modifier leur importance. Les rôles de base sont des points d'ancrage fixes.
        </p>

        {isLoading ? <p>Chargement...</p> : (
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
          <div style={{ color: '#ccc', lineHeight: 1.6 }}>
            <p>Êtes-vous certain de vouloir supprimer le rôle <strong>{roleToDelete}</strong> ?</p>
            <p style={{ color: '#ef4444', fontWeight: 'bold' }}>
              <ShieldAlert size={18} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }}/>
              Tous les coachs possédant actuellement ce rôle seront automatiquement rétrogradés au statut de "COACH".
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
