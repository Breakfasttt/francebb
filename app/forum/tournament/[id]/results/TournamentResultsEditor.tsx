"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Upload, Save, ChevronLeft, Trash2, 
  Plus, Users, Swords, Search, AlertCircle,
  Link as LinkIcon, RefreshCw, Layers
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import PremiumCard from '@/common/components/PremiumCard/PremiumCard';
import { saveTournamentResults, parseNafReport } from '@/app/tournaments/actions';
import "./TournamentResultsEditor.css";

interface TournamentResultsEditorProps {
  tournament: any;
  allUsers: any[];
}

export default function TournamentResultsEditor({ tournament, allUsers }: TournamentResultsEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ranking' | 'matches'>('ranking');
  const [isSaving, setIsSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Valeurs par défaut extraites du tournoi
  const [results, setResults] = useState(tournament.results || []);
  const [rounds, setRounds] = useState(tournament.rounds || []);

  const OFFICIAL_ROSTERS = [
    "Amazon", "Chaos Chosen", "Chaos Dwarf", "Chaos Renegade", "Dark Elf", 
    "Dwarf", "Elf Union", "Goblin", "Halfling", "High Elf", "Human", 
    "Imperial Nobility", "Khorne", "Lizardmen", "Nurgle", "Necromantic Horror", 
    "Norse", "Ogre", "Old World Alliance", "Orc", "Shambling Undead", 
    "Skaven", "Snotling", "Tomb Kings", "Underworld Denizens", "Vampire", "Wood Elf"
  ];

  // Mapping automatique des utilisateurs par pseudonyme (sensible à la casse)
  useEffect(() => {
    if (results.length > 0 && results.some(r => !r.userId)) {
      const updatedResults = [...results];
      let changed = false;
      
      updatedResults.forEach((res: any) => {
        if (!res.userId) {
          const userMatch = allUsers.find((u: any) => u.name?.toLowerCase() === res.coachName.toLowerCase());
          if (userMatch) {
            res.userId = userMatch.id;
            res.user = userMatch;
            changed = true;
          }
        }
      });
      
      if (changed) setResults(updatedResults);
    }
  }, [results, allUsers]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const xmlContent = event.target?.result as string;
      const data = await parseNafReport(xmlContent);
      
      if (data) {
        setResults(data.results.map((r: any) => {
           // Tentative de mapping sur l'existant
           const existing = results.find((ex: any) => ex.coachName === r.coachName);
           return { ...r, id: existing?.id, userId: existing?.userId, user: existing?.user };
        }));
        setRounds(data.rounds);
        toast.success("Rapport NAF importé avec succès !");
      } else {
        toast.error("Erreur lors du parsing du fichier XML.");
      }
      setIsParsing(false);
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const response = await saveTournamentResults(tournament.id, { results, rounds });
    if (response.success) {
      toast.success("Résultats sauvegardés !");
      router.refresh();
      router.push(`/forum/topic/${tournament.topic?.id}`);
    } else {
      toast.error(response.error || "Une erreur est survenue.");
    }
    setIsSaving(false);
  };

  const addRound = () => {
    const nextNumber = rounds.length + 1;
    setRounds([...rounds, { roundNumber: nextNumber, matches: [] }]);
  };

  const addMatch = (roundIndex: number) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].matches.push({
      coach1Name: "",
      coach2Name: "",
      coach1TD: 0,
      coach2TD: 0,
      coach1Casualties: 0,
      coach2Casualties: 0,
      tableNumber: updatedRounds[roundIndex].matches.length + 1
    });
    setRounds(updatedRounds);
  };

  const removeMatch = (roundIndex: number, matchIndex: number) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].matches.splice(matchIndex, 1);
    setRounds(updatedRounds);
  };

  const updateMatchField = (roundIndex: number, matchIndex: number, field: string, value: any) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].matches[matchIndex][field] = value;
    setRounds(updatedRounds);
  };

  const updateResultField = (index: number, field: string, value: any) => {
    const updatedResults = [...results];
    updatedResults[index][field] = value;
    setResults(updatedResults);
  };

  const handleAddCoach = () => {
    setResults([...results, { coachName: "", roster: "", wins: 0, draws: 0, losses: 0, casualties: 0, points: 0, rank: results.length + 1 }]);
  };

  return (
    <div className="results-editor">
      <div className="editor-header">
        <div>
          <h1 className="editor-title">Gérer les résultats</h1>
          <p className="editor-subtitle">{tournament.topic?.title || tournament.name}</p>
        </div>
        <div className="header-actions">
          <label className="import-btn">
            <Upload size={16} /> Rapport NAF XML
            <input type="file" onChange={handleFileUpload} accept=".xml" hidden disabled={isParsing} />
          </label>
          <button className="save-btn" onClick={handleSave} disabled={isSaving}>
            <Save size={16} /> {isSaving ? "Sauvegarde..." : "Enregistrer tout"}
          </button>
        </div>
      </div>

      <div className="editor-tabs">
        <button className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}>
          <Trophy size={16} /> Classement Global
        </button>
        <button className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>
          <Swords size={16} /> Rondes & Matchs
        </button>
      </div>

      <PremiumCard className="editor-content-card">
        {activeTab === 'ranking' ? (
          <div className="ranking-section">
            <div className="section-header">
              <h3>Classement du tournoi</h3>
              <button className="add-item-btn" onClick={handleAddCoach}>
                <Plus size={14} /> Ajouter un coach
              </button>
            </div>
            
            <div className="table-responsive">
              <table className="editor-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>Rank</th>
                    <th style={{ width: '250px' }}>Coach (Nom)</th>
                    <th>Forum User</th>
                    <th style={{ width: '180px' }}>Roster</th>
                    <th style={{ width: '60px' }}>V</th>
                    <th style={{ width: '60px' }}>N</th>
                    <th style={{ width: '60px' }}>D</th>
                    <th style={{ width: '60px' }}>CAS</th>
                    <th style={{ width: '80px' }}>Points</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((res: any, idx: number) => (
                    <tr key={idx}>
                      <td><input type="number" value={res.rank || ''} onChange={(e) => updateResultField(idx, 'rank', e.target.value)} /></td>
                      <td><input type="text" value={res.coachName} onChange={(e) => updateResultField(idx, 'coachName', e.target.value)} placeholder="Nom coach..." /></td>
                      <td>
                        <div className="user-mapping">
                          {res.user && (
                            <img src={res.user.image || "/default-avatar.png"} alt="" className="mini-avatar" title={res.user.name} />
                          )}
                          <select 
                            value={res.userId || ""} 
                            onChange={(e) => {
                              const user = allUsers.find(u => u.id === e.target.value);
                              updateResultField(idx, 'userId', e.target.value);
                              updateResultField(idx, 'user', user);
                            }}
                          >
                            <option value="">Aucun mapping</option>
                            {allUsers.map(u => (
                              <option key={u.id} value={u.id}>{u.name} {u.nafNumber ? `(${u.nafNumber})` : ''}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td>
                        <input list={`rosters-${idx}`} value={res.roster || ''} onChange={(e) => updateResultField(idx, 'roster', e.target.value)} placeholder="Race..." />
                        <datalist id={`rosters-${idx}`}>
                          {OFFICIAL_ROSTERS.map(r => <option key={r} value={r} />)}
                        </datalist>
                      </td>
                      <td><input type="number" value={res.wins} onChange={(e) => updateResultField(idx, 'wins', e.target.value)} /></td>
                      <td><input type="number" value={res.draws} onChange={(e) => updateResultField(idx, 'draws', e.target.value)} /></td>
                      <td><input type="number" value={res.losses} onChange={(e) => updateResultField(idx, 'losses', e.target.value)} /></td>
                      <td><input type="number" value={res.casualties} onChange={(e) => updateResultField(idx, 'casualties', e.target.value)} /></td>
                      <td><input type="number" value={res.points} onChange={(e) => updateResultField(idx, 'points', e.target.value)} step="0.5" /></td>
                      <td>
                        <button className="delete-row-btn" onClick={() => {
                          const updated = [...results];
                          updated.splice(idx, 1);
                          setResults(updated);
                        }}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounds-section">
            <div className="section-header">
              <h3>Détail des matchs par ronde</h3>
              <button className="add-item-btn" onClick={addRound}>
                <Plus size={14} /> Ajouter une ronde
              </button>
            </div>

            {rounds.map((round: any, rIdx: number) => (
              <div key={rIdx} className="round-item">
                <div className="round-header">
                  <h4>Ronde {round.roundNumber}</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="mini-btn-action" onClick={() => addMatch(rIdx)}>
                      <Plus size={12} /> Nouveau Match
                    </button>
                    <button className="mini-btn-action danger" onClick={() => {
                      const updated = [...rounds];
                      updated.splice(rIdx, 1);
                      setRounds(updated);
                    }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="matches-editor-list">
                  <div className="match-row-header">
                    <span style={{ width: '40px' }}>Tab</span>
                    <span style={{ flex: 2 }}>Coach 1</span>
                    <span style={{ width: '40px' }}>TD</span>
                    <span style={{ width: '40px' }}>CAS</span>
                    <span style={{ width: '20px' }}></span>
                    <span style={{ width: '40px' }}>TD</span>
                    <span style={{ width: '40px' }}>CAS</span>
                    <span style={{ flex: 2 }}>Coach 2</span>
                    <span style={{ width: '30px' }}></span>
                  </div>
                  {round.matches.map((match: any, mIdx: number) => (
                    <div key={mIdx} className="match-row">
                      <input type="number" className="mini-input" value={match.tableNumber || ''} onChange={(e) => updateMatchField(rIdx, mIdx, 'tableNumber', e.target.value)} style={{ width: '40px' }} />
                      
                      <div className="coach-selector-small">
                        <input list={`all-coaches-${rIdx}-${mIdx}`} value={match.coach1Name} onChange={(e) => updateMatchField(rIdx, mIdx, 'coach1Name', e.target.value)} />
                        <datalist id={`all-coaches-${rIdx}-${mIdx}`}>
                          {results.map((c: any) => <option key={c.coachName} value={c.coachName} />)}
                        </datalist>
                      </div>

                      <input type="number" className="mini-input" value={match.coach1TD} onChange={(e) => updateMatchField(rIdx, mIdx, 'coach1TD', e.target.value)} />
                      <input type="number" className="mini-input" value={match.coach1Casualties} onChange={(e) => updateMatchField(rIdx, mIdx, 'coach1Casualties', e.target.value)} />
                      
                      <span className="vs-sep">vs</span>

                      <input type="number" className="mini-input" value={match.coach2TD} onChange={(e) => updateMatchField(rIdx, mIdx, 'coach2TD', e.target.value)} />
                      <input type="number" className="mini-input" value={match.coach2Casualties} onChange={(e) => updateMatchField(rIdx, mIdx, 'coach2Casualties', e.target.value)} />

                      <div className="coach-selector-small">
                        <input list={`all-coaches-2-${rIdx}-${mIdx}`} value={match.coach2Name} onChange={(e) => updateMatchField(rIdx, mIdx, 'coach2Name', e.target.value)} />
                        <datalist id={`all-coaches-2-${rIdx}-${mIdx}`}>
                          {results.map((c: any) => <option key={c.coachName} value={c.coachName} />)}
                        </datalist>
                      </div>

                      <button className="delete-match-btn" onClick={() => removeMatch(rIdx, mIdx)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {round.matches.length === 0 && <p className="empty-hint">Aucun match dans cette ronde.</p>}
                </div>
              </div>
            ))}
            {rounds.length === 0 && <p className="empty-hint">Ajoutez une ronde pour commencer la saisie des matchs.</p>}
          </div>
        )}
      </PremiumCard>
    </div>
  );
}
