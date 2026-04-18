"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Trash2, Edit2, Check, X, Database, Info } from "lucide-react";
import { 
  getAllReferenceDataAdmin, 
  createReferenceData, 
  updateReferenceData, 
  deleteReferenceData 
} from "../actions";
import toast from "react-hot-toast";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import CTAButton from "@/common/components/Button/CTAButton";
import ClassicButton from "@/common/components/Button/ClassicButton";
import DangerButton from "@/common/components/Button/DangerButton";

interface ReferenceData {
  id: string;
  group: string;
  key: string;
  label: string;
  order: number;
  isActive: boolean;
}

export default function ReferenceDataTab() {
  const [data, setData] = useState<ReferenceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Mode édition
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ReferenceData>>({});

  // Mode création
  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState({
    group: "COACH_REGION",
    key: "",
    label: "",
    order: 0
  });

  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const result = await getAllReferenceDataAdmin();
    setData(result as ReferenceData[]);
    setLoading(false);
  }

  const handleStartEdit = (item: ReferenceData) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.group || !editForm.key || !editForm.label) return;

    startTransition(async () => {
      const res = await updateReferenceData(editingId, {
        group: editForm.group!,
        key: editForm.key!,
        label: editForm.label!,
        order: Number(editForm.order) || 0,
        isActive: editForm.isActive ?? true
      });

      if (res.success) {
        toast.success("Mis à jour avec succès");
        setEditingId(null);
        loadData();
      } else {
        toast.error(res.error || "Erreur");
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeleteItemId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItemId) return;
    const id = deleteItemId;
    setDeleteItemId(null);

    startTransition(async () => {
      const res = await deleteReferenceData(id);
      if (res.success) {
        toast.success("Supprimé");
        loadData();
      } else {
        toast.error("Erreur");
      }
    });
  };

  const handleCreate = async () => {
    if (!newForm.group || !newForm.key || !newForm.label) {
      toast.error("Tous les champs sont requis");
      return;
    }

    startTransition(async () => {
      const res = await createReferenceData({
        ...newForm,
        order: Number(newForm.order) || 0
      });

      if (res.success) {
        toast.success("Créé avec succès");
        setIsCreating(false);
        setNewForm({ group: "COACH_REGION", key: "", label: "", order: 0 });
        loadData();
      } else {
        toast.error(res.error || "Erreur");
      }
    });
  };

  if (loading) return <div className="loading-state">Chargement des données...</div>;

  // Groupement par groupe pour l'affichage
  const groupedData = data.reduce((acc: any, curr) => {
    if (!acc[curr.group]) acc[curr.group] = [];
    acc[curr.group].push(curr);
    return acc;
  }, {});

  return (
    <PremiumCard className="reference-data-tab fade-in" noOverflow style={{ padding: '2rem' }}>
      <div className="tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.6rem', fontWeight: 800 }}>
            <div style={{ background: 'var(--primary-transparent)', padding: '0.6rem', borderRadius: '10px', color: 'var(--primary)', display: 'flex' }}>
              <Database size={24} />
            </div>
            Données de Référence
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.6rem 0 0', fontSize: '0.95rem' }}>Gérez les listes de valeurs utilisées dans les formulaires.</p>
        </div>
        {!isCreating && (
          <CTAButton onClick={() => setIsCreating(true)} icon={<Plus size={18} />}>
            Ajouter une valeur
          </CTAButton>
        )}
      </div>

      <div className="info-box-admin" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '1.2rem', borderRadius: '16px', marginBottom: '2.5rem', display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
        <Info size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ margin: 0 }}>
          Les données sont regroupées. Le <strong style={{ color: 'var(--foreground)' }}>Groupe</strong> détermine où la donnée est affichée. 
          La <strong style={{ color: 'var(--foreground)' }}>Clé</strong> est la valeur technique, le <strong style={{ color: 'var(--foreground)' }}>Libellé</strong> est le texte affiché.
        </p>
      </div>

      {isCreating && (
        <PremiumCard className="creation-form-overlay" style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--primary-transparent)', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)' }}></div>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--foreground)', fontSize: '1.2rem', fontWeight: 800 }}>Ajouter une nouvelle donnée</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(150px, 1fr) minmax(200px, 1fr) 100px', gap: '1.2rem', alignItems: 'end' }}>
            <div className="form-group-admin">
              <label>Groupe</label>
              <input 
                className="premium-input-field"
                value={newForm.group} 
                onChange={e => setNewForm({...newForm, group: e.target.value})} 
                placeholder="Ex: REGION_FRANCE"
              />
            </div>
            <div className="form-group-admin">
              <label>Clé (ID technique)</label>
              <input 
                className="premium-input-field text-accent"
                value={newForm.key} 
                onChange={e => setNewForm({...newForm, key: e.target.value})} 
                placeholder="Ex: IDF"
              />
            </div>
            <div className="form-group-admin">
              <label>Libellé (Affiché)</label>
              <input 
                className="premium-input-field"
                value={newForm.label} 
                onChange={e => setNewForm({...newForm, label: e.target.value})} 
                placeholder="Ex: Île-de-France"
              />
            </div>
            <div className="form-group-admin">
              <label>Ordre</label>
              <input 
                className="premium-input-field"
                type="number"
                value={newForm.order} 
                onChange={e => setNewForm({...newForm, order: parseInt(e.target.value) || 0})} 
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
             <ClassicButton onClick={() => setIsCreating(false)} icon={<X size={18} />}>
               Annuler
             </ClassicButton>
             <CTAButton onClick={handleCreate} isLoading={isPending} icon={<Check size={18} />}>
                Créer la donnée
             </CTAButton>
          </div>
        </PremiumCard>
      )}

      {Object.keys(groupedData).sort().map(group => (
        <section key={group} className="ref-group-section" style={{ marginBottom: '3.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.8rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
            Groupe : <span style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}>{group}</span>
          </h3>
          
          <div className="ref-table-container" style={{ width: '100%', overflowX: 'auto', paddingBottom: '1.5rem' }}>
            <div className="ref-table" style={{ minWidth: '650px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div className="ref-row header" style={{ display: 'grid', gridTemplateColumns: '130px 1fr 60px 100px 90px', gap: '1rem', padding: '1rem 1.5rem', background: 'var(--glass-bg-accent, rgba(255,255,255,0.03))', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <div>Clé</div>
                <div>Libellé</div>
                <div style={{ textAlign: 'center' }}>Ordre</div>
                <div style={{ textAlign: 'center' }}>Statut</div>
                <div style={{ textAlign: 'right', paddingRight: '8px' }}>Action</div>
              </div>

              {groupedData[group].map((item: ReferenceData) => (
                <div key={item.id} className={`ref-row-item ${editingId === item.id ? 'editing' : ''}`}>
                  {editingId === item.id ? (
                    <div className="edit-row-container" style={{ display: 'grid', gridTemplateColumns: '130px 1fr 60px 100px 90px', gap: '1rem', padding: '1.2rem 1.5rem', background: 'var(--glass-bg)', borderRadius: '16px', border: '2px solid var(--primary)', alignItems: 'center', boxShadow: '0 0 20px var(--btn-shadow)' }}>
                      <input className="premium-input-field text-accent compact" value={editForm.key} onChange={e => setEditForm({...editForm, key: e.target.value})} title="Clé" />
                      <input className="premium-input-field compact" value={editForm.label} onChange={e => setEditForm({...editForm, label: e.target.value})} title="Libellé" />
                      <input className="premium-input-field compact" type="number" value={editForm.order} onChange={e => setEditForm({...editForm, order: parseInt(e.target.value) || 0})} title="Ordre" />
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm({...editForm, isActive: e.target.checked})} className="premium-checkbox" title="Actif ?" />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                        <button onClick={handleSaveEdit} className="action-row-btn success" title="Enregistrer"><Check size={18} /></button>
                        <button onClick={handleCancelEdit} className="action-row-btn" title="Annuler"><X size={18} /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="static-row-container" style={{ display: 'grid', gridTemplateColumns: '130px 1fr 60px 100px 90px', gap: '1rem', padding: '1.2rem 1.5rem', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', alignItems: 'center', transition: 'all 0.2s' }}>
                      <div className="key-display-badge" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.key}>{item.key}</div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.label}>{item.label}</div>
                      <div style={{ color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>{item.order}</div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
                          {item.isActive ? "ACTIF" : "INACTIF"}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                        <button onClick={() => handleStartEdit(item)} className="action-row-btn" title="Modifier"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(item.id)} className="action-row-btn danger" title="Supprimer"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <ConfirmModal
        isOpen={!!deleteItemId}
        onClose={() => setDeleteItemId(null)}
        onConfirm={handleConfirmDelete}
        title="Supprimer la donnée"
        message="Voulez-vous vraiment supprimer cette donnée de référence ?"
        confirmLabel="Supprimer"
        isDanger={true}
      />

      <style jsx>{`
        .loading-state {
          padding: 4rem;
          text-align: center;
          color: var(--text-muted);
          font-weight: 700;
        }
        .form-group-admin {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group-admin label { 
          font-size: 0.75rem; 
          font-weight: 800; 
          color: var(--text-muted); 
          text-transform: uppercase; 
          letter-spacing: 0.05em;
          padding-left: 4px;
        }
        .premium-input-field {
          background: var(--card-bg);
          border: 1px solid var(--glass-border);
          padding: 0.7rem 1rem;
          border-radius: 10px;
          color: var(--foreground);
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s;
          width: 100%;
        }
        .premium-input-field:focus { 
          border-color: var(--primary); 
          box-shadow: 0 0 0 3px var(--primary-transparent);
        }
        .premium-input-field.compact {
          padding: 0.5rem 0.8rem;
          font-size: 0.9rem;
        }
        .text-accent { color: var(--accent) !important; font-family: monospace; }
        
        .static-row-container:hover {
          border-color: var(--primary-transparent) !important;
          transform: translateX(4px);
        }

        .key-display-badge {
          font-family: monospace;
          color: var(--accent);
          background: var(--accent-transparent);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          display: inline-block;
        }

        .status-badge {
          font-size: 0.65rem;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.05em;
        }
        .status-badge.active {
          background: var(--success-transparent, rgba(34, 197, 94, 0.1));
          color: var(--success, #22c55e);
          border: 1px solid var(--success-transparent, rgba(34, 197, 94, 0.2));
        }
        .status-badge.inactive {
          background: var(--danger-transparent, rgba(239, 68, 68, 0.1));
          color: var(--danger, #ef4444);
          border: 1px solid var(--danger-transparent, rgba(239, 68, 68, 0.2));
        }

        .action-row-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--glass-bg-accent, rgba(255,255,255,0.03));
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-row-btn:hover { background: var(--primary-transparent); color: var(--foreground); border-color: var(--primary); }
        .action-row-btn.danger:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }
        .action-row-btn.success:hover { background: rgba(34, 197, 94, 0.1); color: #22c55e; border-color: #22c55e; }
        
        .premium-checkbox {
          width: 20px;
          height: 20px;
          accent-color: var(--primary);
          cursor: pointer;
        }
      `}</style>
    </PremiumCard>
  );
}
