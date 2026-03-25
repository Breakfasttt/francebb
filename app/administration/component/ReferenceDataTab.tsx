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

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette donnée ?")) return;

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
    <div className="reference-data-tab fade-in">
      <div className="tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={24} /> Données de Référence
          </h2>
          <p style={{ color: '#888', margin: '0.5rem 0 0' }}>Gérez les listes de valeurs utilisées dans les formulaires.</p>
        </div>
        <button className="primary-btn-admin" onClick={() => setIsCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>
          <Plus size={18} /> Ajouter une valeur
        </button>
      </div>

      <div className="info-box-admin" style={{ background: 'rgba(255, 215, 0, 0.05)', border: '1px solid rgba(255, 215, 0, 0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', gap: '1rem', color: '#ccc', fontSize: '0.9rem' }}>
        <Info size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <p style={{ margin: 0 }}>
          Les données sont regroupées. Le <strong>Groupe</strong> détermine où la donnée est affichée (ex: COACH_REGION, REGION_FRANCE). 
          La <strong>Clé</strong> est la valeur technique stockée en BDD, le <strong>Libellé</strong> est le texte affiché à l'utilisateur.
        </p>
      </div>

      {isCreating && (
        <div className="premium-card creation-form-overlay" style={{ background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--accent)', marginBottom: '2rem', borderStyle: 'dashed' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--accent)' }}>Ajouter une nouvelle donnée</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group-admin">
              <label>Groupe</label>
              <input 
                value={newForm.group} 
                onChange={e => setNewForm({...newForm, group: e.target.value})} 
                placeholder="Ex: REGION_FRANCE"
              />
            </div>
            <div className="form-group-admin">
              <label>Clé (ID technique)</label>
              <input 
                value={newForm.key} 
                onChange={e => setNewForm({...newForm, key: e.target.value})} 
                placeholder="Ex: IDF"
              />
            </div>
            <div className="form-group-admin">
              <label>Libellé (Affiché)</label>
              <input 
                value={newForm.label} 
                onChange={e => setNewForm({...newForm, label: e.target.value})} 
                placeholder="Ex: Île-de-France"
              />
            </div>
            <div className="form-group-admin">
              <label>Ordre</label>
              <input 
                type="number"
                value={newForm.order} 
                onChange={e => setNewForm({...newForm, order: parseInt(e.target.value) || 0})} 
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
             <button onClick={() => setIsCreating(false)} style={{ background: 'transparent', color: '#ff4d4d', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
             <button onClick={handleCreate} disabled={isPending} className="primary-btn-admin">
                {isPending ? "Création..." : "Créer la donnée"}
             </button>
          </div>
        </div>
      )}

      {Object.keys(groupedData).sort().map(group => (
        <section key={group} className="ref-group-section" style={{ marginBottom: '3rem' }}>
          <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#aaa', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Groupe : <span style={{ color: 'white' }}>{group}</span>
          </h3>
          
          <div className="ref-table" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="ref-row header" style={{ display: 'grid', gridTemplateColumns: '200px 300px 100px 100px 1fr', gap: '1rem', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', color: '#666', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <div>Clé</div>
              <div>Libellé</div>
              <div>Ordre</div>
              <div>Statut</div>
              <div style={{ textAlign: 'right' }}>Actions</div>
            </div>

            {groupedData[group].map((item: ReferenceData) => (
              <div key={item.id} className={`ref-row ${editingId === item.id ? 'editing' : ''}`} style={{ display: 'grid', gridTemplateColumns: '200px 300px 100px 100px 1fr', gap: '1rem', padding: '1rem', background: 'rgba(20, 20, 20, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)', alignItems: 'center' }}>
                {editingId === item.id ? (
                  <>
                    <input value={editForm.key} onChange={e => setEditForm({...editForm, key: e.target.value})} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--accent)' }}/>
                    <input value={editForm.label} onChange={e => setEditForm({...editForm, label: e.target.value})} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--accent)' }} />
                    <input type="number" value={editForm.order} onChange={e => setEditForm({...editForm, order: parseInt(e.target.value) || 0})} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--accent)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm({...editForm, isActive: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                        <span style={{ fontSize: '0.8rem' }}>Actif</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                      <button onClick={handleSaveEdit} className="icon-btn success" title="Enregistrer"><Check size={18} /></button>
                      <button onClick={handleCancelEdit} className="icon-btn" title="Annuler"><X size={18} /></button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: '0.9rem' }}>{item.key}</div>
                    <div style={{ fontWeight: 600 }}>{item.label}</div>
                    <div style={{ color: '#888' }}>{item.order}</div>
                    <div>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: 700,
                        background: item.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: item.isActive ? '#22c55e' : '#ef4444'
                      }}>
                        {item.isActive ? "ACTIF" : "INACTIF"}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                      <button onClick={() => handleStartEdit(item)} className="icon-btn" title="Modifier"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="icon-btn danger" title="Supprimer"><Trash2 size={16} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <style jsx>{`
        .form-group-admin {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group-admin label { font-size: 0.75rem; font-weight: 700; color: #777; text-transform: uppercase; }
        .form-group-admin input {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          padding: 0.6rem 0.8rem;
          border-radius: 6px;
          color: white;
          outline: none;
        }
        .form-group-admin input:focus { border-color: var(--accent); }
        
        .ref-row input {
           padding: 0.4rem 0.6rem;
           border-radius: 4px;
           color: white;
           font-size: 0.9rem;
           width: 100%;
        }

        .icon-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          border-radius: 6px;
          color: #888;
          cursor: pointer;
          transition: all 0.2s;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.08); color: white; }
        .icon-btn.danger:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }
        .icon-btn.success:hover { background: rgba(34, 197, 94, 0.1); color: #22c55e; border-color: #22c55e; }
        
        .primary-btn-admin {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .primary-btn-admin:hover:not(:disabled) {
           filter: brightness(1.1);
           transform: translateY(-2px);
           box-shadow: 0 4px 12px rgba(194, 29, 29, 0.3);
        }
        .primary-btn-admin:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
