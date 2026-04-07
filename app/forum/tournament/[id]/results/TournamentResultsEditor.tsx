"use client";

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Swords, 
  Edit2, 
  User as UserIcon, 
  Trash2, 
  Plus, 
  Upload, 
  Save, 
  GripVertical, 
  AlertTriangle 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import PremiumCard from '@/common/components/PremiumCard/PremiumCard';
import { saveTournamentResults, parseNafReport } from '@/app/tournaments/actions';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import UserMapper from '@/common/components/UserMapper/UserMapper';
import { calculateCdfPoints, CdfTournamentType } from '@/common/utils/cdf';
import "./TournamentResultsEditor.css";

interface TournamentResultsEditorProps {
  tournament: any;
  allUsers: any[];
}

const NumberInput = ({ value, onChange, className, step = 1, style, readOnly, disabled, tabIndex }: any) => (
  <input 
    type="number" 
    className={`${className} no-arrows`}
    value={value === null || value === undefined ? '' : value} 
    min="0"
    step={step}
    style={style}
    readOnly={readOnly}
    disabled={disabled}
    tabIndex={tabIndex}
    onKeyDown={(e) => {
      if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') e.preventDefault();
    }}
    onChange={(e) => {
      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
      onChange(isNaN(val) ? 0 : Math.max(0, val));
    }}
  />
);

const SortableRow = ({ res, idx, updateResultField, removeResult, OFFICIAL_ROSTERS, isCDF }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: res.tempId || `res-${res.id || idx}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? 'var(--accent-transparent)' : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td>
        <div className="drag-handle" {...attributes} {...listeners}>
          <GripVertical size={16} />
        </div>
      </td>
      <td><NumberInput value={res.rank} onChange={(val: number) => updateResultField(idx, 'rank', val)} style={{ width: '40px' }} /></td>
      <td>
        <input 
          type="text" 
          value={res.nafNumber || ''} 
          onChange={(e) => updateResultField(idx, 'nafNumber', e.target.value)} 
          placeholder="NAF..." 
          style={{ width: '80px' }}
        />
      </td>
      <td><input type="text" value={res.coachName} onChange={(e) => updateResultField(idx, 'coachName', e.target.value)} placeholder="Nom coach..." /></td>
      <td className="user-mapper-cell">
        <UserMapper 
          selectedUser={res.user}
          onSelect={(user: any) => {
            updateResultField(idx, 'userId', user.id);
            updateResultField(idx, 'user', user);
          }}
          onRemove={() => {
            updateResultField(idx, 'userId', null);
            updateResultField(idx, 'user', null);
          }}
          placeholder="Forum user..."
        />
      </td>
      <td>
        <input 
          list={`rosters-${idx}`} 
          className="roster-input"
          value={res.roster || ''} 
          onChange={(e) => updateResultField(idx, 'roster', e.target.value)} 
          placeholder="Race..." 
          style={{ width: '100%' }}
        />
        <datalist id={`rosters-${idx}`}>
          {OFFICIAL_ROSTERS.map((r: string) => <option key={r} value={r} />)}
        </datalist>
      </td>
      <td><NumberInput value={res.wins} onChange={(val: number) => updateResultField(idx, 'wins', val)} /></td>
      <td><NumberInput value={res.draws} onChange={(val: number) => updateResultField(idx, 'draws', val)} /></td>
      <td><NumberInput value={res.losses} onChange={(val: number) => updateResultField(idx, 'losses', val)} /></td>
      <td><NumberInput value={res.casualties} onChange={(val: number) => updateResultField(idx, 'casualties', val)} /></td>
      <td>
        <NumberInput 
          value={res.points} 
          onChange={(val: number) => updateResultField(idx, 'points', val)} 
          step="0.0001" 
          style={{ width: '80px', opacity: isCDF ? 0.6 : 1 }}
          className={isCDF ? 'readonly-input' : ''}
          readOnly={isCDF}
          tabIndex={isCDF ? -1 : 0}
        />
      </td>
      <td>
        <button className="delete-row-btn" onClick={() => removeResult(idx)}><Trash2 size={14} /></button>
      </td>
    </tr>
  );
};

export default function TournamentResultsEditor({ tournament, allUsers }: TournamentResultsEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ranking' | 'matches'>('ranking');
  const [isSaving, setIsSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const [results, setResults] = useState((tournament.results || []).map((r: any, i: number) => ({ ...r, tempId: `res-${i}-${Date.now()}` })));
  const [rounds, setRounds] = useState(tournament.rounds || []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const OFFICIAL_ROSTERS = [
    "Amazon", "Chaos Chosen", "Chaos Dwarf", "Chaos Renegade", "Dark Elf", 
    "Dwarf", "Elf Union", "Goblin", "Halfling", "High Elf", "Human", 
    "Imperial Nobility", "Khorne", "Lizardmen", "Nurgle", "Necromantic Horror", 
    "Norse", "Ogre", "Old World Alliance", "Orc", "Shambling Undead", 
    "Skaven", "Snotling", "Tomb Kings", "Underworld Denizens", "Vampire", "Wood Elf"
  ];

  useEffect(() => {
    if (results.length > 0 && results.some((r: any) => !r.userId)) {
      const updatedResults = [...results];
      let changed = false;
      
      updatedResults.forEach((res: any) => {
        if (!res.userId) {
          // 1. Priorité Numéro NAF
          let userMatch = res.nafNumber ? allUsers.find((u: any) => u.nafNumber === res.nafNumber) : null;
          
          // 2. Priorité Pseudo
          if (!userMatch) {
            userMatch = allUsers.find((u: any) => u.name?.toLowerCase() === res.coachName.toLowerCase());
          }

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

  // Recalculer les points CDF quand la liste ou les rangs changent
  useEffect(() => {
    if (tournament.isCDF && results.length > 0) {
      const numParticipants = results.length;
      const roundsAtVenue = parseInt(tournament.days || "1") * 3;
      const numRounds = tournament.totalMatches || roundsAtVenue || 5; 
      const typeCDF = (tournament.typeCDF || "INDIVIDUEL") as CdfTournamentType;

      const updatedResults = results.map((res: any) => {
        const newPoints = calculateCdfPoints(
          typeCDF,
          numRounds,
          numParticipants,
          res.rank || 0
        );
        if (res.points !== newPoints) {
          return { ...res, points: newPoints };
        }
        return res;
      });

      const hasChanged = updatedResults.some((res: any, i: number) => res.points !== results[i].points);
      if (hasChanged) {
        setResults(updatedResults);
      }
    }
    // Correction : inclure le coachName dans la dépendance pour détecter les changements d'ordre
  }, [
    results.length, 
    tournament.isCDF, 
    tournament.typeCDF, 
    tournament.totalMatches, 
    tournament.days, 
    results.map((r: any) => `${r.coachName}-${r.rank}`).join(',')
  ]);



  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setResults((items: any[]) => {
        const oldIndex = items.findIndex((i) => (i.tempId || `res-${items.indexOf(i)}`) === active.id);
        const newIndex = items.findIndex((i) => (i.tempId || `res-${items.indexOf(i)}`) === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, idx) => ({ ...item, rank: idx + 1 }));
      });
    }
  };

  const autoSortResults = (data: any[]) => {
    return [...data].sort((a, b) => {
      if ((parseFloat(b.points) || 0) !== (parseFloat(a.points) || 0)) return (parseFloat(b.points) || 0) - (parseFloat(a.points) || 0);
      if ((parseInt(b.wins) || 0) !== (parseInt(a.wins) || 0)) return (parseInt(b.wins) || 0) - (parseInt(a.wins) || 0);
      if ((parseInt(a.losses) || 0) !== (parseInt(b.losses) || 0)) return (parseInt(a.losses) || 0) - (parseInt(b.losses) || 0);
      return (parseInt(b.casualties) || 0) - (parseInt(a.casualties) || 0);
    }).map((r, i) => ({ ...r, rank: i + 1 }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const xmlContent = event.target?.result as string;
      const data = await parseNafReport(xmlContent);
      
      if (data) {
        // Remplacer complètement les résultats (plus de fusion)
        let newResults = data.results.map((r: any) => ({
           ...r, 
           tempId: `res-import-${Math.random()}` 
        }));

        // Tri automatique et attribution des rangs
        newResults = autoSortResults(newResults);
        
        // Force recalculation of points for newResults to ensure they are visible immediately
        if (tournament.isCDF) {
          const numParticipants = newResults.length;
          const roundsAtVenue = parseInt(tournament.days || "1") * 3;
          const numRounds = tournament.totalMatches || roundsAtVenue || 5;
          const typeCDF = (tournament.typeCDF || "INDIVIDUEL") as CdfTournamentType;

          newResults = newResults.map((res: any) => ({
            ...res,
            points: calculateCdfPoints(typeCDF, numRounds, numParticipants, res.rank || 0)
          }));
        }

        setResults(newResults);
        setRounds(data.rounds);
        toast.success("Rapport NAF importé ! Données réinitialisées et triées.");
      } else {
        toast.error("Erreur lors du parsing du fichier XML.");
      }
      setIsParsing(false);
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // NETTOYAGE DES DONNÉES pour éviter les erreurs de sérialisation [Object]
    const cleanResults = results.map((res: any) => ({
      coachName: res.coachName,
      nafNumber: res.nafNumber ? String(res.nafNumber) : null,
      userId: res.userId || null,
      roster: res.roster || null,
      wins: Number(res.wins) || 0,
      draws: Number(res.draws) || 0,
      losses: Number(res.losses) || 0,
      casualties: Number(res.casualties) || 0,
      points: Number(res.points) || 0,
      rank: res.rank ? Number(res.rank) : null,
      autoCalculate: res.autoCalculate ?? true
    }));

    const cleanRounds = rounds.map((rnd: any) => ({
      roundNumber: Number(rnd.roundNumber),
      matches: rnd.matches.map((m: any) => ({
        tableNumber: m.tableNumber ? Number(m.tableNumber) : null,
        coach1Name: m.coach1Name,
        coach1UserId: m.coach1UserId || null,
        coach2Name: m.coach2Name,
        coach2UserId: m.coach2UserId || null,
        coach1TD: Number(m.coach1TD) || 0,
        coach1Casualties: Number(m.coach1Casualties) || 0,
        coach2TD: Number(m.coach2TD) || 0,
        coach2Casualties: Number(m.coach2Casualties) || 0
      }))
    }));

    const response = await saveTournamentResults(tournament.id, { results: cleanResults, rounds: cleanRounds });
    if (response.success) {
      toast.success("Résultats publiés avec succès !");
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
    
    // Si on change le rang manuellement, on peut vouloir re-trier automatiquement
    // mais pour ne pas perturber la saisie, on le fera seulement si le champ perd le focus 
    // ou on recalcule simplement les points CDF immédiatement ici
    if (field === 'rank' && tournament.isCDF) {
       const numParticipants = updatedResults.length;
       const roundsAtVenue = parseInt(tournament.days || "1") * 3;
       const numRounds = tournament.totalMatches || roundsAtVenue || 5;
       const typeCDF = (tournament.typeCDF || "INDIVIDUEL") as CdfTournamentType;

       updatedResults[index].points = calculateCdfPoints(
         typeCDF,
         numRounds,
         numParticipants,
         Number(value) || 0
       );
    }

    setResults(updatedResults);
  };

  const handleAddCoach = () => {
    setResults([...results, { coachName: "", roster: "", wins: 0, draws: 0, losses: 0, casualties: 0, points: 0, rank: results.length + 1, tempId: `res-new-${Date.now()}` }]);
  };

  const removeResult = (idx: number) => {
    const updated = [...results];
    updated.splice(idx, 1);
    setResults(updated);
  };

  return (
    <div className="results-editor">
      <div className="editor-top-actions" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
        <button className="save-btn" onClick={handleSave} disabled={isSaving}>
          <Save size={16} /> {isSaving ? "Publication..." : "Publier les résultats"}
        </button>
        <label className="import-btn">
          <Upload size={16} /> Rapport NAF XML
          <input type="file" onChange={handleFileUpload} hidden disabled={isParsing} />
        </label>
      </div>

      <div className="naf-disclaimer">
        <AlertTriangle size={20} className="disclaimer-icon" />
        <div className="disclaimer-text">
          <strong>Note importante sur l&apos;import NAF :</strong> Le fichier XML ne contient pas les données de classement final. 
          Il ne prend pas en compte les tie-breakers spécifiques à votre tournoi (ex: SOS, Opp-Opp, Points de peinture...). 
          Le classement doit être contrôlé et ajusté manuellement après l&apos;import.
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
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="add-item-btn secondary" onClick={() => setResults(autoSortResults(results))}>
                   <Trophy size={14} /> Trier par rang
                </button>
                <button className="add-item-btn" onClick={handleAddCoach}>
                  <Plus size={14} /> Ajouter un coach
                </button>
              </div>
            </div>
            
            <div className="table-responsive">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <table className="editor-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30px' }}></th>
                      <th style={{ width: '50px' }}>Rank</th>
                      <th style={{ width: '100px' }}>NAF #</th>
                      <th style={{ width: '150px' }}>Coach (Nom)</th>
                      <th>Forum User Mapping</th>
                      <th style={{ width: '150px' }}>Roster</th>
                      <th style={{ width: '60px' }}>V</th>
                      <th style={{ width: '60px' }}>N</th>
                      <th style={{ width: '60px' }}>D</th>
                      <th style={{ width: '60px' }}>CAS</th>
                      <th style={{ width: '120px' }}>{tournament.isCDF ? 'points CDF individuel/équipe' : 'Points'}</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    <SortableContext 
                      items={results.map((r: any) => r.tempId || `res-${results.indexOf(r)}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {results.map((res: any, idx: number) => (
                        <SortableRow 
                          key={res.tempId} 
                          res={res} 
                          idx={idx} 
                          updateResultField={updateResultField}
                          removeResult={removeResult}
                          OFFICIAL_ROSTERS={OFFICIAL_ROSTERS}
                          isCDF={tournament.isCDF}
                        />
                      ))}
                    </SortableContext>
                  </tbody>
                </table>
              </DndContext>
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
                      <NumberInput className="mini-input" value={match.tableNumber} onChange={(val: number) => updateMatchField(rIdx, mIdx, 'tableNumber', val)} style={{ width: '40px' }} />
                      
                      <div className="coach-selector-small">
                        <input list={`all-coaches-${rIdx}-${mIdx}`} value={match.coach1Name} onChange={(e) => updateMatchField(rIdx, mIdx, 'coach1Name', e.target.value)} />
                        <datalist id={`all-coaches-${rIdx}-${mIdx}`}>
                          {results.map((c: any) => <option key={c.coachName} value={c.coachName} />)}
                        </datalist>
                      </div>

                      <NumberInput className="mini-input" value={match.coach1TD} onChange={(val: number) => updateMatchField(rIdx, mIdx, 'coach1TD', val)} />
                      <NumberInput className="mini-input" value={match.coach1Casualties} onChange={(val: number) => updateMatchField(rIdx, mIdx, 'coach1Casualties', val)} />
                      
                      <span className="vs-sep">vs</span>

                      <NumberInput className="mini-input" value={match.coach2TD} onChange={(val: number) => updateMatchField(rIdx, mIdx, 'coach2TD', val)} />
                      <NumberInput className="mini-input" value={match.coach2Casualties} onChange={(val: number) => updateMatchField(rIdx, mIdx, 'coach2Casualties', val)} />

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
