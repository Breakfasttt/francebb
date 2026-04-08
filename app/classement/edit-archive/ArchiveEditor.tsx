"use client";

/**
 * Composant ArchiveEditor
 * Permet l'édition manuelle ou la modification d'une archive de classement CDF.
 * Style harmonisé avec les thèmes BBFrance.
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, User, Hash, Trophy, Search, Info, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { saveArchive } from "../actions";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import UserMapper from '@/common/components/UserMapper/UserMapper';

interface ArchiveEditorProps {
  initialData: {
    year: number;
    name: string;
    rankingData: any[];
  };
  allUsers: any[];
}

export default function ArchiveEditor({ initialData, allUsers }: ArchiveEditorProps) {
  const router = useRouter();
  const [year, setYear] = useState(initialData.year);
  const [name, setName] = useState(initialData.name);
  const [entries, setEntries] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Initialisation et hydratation des users
  useEffect(() => {
    const hydratedEntries = initialData.rankingData.map(entry => {
      const user = entry.userId ? allUsers.find(u => u.id === entry.userId) : null;
      // S'assurer que bestResults est un tableau
      const bestResults = Array.isArray(entry.bestResults) ? entry.bestResults : [];
      return { ...entry, user, bestResults };
    });
    setEntries(hydratedEntries);
  }, [initialData.rankingData, allUsers]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addEntry = () => {
    const newId = `new-${Date.now()}`;
    setEntries([{
      id: newId,
      name: "",
      nafNumber: "",
      userId: null,
      user: null,
      totalPoints: 0,
      bestResults: [
        { name: "", rank: 0, points: 0 },
        { name: "", rank: 0, points: 0 },
        { name: "", rank: 0, points: 0 },
        { name: "", rank: 0, points: 0 }
      ],
      count: 0
    }, ...entries]);
    toggleRow(newId);
    toast.success("Nouveau coach ajouté");
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: string, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const updateBestResult = (entryIndex: number, resultIndex: number, field: string, value: any) => {
    const newEntries = [...entries];
    const results = [...newEntries[entryIndex].bestResults];
    
    // Initialiser si nécessaire
    while (results.length <= resultIndex) {
      results.push({ name: "", rank: 0, points: 0 });
    }
    
    results[resultIndex] = { ...results[resultIndex], [field]: value };
    newEntries[entryIndex].bestResults = results;
    setEntries(newEntries);
  };

  const onUserSelect = (index: number, user: any) => {
    const currentEntry = entries[index];
    updateEntry(index, 'userId', user.id);
    updateEntry(index, 'user', user);
    
    // Si pas de nom saisi
    if (!currentEntry.name) updateEntry(index, 'name', user.name);
    
    // Remplir le NAF uniquement s'il est vide (demande utilisateur)
    if (!currentEntry.nafNumber && user.nafNumber) {
      updateEntry(index, 'nafNumber', user.nafNumber);
      toast.success(`NAF #${user.nafNumber} récupéré du compte`);
    }
  };

  const onUserRemove = (index: number) => {
    updateEntry(index, 'userId', null);
    updateEntry(index, 'user', null);
  };

  const handleSave = async () => {
    if (!year || isNaN(year) || !name) {
      toast.error("Veuillez remplir l'année et le nom avec des valeurs valides.");
      return;
    }
    setIsSaving(true);
    try {
      const cleanEntries = entries.map(({ user, ...rest }) => rest);
      const res = await saveArchive(year, name, cleanEntries);
      if (res.success) {
        toast.success("Archive sauvegardée !");
        router.push("/classement");
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de la sauvegarde.");
      }
    } catch (e) {
      toast.error("Une erreur serveur est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  const sortedEntries = [...entries].sort((a,b) => b.totalPoints - a.totalPoints);

  return (
    <div className="archive-editor-container">
      <PremiumCard className="archive-settings-card">
        <div className="archive-settings-grid">
          <div className="form-group">
            <label>Année CDF</label>
            <input 
              type="number" 
              className="admin-input" 
              value={isNaN(year) ? "" : year} 
              onChange={(e) => setYear(e.target.value === "" ? NaN : parseInt(e.target.value))} 
            />
          </div>
          <div className="form-group">
            <label>Nom de l'Archive</label>
            <input 
              type="text" 
              className="admin-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ex: Championnat de France 2026"
            />
          </div>
          <button className="widget-button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Sauvegarde..." : <><Save size={18} /> Enregistrer l'Archive</>}
          </button>
        </div>
      </PremiumCard>

      <div className="archive-entries-header">
        <h3>Entrées du classement ({entries.length})</h3>
        <button className="admin-action-btn outline" onClick={addEntry}>
          <PlusCircle size={16} /> Ajouter un coach
        </button>
      </div>

      <div className="archive-table-wrapper">
        <table className="archive-edit-table">
          <thead>
            <tr>
              <th className="center-text" style={{ width: '40px' }}></th>
              <th className="center-text" style={{ width: '60px' }}>Rang</th>
              <th>Coach / Utilisateur</th>
              <th style={{ width: '130px' }}>NAF #</th>
              <th style={{ width: '130px' }}>Points Total</th>
              <th style={{ width: '90px' }}>Nb Tour.</th>
              <th className="center-text" style={{ width: '80px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry, idx) => {
              const originalIndex = entries.findIndex(e => e.id === entry.id);
              const isExpanded = expandedRows[entry.id];
              
              return (
                <React.Fragment key={entry.id}>
                  <tr className={isExpanded ? 'expanded-parent' : ''}>
                    <td className="center-text">
                      <button className="icon-btn" onClick={() => toggleRow(entry.id)}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </td>
                    <td className="center-text"><strong>{idx + 1}</strong></td>
                    <td>
                      <div className="linked-user-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <input 
                          type="text" 
                          className="admin-input micro" 
                          value={entry.name} 
                          onChange={(e) => updateEntry(originalIndex, 'name', e.target.value)}
                          placeholder="Nom coach"
                        />
                        <UserMapper 
                          selectedUser={entry.user}
                          onSelect={(user) => onUserSelect(originalIndex, user)}
                          onRemove={() => onUserRemove(originalIndex)}
                          placeholder="Lier..."
                          className="micro-mapper"
                        />
                      </div>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="admin-input micro" 
                        value={entry.nafNumber || ""} 
                        onChange={(e) => updateEntry(originalIndex, 'nafNumber', e.target.value)}
                        placeholder="NAF #"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        step="0.0001"
                        className="admin-input micro" 
                        value={isNaN(entry.totalPoints) ? "" : entry.totalPoints} 
                        onChange={(e) => updateEntry(originalIndex, 'totalPoints', e.target.value === "" ? 0 : parseFloat(e.target.value))}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        className="admin-input micro" 
                        value={isNaN(entry.count) ? "" : entry.count} 
                        onChange={(e) => updateEntry(originalIndex, 'count', e.target.value === "" ? 0 : parseInt(e.target.value))}
                      />
                    </td>
                    <td className="center-text">
                      <button className="icon-btn danger" onClick={() => removeEntry(originalIndex)} title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="details-row">
                      <td colSpan={7}>
                        <div className="results-grid-editor">
                          <h4>Meilleurs résultats retenus (Top 4)</h4>
                          <div className="results-grid">
                            {[0, 1, 2, 3].map((resIdx) => {
                              const res = entry.bestResults[resIdx] || { name: "", rank: 0, points: 0 };
                              return (
                                <div key={resIdx} className="result-item-form">
                                  <span className="res-label">Tournoi {resIdx + 1}</span>
                                  <div className="res-inputs">
                                    <input 
                                      type="text" 
                                      className="admin-input micro" 
                                      placeholder="Nom tournoi" 
                                      value={res.name}
                                      onChange={(e) => updateBestResult(originalIndex, resIdx, 'name', e.target.value)}
                                    />
                                    <input 
                                      type="number" 
                                      className="admin-input micro" 
                                      placeholder="Rang" 
                                      value={res.rank === 0 ? "" : res.rank}
                                      onChange={(e) => updateBestResult(originalIndex, resIdx, 'rank', e.target.value === "" ? 0 : parseInt(e.target.value))}
                                    />
                                    <input 
                                      type="number" 
                                      step="0.0001"
                                      className="admin-input micro" 
                                      placeholder="Points" 
                                      value={res.points === 0 ? "" : res.points}
                                      onChange={(e) => updateBestResult(originalIndex, resIdx, 'points', e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {entries.length === 0 && (
              <tr>
                <td colSpan={7} className="center-text" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
                  Aucune donnée saisie. Cliquez sur "Ajouter un coach" pour commencer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="meta-info-footer">
        <p><Info size={16} /> Utilisez les flèches à gauche pour saisir le détail des tournois individuels.</p>
        <p><Info size={16} /> Le remplissage automatique NAF ne se déclenche que si le champ est vide.</p>
        <p><Info size={16} /> Note : Le "Points Total" est le score officiel calculé sur la saison.</p>
      </div>

      <style jsx global>{`
        .micro-mapper .mapper-input {
            padding: 0.5rem 0.7rem 0.5rem 2rem !important;
            font-size: 0.85rem !important;
        }
        .micro-mapper .selected-user-badge {
            padding: 0.3rem 0.6rem !important;
        }
        .micro-mapper .mapper-results-popover {
            top: 100% !important;
        }
        .details-row {
          background: rgba(0, 0, 0, 0.2) !important;
        }
        .details-row td {
          padding: 0 !important;
        }
        .results-grid-editor {
          padding: 1.5rem;
          border-left: 3px solid var(--accent);
          background: rgba(var(--accent-rgb), 0.03);
          border-bottom: 1px solid var(--glass-border);
        }
        .results-grid-editor h4 {
          font-size: 0.8rem;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 1.2rem;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .results-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem 2rem;
        }
        .result-item-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .res-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .res-inputs {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 0.5rem;
        }
        .expanded-parent {
          background: rgba(var(--accent-rgb), 0.05) !important;
        }
        @media (max-width: 1024px) {
          .results-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
