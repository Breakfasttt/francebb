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
  ChevronLeft,
  RotateCw,
  Anchor,
  HelpCircle,
  Users,
  Maximize,
  Minimize,
  Search,
  Wand2,
  Undo2,
  MousePointer2,
  Pencil
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import Pitch from "./component/Pitch";
import Token from "./component/Token";
import Dugout from "./component/Dugout";

import "./page.css";

// Types
export type TokenType = 'blue' | 'red' | 'ball';
export type ToolType = 'select' | 'draw' | 'player' | 'ball' | 'status' | 'eraser';
export type TokenStatus = 'up' | 'prone' | 'stunned' | 'bonehead' | 'stupid' | 'fourchette';
export type TokenLocation = 'pitch' | 'reserve' | 'ko' | 'injured' | 'expelled';

export interface TokenData {
  id: string;
  type: TokenType;
  x: number;
  y: number;
  status: TokenStatus;
  location: TokenLocation;
  attachedToId?: string; // Pour le ballon
  number?: number;
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
  const [baseScale, setBaseScale] = useState(0.8);
  const [zoom, setZoom] = useState(1); 
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
    handleResize();
    const timer = setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); clearTimeout(timer); };
  }, [handleResize, isFullscreen, rotation]);

  const finalScale = baseScale * zoom;

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

  // -- Handlers --
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

    if (overId.startsWith('dugout-')) {
      if (activeToken.type === 'ball') { toast.error("Le ballon reste sur le terrain"); return; }
      const [_, team, zone] = overId.split('-');
      if (team !== activeToken.type) { toast.error("C'est la fosse adverse !"); return; }
      setTokens(prev => prev.map(t => {
        if (t.id === activeToken.id) return { ...t, location: zone as TokenLocation, x: -1, y: -1, attachedToId: undefined };
        if (t.type === 'ball' && t.attachedToId === activeToken.id) return { ...t, attachedToId: undefined };
        return t;
      }));
      return;
    }

    if (/^\d+-\d+$/.test(overId)) {
      const [overX, overY] = overId.split('-').map(Number);
      const playerAtTarget = tokens.find(t => t.x === overX && t.y === overY && t.type !== 'ball' && t.id !== activeToken.id);
      if (activeToken.type !== 'ball' && playerAtTarget) { toast.error("Case déjà occupée"); return; }
      let caughtBall = false;
      const newTokens = tokens.map(t => {
        if (t.id === activeToken.id) {
          if (t.type === 'ball') {
            const player = tokens.find(p => p.x === overX && p.y === overY && p.type !== 'ball');
            return { ...t, x: overX, y: overY, location: 'pitch', attachedToId: player?.id };
          }
          return { ...t, x: overX, y: overY, location: 'pitch' };
        }
        if (t.type === 'ball' && activeToken.type !== 'ball') {
           if (t.attachedToId === activeToken.id) return { ...t, x: overX, y: overY };
           if (t.x === overX && t.y === overY) { caughtBall = true; return { ...t, x: overX, y: overY, attachedToId: activeToken.id }; }
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
          <Link href="/ressources" className="back-link"><ChevronLeft size={20} /></Link>
          <div className="title-group"><h1>BB Pusher</h1><button className={`help-toggle ${isHelpOpen ? 'active' : ''}`} onClick={() => setIsHelpOpen(!isHelpOpen)}><HelpCircle size={18} /></button></div>
        </div>
        <div className="tool-handler">
          {/* Zoom Bar moved to the left of the group */}
          <div className="zoom-bar">
            <Search size={14} />
            <input type="range" min="1" max="2" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
          </div>
          <div className="divider" />
          <div className="tool-group">
            <button className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`} onClick={() => setActiveTool('select')} title="Sélect. intelligente"><MousePointer2 size={18} /></button>
            <button className={`tool-btn ${activeTool === 'draw' ? 'active' : ''}`} onClick={() => setActiveTool('draw')} title="Annotation"><Pencil size={18} color="#ef4444" /></button>
            <button className={`tool-btn ${activeTool === 'player' ? 'active' : ''}`} onClick={() => setActiveTool('player')} title="Joueurs"><Users size={18} /></button>
            <button className={`tool-btn ${activeTool === 'ball' ? 'active' : ''}`} onClick={() => setActiveTool('ball')} title="Ballon"><BallIcon size={18} /></button>
            <button className={`tool-btn ${activeTool === 'status' ? 'active' : ''}`} onClick={() => setActiveTool('status')} title="État"><Wand2 size={18} className="status-tool-icon" /></button>
            <button className={`tool-btn ${activeTool === 'eraser' ? 'active' : ''}`} onClick={() => setActiveTool('eraser')} title="Gomme"><Eraser size={18} /></button>
          </div>
          <div className="divider" />
          <div className="action-group">
            <button className="tool-btn undo-btn" onClick={handleUndo} disabled={history.length === 0} title="Annuler"><Undo2 size={18} /></button>
            <button className={`tool-btn ${rotation === 90 ? 'active' : ''}`} onClick={() => setRotation(r => r === 0 ? 90 : 0)} title="Rotation"><RotateCw size={18} /></button>
            <button className="tool-btn" onClick={() => { if (confirm("Tout vider ?")) { saveToHistory(tokens, drawings); setTokens([]); setDrawings([]); } }} title="Vider plateau"><Trash2 size={18} /></button>
            <button className={`tool-btn ${isFullscreen ? 'active' : ''}`} onClick={handleFullscreen} title="Plein écran">{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}</button>
            <button className="tool-btn share-btn" onClick={handleShare} title="Copier lien"><Share2 size={18} /></button>
          </div>
        </div>
        <div className="header-right"></div>
      </header>
      <div className="tool-layout">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="work-area">
            <div className="dugout-container"><button className="add-player blue" onClick={() => { saveToHistory(tokens, drawings); setTokens(prev => [...prev, { id: `blue-${Date.now()}`, type: 'blue', x: -1, y: -1, status: 'up', location: 'reserve', number: prev.filter(t => t.type === 'blue').length + 1 } as TokenData]); }}>+ Joueur Bleu</button><Dugout team="blue" tokens={tokens.filter(t => t.type === 'blue' && t.location !== 'pitch')} activeId={activeId} /></div>
            <div className="pitch-viewport">
              <div ref={resizerRef} className="pitch-resizer" style={{ width: `${(rotation === 90 ? 758 : 1308) * finalScale}px`, height: `${(rotation === 90 ? 1308 : 758) * finalScale}px` }}>
                <div className="pitch-rotator" style={{ transform: `scale(${finalScale}) rotate(${rotation}deg)`, transformOrigin: 'center center', transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                  <Pitch 
                    tokens={tokens.filter(t => t.location === 'pitch')} onSquareClick={handleSquareClick} activeId={activeId} activeTool={activeTool} drawings={drawings} 
                    onDrawUpdate={(d) => { saveToHistory(tokens, drawings); setDrawings(d); }} rotation={rotation} finalScale={finalScale}
                  />
                  {carrier && <button className="drop-ball-btn" style={{ left: `${carrier.x * 50 + 60}px`, top: `${carrier.y * 50}px` }} onClick={() => { saveToHistory(tokens, drawings); setTokens(prev => prev.map(t => t.id === ballItem!.id ? { ...t, attachedToId: undefined, y: Math.min(14, carrier!.y + 1) } : t)); }} title="Lâcher"><Anchor size={14} /></button>}
                </div>
              </div>
            </div>
            <div className="dugout-container"><button className="add-player red" onClick={() => { saveToHistory(tokens, drawings); setTokens(prev => [...prev, { id: `red-${Date.now()}`, type: 'red', x: -1, y: -1, status: 'up', location: 'reserve', number: prev.filter(t => t.type === 'red').length + 1 } as TokenData]); }}>+ Joueur Rouge</button><Dugout team="red" tokens={tokens.filter(t => t.type === 'red' && t.location !== 'pitch')} activeId={activeId} /></div>
          </div>
          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
            {activeId ? <Token token={tokens.find(t => t.id === activeId)!} isOverlay activeTool={activeTool} rotation={rotation} hasBall={!!tokens.find(t => t.type === 'ball' && t.attachedToId === activeId)} /> : null}
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
