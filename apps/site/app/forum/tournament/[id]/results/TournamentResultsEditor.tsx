"use client";

/**
 * Saisie des résultats d'un tournoi (refonte, carte 089, ADR 0006), réservée à l'organisateur, à ses commissaires et
 * aux modérateurs.
 * - En haut : l'import d'un rapport NAF (fichier XML) et « Vider les résultats », qui demande une confirmation.
 * - Onglet « Classement » : une ligne par coach, que l'on peut réordonner en la faisant glisser par sa poignée (ou au
 *   clavier). Sur ordinateur, une colonne par information ; sur téléphone, une carte par coach avec des champs
 *   libellés, assez grands pour le doigt.
 * - Onglet « Rondes et matchs » : les rondes, et dans chaque ronde les matchs (table, coachs, touchdowns, sorties).
 * - « Publier les résultats » est dans la barre collée en bas de l'écran sur téléphone, et sous les onglets sur
 *   ordinateur.
 * Les calculs (points CDF, tri, rapprochement avec les membres du site) et les actions serveur sont ceux d'avant la
 * refonte.
 */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Swords,
  Trash2,
  Plus,
  Upload,
  Save,
  GripVertical,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button, Card, ConfirmDialog, Input, Tabs, TabsContent, TabsList, TabsTrigger, cn, toast } from "@bbfrance/ui";
import { saveTournamentResults, parseNafReport, clearTournamentResults } from '@/app/tournois/actions';
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
import { calculateCdfPoints, cdfRoundsCount, isValidRank, CdfTournamentType } from '@/common/utils/cdf';
import { ComposeActionBar } from '@/app/forum/component/ComposeScreen';

interface TournamentResultsEditorProps {
  tournament: any;
  allUsers: any[];
}

const NumberInput = ({ id, value, onChange, className, step = 1, readOnly, disabled, tabIndex }: any) => (
  <Input
    id={id}
    type="number"
    inputMode={step === 1 ? "numeric" : "decimal"}
    className={cn("px-2 text-center tabular-nums", className)}
    value={value === null || value === undefined ? '' : value}
    min="0"
    step={step}
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

/** Libellé d'un champ : visible sur téléphone (carte du coach), lu seulement par les lecteurs d'écran sur ordinateur. */
const cellLabel = "text-xs font-semibold text-bb-text-muted lg:sr-only";

/**
 * Grille d'une ligne du classement. Ordinateur : 12 colonnes dans l'ordre de la page (poignée, rang, NAF, coach,
 * membre, roster, V, N, D, CAS, points, suppression), comme l'en-tête. Téléphone : carte de 4 colonnes où chaque
 * champ est placé à la main (poignée, rang, coach et suppression en haut ; NAF et membre ; roster ; V, N, D, CAS ;
 * points).
 */
const rankingColumns = "grid grid-cols-[2.75rem_4.5rem_minmax(0,1fr)_2.75rem] gap-x-2 gap-y-3 lg:grid-cols-[2.75rem_4rem_6.5rem_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1fr)_3.5rem_3.5rem_3.5rem_3.5rem_6rem_2.75rem] lg:items-center lg:gap-2";

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
  };
  const id = (field: string) => `res-${idx}-${field}`;
  const coachLabel = res.coachName || `le coach ${idx + 1}`;
  const cell = "flex min-w-0 flex-col gap-1";

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        rankingColumns,
        "rounded-bb-md border border-bb-border bg-bb-surface p-3 lg:rounded-none lg:border-0 lg:border-b lg:px-2 lg:py-2",
        isDragging && "relative z-10 opacity-60 shadow-bb"
      )}
    >
      <Button
        type="button"
        variant="quiet"
        size="tap-icon"
        className="cursor-grab touch-none self-end active:cursor-grabbing max-lg:col-start-1 max-lg:row-start-1"
        aria-label={`Déplacer ${coachLabel} dans le classement`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} aria-hidden="true" />
      </Button>
      <div className={cn(cell, "max-lg:col-start-2 max-lg:row-start-1")}>
        <label htmlFor={id('rank')} className={cellLabel}>Rang</label>
        <NumberInput id={id('rank')} value={res.rank} onChange={(val: number) => updateResultField(idx, 'rank', val)} />
      </div>
      <div className={cn(cell, "max-lg:col-span-2 max-lg:col-start-1 max-lg:row-start-2")}>
        <label htmlFor={id('naf')} className={cellLabel}>Numéro NAF</label>
        <Input
          id={id('naf')}
          type="text"
          inputMode="numeric"
          value={res.nafNumber || ''}
          onChange={(e) => updateResultField(idx, 'nafNumber', e.target.value)}
          placeholder="NAF..."
        />
      </div>
      <div className={cn(cell, "max-lg:col-start-3 max-lg:row-start-1")}>
        <label htmlFor={id('coach')} className={cellLabel}>Nom du coach</label>
        <Input id={id('coach')} type="text" value={res.coachName} onChange={(e) => updateResultField(idx, 'coachName', e.target.value)} placeholder="Nom coach..." />
      </div>
      <div className={cn(cell, "max-lg:col-span-2 max-lg:col-start-3 max-lg:row-start-2")}>
        <span className={cellLabel}>Membre du site</span>
        <div className="min-w-0">
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
        </div>
      </div>
      <div className={cn(cell, "max-lg:col-span-4 max-lg:row-start-3")}>
        <label htmlFor={id('roster')} className={cellLabel}>Roster</label>
        <Input
          id={id('roster')}
          list={`rosters-${idx}`}
          value={res.roster || ''}
          onChange={(e) => updateResultField(idx, 'roster', e.target.value)}
          placeholder="Race..."
        />
        <datalist id={`rosters-${idx}`}>
          {OFFICIAL_ROSTERS.map((r: string) => <option key={r} value={r} />)}
        </datalist>
      </div>
      {/* Téléphone : les quatre compteurs sur une ligne ; ordinateur : chacun dans sa colonne (display: contents) */}
      <div className="grid grid-cols-4 gap-2 max-lg:col-span-4 max-lg:row-start-4 lg:contents">
        {[
          { field: 'wins', label: 'Victoires' },
          { field: 'draws', label: 'Nuls' },
          { field: 'losses', label: 'Défaites' },
          { field: 'casualties', label: 'Sorties' },
        ].map(({ field, label }) => (
          <div key={field} className={cell}>
            <label htmlFor={id(field)} className={cellLabel}>{label}</label>
            <NumberInput id={id(field)} value={res[field]} onChange={(val: number) => updateResultField(idx, field, val)} />
          </div>
        ))}
      </div>
      <div className={cn(cell, "max-lg:col-span-4 max-lg:row-start-5")}>
        <label htmlFor={id('points')} className={cellLabel}>{isCDF ? 'Points CDF (calculés)' : 'Points'}</label>
        <NumberInput
          id={id('points')}
          value={res.points}
          onChange={(val: number) => updateResultField(idx, 'points', val)}
          step="0.0001"
          className={isCDF ? 'opacity-60' : ''}
          readOnly={isCDF}
          tabIndex={isCDF ? -1 : 0}
        />
      </div>
      <Button
        type="button"
        variant="danger"
        size="tap-icon"
        className="self-end max-lg:col-start-4 max-lg:row-start-1"
        onClick={() => removeResult(idx)}
        aria-label={`Supprimer ${coachLabel}`}
        title="Supprimer"
      >
        <Trash2 size={16} aria-hidden="true" />
      </Button>
    </li>
  );
};

export default function TournamentResultsEditor({ tournament, allUsers }: TournamentResultsEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ranking' | 'matches'>('ranking');
  const [isSaving, setIsSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isClearOpen, setIsClearOpen] = useState(false);

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
      const numRounds = cdfRoundsCount(tournament.totalMatches, rounds.length, tournament.days);
      const typeCDF = (tournament.typeCDF || "INDIVIDUEL") as CdfTournamentType;

      const updatedResults = results.map((res: any) => {
        // Rang vide : 0 point affiché, et l'enregistrement sera refusé par le serveur (carte 162)
        const newPoints = isValidRank(res.rank) ? calculateCdfPoints(
          typeCDF,
          numRounds,
          numParticipants,
          Number(res.rank)
        ) : 0;
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
    rounds.length,
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
      const pA = parseFloat(a.points) || 0;
      const pB = parseFloat(b.points) || 0;
      if (pB !== pA) return pB - pA;
      if ((parseInt(b.wins) || 0) !== (parseInt(a.wins) || 0)) return (parseInt(b.wins) || 0) - (parseInt(a.wins) || 0);
      if ((parseInt(a.losses) || 0) !== (parseInt(b.losses) || 0)) return (parseInt(a.losses) || 0) - (parseInt(b.losses) || 0);
      return (parseInt(b.casualties) || 0) - (parseInt(a.casualties) || 0);
    }).map((r, i) => ({ ...r, rank: i + 1 }));
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
          const numRounds = cdfRoundsCount(tournament.totalMatches, data.rounds.length, tournament.days);
          const typeCDF = (tournament.typeCDF || "INDIVIDUEL") as CdfTournamentType;

          newResults = newResults.map((res: any) => ({
            ...res,
            points: isValidRank(res.rank) ? calculateCdfPoints(typeCDF, numRounds, numParticipants, Number(res.rank)) : 0
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


  // Effacement des résultats : la fenêtre de confirmation (ConfirmDialog) remplace la fenêtre confirm() du navigateur
  const handleClearResults = () => setIsClearOpen(true);

  const performClearResults = async () => {
    setIsSaving(true);
    const response = await clearTournamentResults(tournament.id);
    if (response.success) {
      setResults([]);
      setRounds([]);
      toast.success("Résultats et matchs vidés !");
      setIsClearOpen(false);
      router.refresh();
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
       const numRounds = cdfRoundsCount(tournament.totalMatches, rounds.length, tournament.days);
       const typeCDF = (tournament.typeCDF || "INDIVIDUEL") as CdfTournamentType;

       updatedResults[index].points = isValidRank(value) ? calculateCdfPoints(
         typeCDF,
         numRounds,
         numParticipants,
         Number(value)
       ) : 0;
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

  const topicHref = `/forum/topic/${tournament.topic?.id}`;
  const publishLabel = isSaving ? "Publication..." : "Publier les résultats";
  const sectionTitle = "m-0 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic";

  return (
    <div className="flex flex-col gap-4">
      <ConfirmDialog
        open={isClearOpen}
        onOpenChange={setIsClearOpen}
        title="Vider les résultats"
        message="Êtes-vous sûr de vouloir vider tous les résultats et matchs de ce tournoi ? Cette action est définitive et irréversible."
        confirmLabel="Vider les résultats"
        danger
        pending={isSaving}
        onConfirm={performClearResults}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button type="button" variant="secondary" size="tap" onClick={() => fileInputRef.current?.click()} disabled={isParsing}>
          <Upload size={16} aria-hidden="true" /> {isParsing ? "Import..." : "Importer un rapport NAF"}
        </Button>
        <Button type="button" variant="danger" size="tap" onClick={handleClearResults} disabled={isSaving || isParsing || (results.length === 0 && rounds.length === 0)}>
          <Trash2 size={16} aria-hidden="true" /> Vider les résultats
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} hidden accept=".xml,text/xml" aria-label="Importer un rapport NAF (fichier XML)" />
      </div>

      <Card className="flex items-start gap-3 border-bb-warning-text p-3 text-sm">
        <AlertTriangle size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-bb-warning-text" />
        <p className="m-0 text-bb-text">
          <strong>Note importante sur l&apos;import NAF :</strong> le fichier XML ne contient pas les données de classement final.
          Il ne prend pas en compte les tie-breakers spécifiques à votre tournoi (ex : SOS, Opp-Opp, points de peinture…).
          Le classement doit être contrôlé et ajusté manuellement après l&apos;import.
        </p>
      </Card>

      {tournament.isCDF && (
        // Carte 162 : les résultats d'un tournoi de la Coupe de France passent par la modération avant de compter
        <Card className="flex items-start gap-3 p-3 text-sm">
          <ShieldCheck size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-bb-accent-text" />
          <p className="m-0 text-bb-text">
            <strong>Tournoi de la Coupe de France :</strong> chaque coach doit avoir un rang. Une fois publiés, les résultats
            comptent au classement national seulement après leur validation par un modérateur ou un administrateur.
            Modifier des résultats déjà validés retire la validation.
          </p>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ranking' | 'matches')} className="flex flex-col gap-4">
        <TabsList aria-label="Saisie des résultats">
          <TabsTrigger value="ranking"><Trophy size={16} aria-hidden="true" /> Classement</TabsTrigger>
          <TabsTrigger value="matches"><Swords size={16} aria-hidden="true" /> Rondes et matchs</TabsTrigger>
        </TabsList>

        <TabsContent value="ranking" className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <h2 className={cn(sectionTitle, "flex-1")}>Classement du tournoi ({results.length} coachs)</h2>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="tap" className="flex-1 sm:flex-none" onClick={() => setResults(autoSortResults(results))}>
                <Trophy size={16} aria-hidden="true" /> Trier par rang
              </Button>
              <Button type="button" variant="primary" size="tap" className="flex-1 sm:flex-none" onClick={handleAddCoach}>
                <Plus size={16} aria-hidden="true" /> Ajouter un coach
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden max-lg:border-0 max-lg:bg-transparent">
            {/* En-tête des colonnes (ordinateur) */}
            <div aria-hidden="true" className={cn(rankingColumns, "hidden border-b border-bb-border bg-bb-surface-2 px-2 py-2 text-xs font-bold tracking-wide text-bb-text-muted uppercase lg:grid")}>
              <span />
              <span>Rang</span>
              <span>NAF</span>
              <span>Coach</span>
              <span>Membre du site</span>
              <span>Roster</span>
              <span className="text-center">V</span>
              <span className="text-center">N</span>
              <span className="text-center">D</span>
              <span className="text-center">CAS</span>
              <span className="text-center">{tournament.isCDF ? 'Points CDF' : 'Points'}</span>
              <span />
            </div>
            {/* Identifiant fixe : les attributs d'accessibilité du glisser-déposer sont alors les mêmes côté serveur et
                navigateur (sans lui, React signalait une différence au chargement) */}
            <DndContext
              id="tournament-results-ranking"
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <ol className="m-0 flex list-none flex-col gap-3 p-0 lg:gap-0">
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
              </ol>
            </DndContext>
            {results.length === 0 && <p className="m-0 p-4 text-center text-sm text-bb-text-muted">Aucun coach pour l&apos;instant : ajoutez-en un ou importez un rapport NAF.</p>}
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <h2 className={cn(sectionTitle, "flex-1")}>Détail des matchs par ronde</h2>
            <Button type="button" variant="primary" size="tap" onClick={addRound}>
              <Plus size={16} aria-hidden="true" /> Ajouter une ronde
            </Button>
          </div>

          {rounds.map((round: any, rIdx: number) => (
            <Card key={rIdx} className="flex flex-col gap-3 p-3 lg:p-4">
              <div className="flex items-center gap-2">
                <h3 className={cn(sectionTitle, "flex-1")}>Ronde {round.roundNumber}</h3>
                <Button type="button" variant="secondary" size="tap" onClick={() => addMatch(rIdx)}>
                  <Plus size={16} aria-hidden="true" /> Nouveau match
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="tap-icon"
                  aria-label={`Supprimer la ronde ${round.roundNumber}`}
                  title="Supprimer la ronde"
                  onClick={() => {
                    const updated = [...rounds];
                    updated.splice(rIdx, 1);
                    setRounds(updated);
                  }}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </Button>
              </div>

              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {round.matches.map((match: any, mIdx: number) => {
                  const id = (field: string) => `match-${rIdx}-${mIdx}-${field}`;
                  const side = (n: 1 | 2) => (
                    <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_3.5rem_3.5rem] items-end gap-2">
                      <div className="flex min-w-0 flex-col gap-1">
                        <label htmlFor={id(`coach${n}`)} className="text-xs font-semibold text-bb-text-muted">Coach {n}</label>
                        <Input
                          id={id(`coach${n}`)}
                          list={`all-coaches-${n === 1 ? '' : '2-'}${rIdx}-${mIdx}`}
                          value={match[`coach${n}Name`]}
                          onChange={(e) => updateMatchField(rIdx, mIdx, `coach${n}Name`, e.target.value)}
                        />
                        <datalist id={`all-coaches-${n === 1 ? '' : '2-'}${rIdx}-${mIdx}`}>
                          {results.map((c: any) => <option key={c.coachName} value={c.coachName} />)}
                        </datalist>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor={id(`td${n}`)} className="text-xs font-semibold text-bb-text-muted">TD</label>
                        <NumberInput id={id(`td${n}`)} value={match[`coach${n}TD`]} onChange={(val: number) => updateMatchField(rIdx, mIdx, `coach${n}TD`, val)} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor={id(`cas${n}`)} className="text-xs font-semibold text-bb-text-muted">CAS</label>
                        <NumberInput id={id(`cas${n}`)} value={match[`coach${n}Casualties`]} onChange={(val: number) => updateMatchField(rIdx, mIdx, `coach${n}Casualties`, val)} />
                      </div>
                    </div>
                  );
                  return (
                    <li key={mIdx} className="flex flex-col gap-2 rounded-bb-md border border-bb-border bg-bb-surface-2 p-2 lg:flex-row lg:items-end">
                      <div className="flex items-end gap-2 lg:contents">
                        <div className="flex w-16 shrink-0 flex-col gap-1">
                          <label htmlFor={id('table')} className="text-xs font-semibold text-bb-text-muted">Table</label>
                          <NumberInput id={id('table')} value={match.tableNumber} onChange={(val: number) => updateMatchField(rIdx, mIdx, 'tableNumber', val)} />
                        </div>
                        <span className="flex-1 lg:hidden" />
                        <Button
                          type="button"
                          variant="danger"
                          size="tap-icon"
                          className="shrink-0 lg:order-last"
                          onClick={() => removeMatch(rIdx, mIdx)}
                          aria-label={`Supprimer le match de la table ${match.tableNumber || mIdx + 1}`}
                          title="Supprimer le match"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </Button>
                      </div>
                      {side(1)}
                      <span aria-hidden="true" className="self-center text-xs font-bold text-bb-text-muted uppercase lg:pb-3">contre</span>
                      {side(2)}
                    </li>
                  );
                })}
                {round.matches.length === 0 && <p className="m-0 text-sm text-bb-text-muted italic">Aucun match dans cette ronde.</p>}
              </ul>
            </Card>
          ))}
          {rounds.length === 0 && <p className="m-0 text-sm text-bb-text-muted italic">Ajoutez une ronde pour commencer la saisie des matchs.</p>}
        </TabsContent>
      </Tabs>

      {/* Ordinateur : boutons sous la saisie ; téléphone : barre collée en bas de l'écran */}
      <ComposeActionBar>
        <Button asChild variant="secondary" size="tap">
          <Link href={topicHref}>Annuler</Link>
        </Button>
        <Button type="button" variant="primary" size="tap" className="max-lg:flex-1" onClick={handleSave} disabled={isSaving}>
          <Save size={16} aria-hidden="true" /> {publishLabel}
        </Button>
      </ComposeActionBar>
    </div>
  );
}
