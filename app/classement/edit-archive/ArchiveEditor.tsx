"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Save, User, Hash, Trophy, Search } from 'lucide-react';
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { saveArchive } from "../actions";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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
  const [entries, setEntries] = useState<any[]>(initialData.rankingData);
  const [isSaving, setIsSaving] = useState(false);

  const addEntry = () => {
    setEntries([...entries, {
      id: `new-${Date.now()}`,
      name: "",
      nafNumber: "",
      userId: null,
      totalPoints: 0,
      bestResults: [],
      count: 0
    }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: string, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const onUserSelect = (index: number, userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      updateEntry(index, 'userId', user.id);
      updateEntry(index, 'name', user.name);
      updateEntry(index, 'nafNumber', user.nafNumber || "");
    }
  };

  const handleSave = async () => {
    if (!year || !name) {
      toast.error("Veuillez remplir l'année et le nom.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await saveArchive(year, name, entries);
      if (res.success) {
        toast.success("Archive sauvegardée !");
        router.push("/classement");
        router.refresh();
      } else {
        toast.error(res.error || "Erreur");
      }
    } catch (e) {
      toast.error("Erreur serveur");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="archive-editor-container">
      <PremiumCard className="archive-settings-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr auto', gap: '2rem', alignItems: 'end' }}>
          <div className="form-group">
            <label>Année CDF</label>
            <input 
              type="number" 
              className="admin-input" 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value))} 
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
          <button 
            className="widget-button" 
            onClick={handleSave}
            disabled={isSaving}
            style={{ padding: '0.8rem 2rem' }}
          >
            {isSaving ? "Sauvegarde..." : <><Save size={18} /> Enregistrer l'Archive</>}
          </button>
        </div>
      </PremiumCard>

      <div className="archive-entries-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
        <h3>Entrées du classement ({entries.length})</h3>
        <button className="admin-action-btn outline" onClick={addEntry}>
          <Plus size={16} /> Ajouter un coach
        </button>
      </div>

      <div className="archive-table-wrapper">
        <table className="admin-table archive-edit-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Rang</th>
              <th>Coach / Utilisateur</th>
              <th style={{ width: '120px' }}>NAF #</th>
              <th style={{ width: '120px' }}>Points Total</th>
              <th style={{ width: '100px' }}>Tournois</th>
              <th style={{ width: '60px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.sort((a,b) => b.totalPoints - a.totalPoints).map((entry, idx) => (
              <tr key={entry.id || idx}>
                <td className="center-text"><strong>{idx + 1}</strong></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        className="admin-input micro" 
                        value={entry.name} 
                        onChange={(e) => updateEntry(idx, 'name', e.target.value)}
                        placeholder="Nom du coach"
                      />
                      <select 
                        className="admin-input micro" 
                        value={entry.userId || ""} 
                        onChange={(e) => onUserSelect(idx, e.target.value)}
                        style={{ maxWidth: '150px' }}
                      >
                        <option value="">-- Lier User --</option>
                        {allUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </td>
                <td>
                  <input 
                    type="text" 
                    className="admin-input micro" 
                    value={entry.nafNumber || ""} 
                    onChange={(e) => updateEntry(idx, 'nafNumber', e.target.value)}
                    placeholder="NAF #"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    step="0.0001"
                    className="admin-input micro" 
                    value={entry.totalPoints} 
                    onChange={(e) => updateEntry(idx, 'totalPoints', parseFloat(e.target.value))}
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    className="admin-input micro" 
                    value={entry.count} 
                    onChange={(e) => updateEntry(idx, 'count', parseInt(e.target.value))}
                  />
                </td>
                <td className="center-text">
                  <button className="icon-btn danger" onClick={() => removeEntry(idx)} title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', opacity: 0.6, fontSize: '0.85rem' }}>
        <p>💡 Le classement est automatiquement trié par points. Les champs sont éditables directement.</p>
        <p>Note: Les détails individuels des tournois (bestResults) ne sont pas éditables ici pour simplifier, mais seront conservés lors de l'archivage automatique.</p>
      </div>

      <style jsx>{`
        .admin-input.micro {
          padding: 0.4rem;
          font-size: 0.85rem;
        }
        .admin-table th {
          background: rgba(255,255,255,0.05);
          text-align: left;
          padding: 0.8rem;
        }
        .center-text {
          text-align: center;
        }
        .icon-btn {
          background: none;
          border: none;
          color: #ff4444;
          cursor: pointer;
          opacity: 0.7;
          transition: 0.2s;
        }
        .icon-btn:hover {
          opacity: 1;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
