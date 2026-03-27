"use client";

/**
 * BB Pusher - Plateau tactique Blood Bowl
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { 
  Eraser, 
  Share2, 
  Trash2, 
  ArrowLeft,
  RotateCw,
  Anchor,
  HelpCircle,
  Users,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  Search,
  Wand2,
  Undo2,
  MousePointer2,
  Pencil
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import Tooltip from "@/common/components/Tooltip/Tooltip";
import Modal from "@/common/components/Modal/Modal";
import Pitch from "./component/Pitch";
import Token from "./component/Token";
import Dugout from "./component/Dugout";
import FigurineBox from "./component/FigurineBox";

import "./page.css";

// Types
export type TokenType = 'blue' | 'red' | 'ball';
export type ToolType = 'select' | 'draw' | 'player' | 'ball' | 'status' | 'eraser';
export type TokenStatus = 'up' | 'prone' | 'stunned' | 'bonehead' | 'stupid' | 'fourchette';
export type TokenLocation = 'box' | 'pitch' | 'reserve' | 'ko' | 'injured' | 'expelled';

export interface PlayerRosterInfo {
  name: string;
  qty: string;
  ma: string;
  st: string;
  ag: string;
  pa: string;
  av: string;
  skills: string[];
  primary: string;
  secondary: string;
  cost: number;
}

export interface RosterData {
  name: string;
  roster: PlayerRosterInfo[];
  specialRules?: string[];
}

export interface TokenData {
  id: string;
  type: TokenType;
  x: number;
  y: number;
  status: TokenStatus;
  location: TokenLocation;
  attachedToId?: string; // Pour le ballon
  number?: number;
  playerInfo?: PlayerRosterInfo; // Added for roster integration
}

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
}

interface HistoryState {
  tokens: TokenData[];
  drawings: DrawingPath[];
}

export default function BBPusherPage() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0); 
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawings, setDrawings] = useState<DrawingPath[]>([]);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [blueRoster, setBlueRoster] = useState<RosterData | null>(null);
  const [redRoster, setRedRoster] = useState<RosterData | null>(null);
  const [rosters, setRosters] = useState<{name: string, file: string}[]>([]);
  const [isBlueLoading, setIsBlueLoading] = useState(false);
  const [isRedLoading, setIsRedLoading] = useState(false);
  const [baseScale, setBaseScale] = useState(0.8);
  const [zoom, setZoom] = useState(1); 
  const [showTooltips, setShowTooltips] = useState(true);
  const resizerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // -- Scaling Logic --
  const handleResize = useCallback(() => {
    if (!resizerRef.current) return;
    const viewport = resizerRef.current.closest('.pitch-viewport');
    if (!viewport) return;
    const padding = 20;
    const availableWidth = viewport.clientWidth - padding;
    const availableHeight = viewport.clientHeight - padding;
    const pitchW = rotation === 90 ? 758 : 1308;
    const pitchH = rotation === 90 ? 1308 : 758;
    setBaseScale(Math.min(availableWidth / pitchW, availableHeight / pitchH, 1.1));
  }, [rotation]);

  useEffect(() => {
    // List of available rosters from standard names
    const rosterList = [
      "all_star_players", "amazons", "black_orcs", "bretonnians", "chaos_chosen", 
      "chaos_dwarfs", "chaos_renegades", "dark_elves", "dwarves", "elven_union", 
      "gnomes", "goblins", "halflings", "high_elves", "humans", "imperial_nobility", 
      "khorne", "lizardmen", "necromantic_horror", "norse", "nurgle", "ogres", 
      "old_world_alliance", "orcs", "shambling_undead", "skaven", "slann_(naf)", 
      "snotlings", "tomb_kings", "underworld_denizens", "vampires", "wood_elves"
    ];
    setRosters(rosterList.map(r => ({ name: r.replace(/_/g, ' ').toUpperCase(), file: r })));
  }, []);

  const spawnRosterTokens = (team: 'blue' | 'red', roster: RosterData) => {
    const newTokens: TokenData[] = [];
    
    // Inject Star Players (2 total)
    const starPlayerInfo: PlayerRosterInfo = {
      name: "Star Player",
      qty: "0-2",
      ma: "?", st: "?", ag: "?", pa: "?", av: "?",
      skills: ["Compétences variables"],
      primary: "", secondary: "",
      cost: 0 
    };

    // 1. Regular Roster Players
    roster.roster.forEach(player => {
      let qty = 16;
      if (player.qty.includes('-')) qty = parseInt(player.qty.split('-')[1]);
      else if (!isNaN(parseInt(player.qty))) qty = parseInt(player.qty);

      for (let i = 0; i < qty; i++) {
        newTokens.push({
          id: `${team}-${player.name.replace(/\s+/g, '-')}-${i}`,
          type: team,
          x: -1, y: -1, status: 'up', location: 'box',
          number: i + 1,
          playerInfo: player
        });
      }
    });

    for (let i = 1; i <= 2; i++) {
      newTokens.push({
        id: `${team}-star-${i}`,
        type: team,
        x: -1, y: -1, status: 'up', location: 'box',
        number: 99 + i, // Dummy number
        playerInfo: starPlayerInfo
      });
    }

    setTokens(prev => {
      // CLEAR ALL existing tokens of the same team (pitch, dugout, or wherever)
      const otherTeamTokens = prev.filter(t => t.type !== team);
      return [...otherTeamTokens, ...newTokens];
    });
  };

  const handleRosterSelect = async (team: 'blue' | 'red', fileName: string) => {
    if (team === 'blue') setIsBlueLoading(true); else setIsRedLoading(true);
    try {
      const resp = await fetch(`/data/roster/${fileName}.json`);
      const data = await resp.json() as RosterData;
      
      const starPlayerInfo: PlayerRosterInfo = {
        name: "Star Player",
        qty: "0-2",
        ma: "?", st: "?", ag: "?", pa: "?", av: "?",
        skills: ["Compétences variables"],
        primary: "", secondary: "",
        cost: 0 
      };

      const enrichedData = { ...data, roster: [...data.roster, starPlayerInfo] };

      if (team === 'blue') setBlueRoster(enrichedData); else setRedRoster(enrichedData);
      spawnRosterTokens(team, data); // We can still pass data, spawnRosterTokens already injects stars
      toast.success(`Roster ${data.name} chargé pour l'équipe ${team === 'blue' ? 'bleue' : 'rouge'}`);
    } catch (e) {
      toast.error("Échec du chargement du roster");
    } finally {
      if (team === 'blue') setIsBlueLoading(false); else setIsRedLoading(false);
    }
  };

  useEffect(() => {
    handleResize();
    const timer = setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); clearTimeout(timer); };
  }, [handleResize, isFullscreen, rotation]);

  const finalScale = baseScale * zoom;

  // ResizeObserver for more precise scaling
  useEffect(() => {
    const viewport = resizerRef.current?.closest('.pitch-viewport');
    if (!viewport) return;

    const observer = new ResizeObserver(() => {
      handleResize();
    });

    observer.observe(viewport);
    return () => observer.disconnect();
  }, [handleResize]);

  // -- History management --
  const saveToHistory = useCallback((currentTokens: TokenData[], currentDrawings: DrawingPath[]) => {
    setHistory(prev => [{ tokens: [...currentTokens.map(t => ({...t}))], drawings: [...currentDrawings.map(d => ({...d}))] }, ...prev.slice(0, 19)]);
  }, []);

  const handleUndo = () => {
    if (history.length === 0) return;
    const [last, ...rest] = history;
    setTokens(last.tokens);
    setDrawings(last.drawings);
    setHistory(rest);
    toast.success("Action annulée");
  };

  const handleDragStart = (event: DragStartEvent) => {
    saveToHistory(tokens, drawings);
    setActiveId(event.active.id as string);
    const activeToken = tokens.find(t => t.id === event.active.id);
    if (activeToken && activeToken.location !== 'pitch') setActiveTool('select');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeToken = tokens.find(t => t.id === active.id);
    if (!activeToken) return;

    const overId = over.id as string;

    // --- CONSTRAINTS CHECK ---
    const team = activeToken.type;
    const teamTokens = tokens.filter(t => t.type === team);
    const playersInAction = teamTokens.filter(t => t.location !== 'box');
    const onPitchCount = teamTokens.filter(t => t.location === 'pitch').length;

    // A. Handle movement to DUGZOUT
    if (overId.startsWith('dugout-')) {
      if (activeToken.type === 'ball') { toast.error("Le ballon reste sur le terrain"); return; }
      
      const [_, targetTeam, zone] = overId.split('-');
      if (targetTeam !== activeToken.type) { toast.error("C'est la fosse adverse !"); return; }
      
      // Limit 16 check (if coming from box)
      if (activeToken.location === 'box' && playersInAction.length >= 16) {
        toast.error("Capacité maximale de l'équipe (16) atteinte !");
        return;
      }

      setTokens(prev => prev.map(t => {
        if (t.id === activeToken.id) return { ...t, location: zone as TokenLocation, x: -1, y: -1, attachedToId: undefined };
        if (t.type === 'ball' && t.attachedToId === activeToken.id) return { ...t, attachedToId: undefined };
        return t;
      }));
      return;
    }

    // B. Handle movement to FIGURINE BOX
    if (overId.startsWith('box-')) {
      const [_, targetTeam] = overId.split('-');
      if (targetTeam !== activeToken.type) { toast.error("C'est la boîte adverse !"); return; }
      
      setTokens(prev => prev.map(t => {
        if (t.id === activeToken.id) return { ...t, location: 'box', x: -1, y: -1, attachedToId: undefined };
        if (t.type === 'ball' && t.attachedToId === activeToken.id) return { ...t, attachedToId: undefined };
        return t;
      }));
      return;
    }

    // C. Handle movement to PITCH (Square coordinates 0-0 style)
    if (/^\d+-\d+$/.test(overId)) {
      const [overX, overY] = overId.split('-').map(Number);
      
      // Constraint checks for pitch
      if (activeToken.type !== 'ball' ) {
        // Limit 16 check (if coming from box)
        if (activeToken.location === 'box' && playersInAction.length >= 16) {
          toast.error("Capacité maximale de l'équipe (16) atteinte !");
          return;
        }
        // Limit 14 on pitch
        if (activeToken.location !== 'pitch' && onPitchCount >= 14) {
          toast.error("Déjà 14 joueurs sur le terrain !");
          return;
        }
        // Overlap check
        const playerAtTarget = tokens.find(t => t.x === overX && t.y === overY && t.type !== 'ball' && t.id !== activeToken.id);
        if (playerAtTarget) { toast.error("Case déjà occupée"); return; }
      }

      let caughtBall = false;
      const newTokens = tokens.map(t => {
        if (t.id === activeToken.id) {
          if (t.type === 'ball') {
            const player = tokens.find(p => p.x === overX && p.y === overY && p.type !== 'ball');
            return { ...t, x: overX, y: overY, location: 'pitch' as TokenLocation, attachedToId: player?.id };
          }
          return { ...t, x: overX, y: overY, location: 'pitch' as TokenLocation };
        }
        // Move carried ball along
        if (t.type === 'ball' && activeToken.type !== 'ball') {
           if (t.attachedToId === activeToken.id) return { ...t, x: overX, y: overY };
           // Pickup ball if moving onto it
           if (t.x === overX && t.y === overY) { 
             caughtBall = true; 
             return { ...t, x: overX, y: overY, attachedToId: activeToken.id }; 
           }
        }
        return t;
      }) as TokenData[];
      
      setTokens(newTokens);
      if (caughtBall) toast.success("Balle récupérée !");
    }
  };

  const handleSquareClick = (x: number, y: number) => {
    if (activeTool === 'select' || activeTool === 'draw') return;
    saveToHistory(tokens, drawings);
    if (activeTool === 'eraser') { setTokens(prev => prev.filter(t => t.x !== x || t.y !== y)); setDrawings([]); return; }
    if (activeTool === 'status') {
      const p = tokens.find(t => t.x === x && t.y === y && t.type !== 'ball');
      if (p) setTokens(prev => prev.map(t => (t.id === p.id) ? { ...t, status: ['up', 'prone', 'stunned', 'bonehead', 'stupid', 'fourchette'][(['up', 'prone', 'stunned', 'bonehead', 'stupid', 'fourchette'].indexOf(t.status) + 1) % 6] as TokenStatus } : t));
      return;
    }
    if (activeTool === 'ball') {
      const p = tokens.find(t => t.x === x && t.y === y && t.type !== 'ball');
      setTokens(prev => [...prev.filter(t => t.type !== 'ball'), { id: `ball-${Date.now()}`, type: 'ball', x, y, status: 'up', location: 'pitch', attachedToId: p?.id } as TokenData]);
      setActiveTool('select');
    }
  };

  const handleFullscreen = () => {
    if (!isFullscreen) { document.documentElement.requestFullscreen().catch(() => {}); setIsFullscreen(true); } 
    else { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); setIsFullscreen(false); }
  };

  const handleShare = () => { navigator.clipboard.writeText(window.location.href); toast.success("Lien copié !"); };

  const ballItem = tokens.find(t => t.type === 'ball');
  const carrier = ballItem?.attachedToId ? tokens.find(t => t.id === ballItem.attachedToId) : null;

  return (
    <main className={`bbpusher-page ${isFullscreen ? 'fullscreen' : ''}`}>
      <header className="tool-header">
        <div className="header-left">
          <Link href="/ressources" className="back-button" title="Retour"><ArrowLeft size={20} /></Link>
          <div className="title-group">
            <h1 className="title-modern">BB<span>Pusher</span></h1>
          </div>
        </div>
        <div className="tool-handler">
          <div className="zoom-bar">
            <Search size={14} />
            <input type="range" min="1" max="2" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
          </div>
          <div className="divider" />
          <div className="tool-group">
            <Tooltip text="Sélect. intelligente" position="bottom"><button className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`} onClick={() => setActiveTool('select')}><MousePointer2 size={18} /></button></Tooltip>
            <Tooltip text="Annotation" position="bottom"><button className={`tool-btn ${activeTool === 'draw' ? 'active' : ''}`} onClick={() => setActiveTool('draw')}><Pencil size={18} color="#ef4444" /></button></Tooltip>
            <Tooltip text="Joueurs" position="bottom"><button className={`tool-btn ${activeTool === 'player' ? 'active' : ''}`} onClick={() => setActiveTool('player')}><Users size={18} /></button></Tooltip>
            <Tooltip text="Ballon" position="bottom"><button className={`tool-btn ${activeTool === 'ball' ? 'active' : ''}`} onClick={() => setActiveTool('ball')}><BallIcon size={18} /></button></Tooltip>
            <Tooltip text="État du joueur" position="bottom"><button className={`tool-btn ${activeTool === 'status' ? 'active' : ''}`} onClick={() => setActiveTool('status')}><Wand2 size={18} className="status-tool-icon" /></button></Tooltip>
            <Tooltip text="Gomme / Effacer annotations" position="bottom"><button className={`tool-btn ${activeTool === 'eraser' ? 'active' : ''}`} onClick={() => setActiveTool('eraser')}><Eraser size={18} /></button></Tooltip>
          </div>
          <div className="divider" />
          <div className="action-group">
            <Tooltip text="Annuler" position="bottom"><button className="tool-btn undo-btn" onClick={handleUndo} disabled={history.length === 0}><Undo2 size={18} /></button></Tooltip>
            <Tooltip text="Rotation" position="bottom"><button className={`tool-btn ${rotation === 90 ? 'active' : ''}`} onClick={() => setRotation(r => r === 0 ? 90 : 0)}><RotateCw size={18} /></button></Tooltip>
            <Tooltip text={showTooltips ? "Masquer stats" : "Afficher stats"} position="bottom">
              <button 
                className={`tool-btn ${showTooltips ? 'active' : ''}`} 
                onClick={() => setShowTooltips(!showTooltips)}
              >
                {showTooltips ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </Tooltip>
            <Tooltip text="Tout vider" position="bottom"><button className="tool-btn" onClick={() => { if (confirm("Tout vider ?")) { saveToHistory(tokens, drawings); setTokens([]); setDrawings([]); } }}><Trash2 size={18} /></button></Tooltip>
            <Tooltip text="Plein écran" position="bottom"><button className={`tool-btn ${isFullscreen ? 'active' : ''}`} onClick={handleFullscreen}>{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}</button></Tooltip>
            <Tooltip text="Partager" position="bottom"><button className="tool-btn share-btn" onClick={handleShare}><Share2 size={18} /></button></Tooltip>
            <div className="divider" />
            <Tooltip text="Aide & Guide" position="bottom"><button className={`tool-btn help-btn ${isHelpOpen ? 'active' : ''}`} onClick={() => setIsHelpOpen(true)}><HelpCircle size={18} /></button></Tooltip>
          </div>
        </div>
        <div className="header-right">
           <div className="credits-link">
             Inspiré de <a href="https://www.teamfrancebb.fr/bbpusher/" target="_blank" rel="noopener noreferrer">Elyoukey et Thot</a>
           </div>
        </div>
      </header>

      <Modal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Guide Tactique BB Pusher">
        <div className="help-content">
          <section className="help-section">
            <h3><MousePointer2 size={16} /> Sélection intelligente</h3>
            <p>Outils par défaut. Permet de déplacer n'importe quel élément. Si un joueur passe sur le ballon, il le ramasse automatiquement.</p>
          </section>
          <section className="help-section">
            <h3><Pencil size={16} /> Annotation</h3>
            <p>Dessinez des flèches ou des zones tactiques directement sur le terrain. Cliquez sur la gomme pour tout effacer.</p>
          </section>
          <section className="help-section">
            <h3><Wand2 size={16} /> États du joueur</h3>
            <p>Cliquez sur un joueur pour changer son état : <strong>Couché</strong>, <strong>Sonné</strong>, <strong>Cerveau Lent</strong> (Os), <strong>Débile</strong> (Crocs) ou <strong>Féroce</strong> (Fourchette).</p>
          </section>
          <section className="help-section">
            <h3><Anchor size={16} /> Gestion du Ballon</h3>
            <p>Le ballon peut être déplacé librement ou attaché à un joueur. Utilisez le bouton "Ancre" qui apparaît à côté du porteur pour faire tomber la balle.</p>
          </section>
          <section className="help-section">
            <h3><Undo2 size={16} /> Annuler & Fosses</h3>
            <p>Utilisez "Annuler" pour revenir en arrière. Glissez les joueurs vers les zones latérales (KO, Blessés) pour les sortir du terrain.</p>
          </section>
        </div>
        <style jsx>{`
          .help-content { display: flex; flex-direction: column; gap: 1.2rem; max-height: 60vh; overflow-y: auto; padding-right: 10px; }
          .help-section { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
          .help-section h3 { display: flex; align-items: center; gap: 0.5rem; color: var(--accent); margin-bottom: 0.5rem; font-size: 1rem; }
          .help-section p { font-size: 0.85rem; line-height: 1.4; opacity: 0.8; margin: 0; }
        `}</style>
      </Modal>

      <div className="tool-layout">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="work-area">
            <div className="global-team-area blue">
              <FigurineBox 
                team="blue" 
                roster={blueRoster?.roster || []} 
                tokens={tokens.filter(t => t.type === 'blue' && t.location === 'box')}
                rosterList={rosters}
                onRosterSelect={(file) => handleRosterSelect('blue', file)}
                isLoading={isBlueLoading}
                showTooltips={showTooltips}
              />
              <div className="dugout-container">
                <Dugout team="blue" tokens={tokens.filter(t => t.type === 'blue' && (t.location === 'reserve' || t.location === 'ko' || t.location === 'injured' || t.location === 'expelled'))} activeId={activeId} showTooltips={showTooltips} />
              </div>
            </div>

            <div className="pitch-viewport">
              <div ref={resizerRef} className="pitch-resizer" style={{ width: `${(rotation === 90 ? 758 : 1308) * finalScale}px`, height: `${(rotation === 90 ? 1308 : 758) * finalScale}px` }}>
                <div className="pitch-rotator" style={{ transform: `scale(${finalScale}) rotate(${rotation}deg)`, transformOrigin: 'center center', transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                  <Pitch tokens={tokens.filter(t => t.location === 'pitch')} onSquareClick={handleSquareClick} activeId={activeId} activeTool={activeTool} drawings={drawings} onDrawUpdate={(d) => { saveToHistory(tokens, drawings); setDrawings(d); }} rotation={rotation} finalScale={finalScale} showTooltips={showTooltips} />
                  {carrier && <button className="drop-ball-btn" style={{ left: `${carrier.x * 50 + 60}px`, top: `${carrier.y * 50}px` }} onClick={() => { saveToHistory(tokens, drawings); setTokens(prev => prev.map(t => t.id === ballItem!.id ? { ...t, attachedToId: undefined, y: Math.min(14, carrier!.y + 1) } : t)); }} title="Lâcher"><Anchor size={14} /></button>}
                </div>
              </div>
            </div>

            <div className="global-team-area red">
              <div className="dugout-container">
                <Dugout team="red" tokens={tokens.filter(t => t.type === 'red' && (t.location === 'reserve' || t.location === 'ko' || t.location === 'injured' || t.location === 'expelled'))} activeId={activeId} showTooltips={showTooltips} />
              </div>
              <FigurineBox 
                team="red" 
                roster={redRoster?.roster || []} 
                tokens={tokens.filter(t => t.type === 'red' && t.location === 'box')}
                rosterList={rosters}
                onRosterSelect={(file) => handleRosterSelect('red', file)}
                isLoading={isRedLoading}
                showTooltips={showTooltips}
              />
            </div>
          </div>
          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
            {activeId ? <Token token={tokens.find(t => t.id === activeId)!} isOverlay activeTool={activeTool} rotation={rotation} hasBall={!!tokens.find(t => t.type === 'ball' && t.attachedToId === activeId)} showTooltip={false} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </main>
  );
}

function BallIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C15.3137 2 18 6.47715 18 12C18 17.5228 15.3137 22 12 22C8.68629 22 6 17.5228 6 12C6 6.47715 8.68629 2 12 2Z" fill="currentColor" fillOpacity="0.2"/><path d="M12 2C15.3137 2 18 6.47715 18 12C18 17.5228 15.3137 22 12 22C8.68629 22 6 17.5228 6 12C6 6.47715 8.68629 2 12 2Z" stroke="currentColor" strokeWidth="2"/><path d="M6 12H18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/><path d="M9 7H15M9 17H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
