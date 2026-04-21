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
import { useIsMobile } from "@/common/hooks/useIsMobile";

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
  const isMobile = useIsMobile();

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
        toast.success("Mis à jour");
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

  if (loading) return <div className="loading-state">Chargement...</div>;

  const groupedData = data.reduce((acc: any, curr) => {
    if (!acc[curr.group]) acc[curr.group] = [];
    acc[curr.group].push(curr);
    return acc;
  }, {});

  return (
    <PremiumCard className="reference-data-tab fade-in" noOverflow style={{ padding: isMobile ? '1.2rem' : '2rem' }}>
      <div className="tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '2.5rem', flexDirection: isMobile ? 'column' : 'row', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: isMobile ? '1.3rem' : '1.6rem', fontWeight: 800 }}>
            <div style={{ background: 'var(--primary-transparent)', padding: '0.6rem', borderRadius: '10px', color: 'var(--primary)', display: 'flex' }}>
              <Database size={24} />
            </div>
            Données de Référence
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.6rem 0 0', fontSize: '0.85rem' }}>Listes de valeurs pour les formulaires.</p>
        </div>
        {!isCreating && (
          <CTAButton onClick={() => setIsCreating(true)} icon={<Plus size={18} />} fullWidth={isMobile}>
            Ajouter
          </CTAButton>
        )}
      </div>

      {isCreating && (
        <PremiumCard className="creation-form-overlay" style={{ background: 'var(--glass-bg)', padding: isMobile ? '1.2rem' : '1.8rem', borderRadius: '20px', border: '1px solid var(--primary-transparent)', marginBottom: '3rem', position: 'relative' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--foreground)', fontSize: '1.1rem', fontWeight: 800 }}>Nouvelle donnée</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem' }}>
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
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem' }}>
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
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end', flexDirection: isMobile ? 'column' : 'row' }}>
             <ClassicButton onClick={() => setIsCreating(false)} icon={<X size={18} />} fullWidth={isMobile}>
               Annuler
             </ClassicButton>
             <CTAButton onClick={handleCreate} isLoading={isPending} icon={<Check size={18} />} fullWidth={isMobile}>
                Créer
             </CTAButton>
          </div>
        </PremiumCard>
      )}

      {Object.keys(groupedData).sort().map(group => (
        <section key={group} className="ref-group-section" style={{ marginBottom: isMobile ? '2rem' : '3.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.8rem', marginBottom: '1.2rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>
            Groupe : <span style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}>{group}</span>
          </h3>
          
          <div className="ref-table-container" style={{ width: '100%', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <div className="ref-table" style={{ minWidth: isMobile ? '100%' : '650px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {!isMobile && (
                <div className="ref-row header" style={{ display: 'grid', gridTemplateColumns: '130px 1fr 60px 100px 90px', gap: '1rem', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  <div>Clé</div>
                  <div>Libellé</div>
                  <div style={{ textAlign: 'center' }}>Ordre</div>
                  <div style={{ textAlign: 'center' }}>Statut</div>
                  <div style={{ textAlign: 'right' }}>Action</div>
                </div>
              )}

              {groupedData[group].map((item: ReferenceData) => (
                <div key={item.id} className={`ref-row-item ${editingId === item.id ? 'editing' : ''}`}>
                  {editingId === item.id ? (
                    <div className="edit-row-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.2rem', background: 'var(--glass-bg)', borderRadius: '16px', border: '2px solid var(--primary)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '130px 1fr 60px', gap: '0.8rem' }}>
                        <input className="premium-input-field text-accent compact" value={editForm.key} onChange={e => setEditForm({...editForm, key: e.target.value})} placeholder="Clé" />
                        <input className="premium-input-field compact" value={editForm.label} onChange={e => setEditForm({...editForm, label: e.target.value})} placeholder="Libellé" />
                        <input className="premium-input-field compact" type="number" value={editForm.order} onChange={e => setEditForm({...editForm, order: parseInt(e.target.value) || 0})} placeholder="Ordre" />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm({...editForm, isActive: e.target.checked})} className="premium-checkbox" />
                            Actif
                        </label>
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                          <button onClick={handleSaveEdit} className="action-row-btn success"><Check size={18} /></button>
                          <button onClick={handleCancelEdit} className="action-row-btn"><X size={18} /></button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="static-row-container" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: isMobile ? '1fr auto' : '130px 1fr 60px 100px 90px', 
                      gap: '1rem', 
                      padding: isMobile ? '1rem' : '1.2rem 1.5rem', 
                      background: 'var(--glass-bg)', 
                      borderRadius: '16px', 
                      border: '1px solid var(--glass-border)', 
                      alignItems: 'center' 
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ fontWeight: 700, fontSize: isMobile ? '1rem' : '1.1rem' }}>{item.label}</div>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                          <div className="key-display-badge">{item.key}</div>
                          {isMobile && <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>{item.isActive ? "ACTIF" : "INACTIF"}</span>}
                        </div>
                      </div>
                      
                      {!isMobile && (
                        <>
                          <div style={{ color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>{item.order}</div>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>{item.isActive ? "ACTIF" : "INACTIF"}</span>
                          </div>
                        </>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', flexDirection: isMobile ? 'column' : 'row' }}>
                        <button onClick={() => handleStartEdit(item)} className="action-row-btn"><Edit2 size={16} /></button>
                        {!isMobile && <button onClick={() => handleDelete(item.id)} className="action-row-btn danger"><Trash2 size={16} /></button>}
                      </div>
                      {isMobile && (
                         <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--glass-border)', paddingTop: '0.8rem', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ordre : <strong>{item.order}</strong></span>
                            <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Trash2 size={14} /> Supprimer
                            </button>
                         </div>
                      )}
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
        title="Supprimer ?"
        message="Confirmer la suppression ?"
        confirmLabel="Supprimer"
        isDanger={true}
      />

      <style jsx>{`
        .loading-state { padding: 4rem; text-align: center; color: var(--text-muted); font-weight: 700; }
        .form-group-admin { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group-admin label { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; padding-left: 4px; }
        .premium-input-field { background: var(--card-bg); border: 1px solid var(--glass-border); padding: 0.7rem 1rem; border-radius: 10px; color: var(--foreground); font-size: 0.95rem; outline: none; transition: all 0.2s; width: 100%; }
        .premium-input-field:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-transparent); }
        .premium-input-field.compact { padding: 0.5rem 0.8rem; font-size: 0.9rem; }
        .text-accent { color: var(--accent) !important; font-family: monospace; }
        .static-row-container:hover { border-color: var(--primary-transparent) !important; transform: translateX(2px); }
        .key-display-badge { font-family: monospace; color: var(--accent); background: var(--accent-transparent); padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
        .status-badge { font-size: 0.6rem; font-weight: 900; padding: 2px 8px; border-radius: 20px; letter-spacing: 0.05em; }
        .status-badge.active { background: var(--success-transparent); color: var(--success); border: 1px solid var(--success-transparent); }
        .status-badge.inactive { background: var(--danger-transparent); color: var(--danger); border: 1px solid var(--danger-transparent); }
        .action-row-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--glass-bg-accent); border: 1px solid var(--glass-border); border-radius: 10px; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .action-row-btn:hover { background: var(--primary-transparent); color: var(--foreground); border-color: var(--primary); }
        .action-row-btn.danger:hover { background: var(--danger-transparent); color: var(--danger); border-color: var(--danger); }
        .action-row-btn.success:hover { background: var(--success-transparent); color: var(--success); border-color: var(--success); }
        .premium-checkbox { width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; }
      `}</style>
    </PremiumCard>
  );
}
