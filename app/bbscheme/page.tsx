"use client";

/**
 * BB Scheme - Plateau tactique Blood Bowl
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Eraser, 
  Share2, 
  Trash2, 
  RotateCw,
  Anchor,
  HelpCircle,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  Search,
  Wand2,
  Undo2,
  MousePointer2,
  Pencil,
  Star
} from "lucide-react";
import Link from "next/link";
import ClassicSelect from "@/common/components/Form/ClassicSelect";
import BackButton from "@/common/components/BackButton/BackButton";
import { toast } from "react-hot-toast";

import Tooltip from "@/common/components/Tooltip/Tooltip";
import Modal from "@/common/components/Modal/Modal";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
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

export default function BBSchemePage() {
  const [tokens, setTokens] = useState<TokenData[]>([
    { id: 'ball-initial', type: 'ball', x: 13, y: 7, status: 'up', location: 'pitch' }
  ]);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0); 
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawings, setDrawings] = useState<DrawingPath[]>([]);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [blueRoster, setBlueRoster] = useState<RosterData | null>(null);
  const [redRoster, setRedRoster] = useState<RosterData | null>(null);
  const [rosters, setRosters] = useState<{name: string, file: string}[]>([]);
  const [isBlueLoading, setIsBlueLoading] = useState(false);
  const [isRedLoading, setIsRedLoading] = useState(false);
  const [baseScale, setBaseScale] = useState(0.8);
  const [zoom, setZoom] = useState(1); 
  const [showTooltips, setShowTooltips] = useState(true);
  const [allStarPlayers, setAllStarPlayers] = useState<PlayerRosterInfo[]>([]);
  const resizerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStarPlayers = async () => {
      try {
        const resp = await fetch('/data/roster/all_star_players.json');
        const data = await resp.json();
        const sortedStars = data.roster.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setAllStarPlayers(sortedStars);
      } catch (e) {
        console.error("Failed to fetch star players", e);
      }
    };
    fetchStarPlayers();
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Panning UI
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const handlePanningStart = (e: React.MouseEvent) => {
    if (selectedId || activeTool !== 'select' || !viewportRef.current) return;
    if ((e.target as HTMLElement).closest('button')) return;
    setIsPanning(true);
    setPanStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: viewportRef.current.scrollLeft,
      scrollTop: viewportRef.current.scrollTop
    });
  };

  const handlePanningMove = (e: React.MouseEvent) => {
    if (!isPanning || !viewportRef.current) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    viewportRef.current.scrollLeft = panStart.scrollLeft - dx;
    viewportRef.current.scrollTop = panStart.scrollTop - dy;
  };

  const handlePanningEnd = () => {
    setIsPanning(false);
  };

  const handleStarPlayerSelect = (starName: string) => {
    if (!selectedId) return;
    
    saveToHistory(tokens, drawings);

    if (starName === "aucun") {
      setTokens(prev => prev.map(t => {
        if (t.id === selectedId) {
          return {
            ...t,
            playerInfo: {
              name: "Star Player",
              qty: "0-2",
              ma: "?", st: "?", ag: "?", pa: "?", av: "?",
              skills: ["Compétences variables"],
              primary: "", secondary: "",
              cost: 0 
            }
          };
        }
        return t;
      }));
      toast.success("Reset Star Player");
      return;
    }

    const star = allStarPlayers.find(s => s.name === starName);
    if (!star) return;

    setTokens(prev => prev.map(t => {
      if (t.id === selectedId) {
        return {
          ...t,
          playerInfo: { ...star }
        };
      }
      return t;
    }));
    toast.success(`${star.name} sélectionné !`);
  };

  const isStarPlayerSelected = selectedId?.includes('-star-');
  const selectedToken = tokens.find(t => t.id === selectedId);

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
    const rosterList = [
      "amazons", "black_orcs", "bretonnians", "chaos_chosen", 
      "chaos_dwarfs", "chaos_renegades", "dark_elves", "dwarves", "elven_union", 
      "gnomes", "goblins", "halflings", "high_elves", "humans", "imperial_nobility", 
      "khorne", "lizardmen", "necromantic_horror", "norse", "nurgle", "ogres", 
      "old_world_alliance", "orcs", "shambling_undead", "skaven", "slann_(naf)", 
      "snotlings", "tomb_kings", "underworld_denizens", "vampires", "wood_elves"
    ];

    const translationMap: Record<string, string> = {
      "amazons": "Amazones",
      "black_orcs": "Orques Noirs",
      "bretonnians": "Bretonniens",
      "chaos_chosen": "Élus du Chaos",
      "chaos_dwarfs": "Nains du Chaos",
      "chaos_renegades": "Renégats du Chaos",
      "dark_elves": "Elfes Noirs",
      "dwarves": "Nains",
      "elven_union": "Union Elfique",
      "gnomes": "Gnomes",
      "goblins": "Gobelins",
      "halflings": "Halfelins",
      "high_elves": "Hauts Elfes",
      "humans": "Humains",
      "imperial_nobility": "Noblesse Impériale",
      "khorne": "Élus de Khorne",
      "lizardmen": "Hommes-Lézards",
      "necromantic_horror": "Horreur Nécromantique",
      "norse": "Nordiques",
      "nurgle": "Élus de Nurgle",
      "ogres": "Ogres",
      "old_world_alliance": "Alliance du Vieux Monde",
      "orcs": "Orques",
      "shambling_undead": "Morts-Vivants",
      "skaven": "Skavens",
      "slann_(naf)": "Slanns (NAF)",
      "snotlings": "Snotlings",
      "tomb_kings": "Rois des Tombes",
      "underworld_denizens": "Habitants des Bas-Fonds",
      "vampires": "Vampires",
      "wood_elves": "Elfes Sylvains",
      "all_star_players": "Star Players"
    };

    setRosters(rosterList.map(r => ({ 
      name: translationMap[r] || r.replace(/_/g, ' ').toUpperCase(), 
      file: r 
    })).sort((a, b) => a.name.localeCompare(b.name)));
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
      const otherTeamTokens = prev.filter(t => t.type !== team && t.type !== 'ball');
      const ball = prev.find(t => t.type === 'ball');
      return [...otherTeamTokens, ...newTokens, ...(ball ? [ball] : [])];
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
      spawnRosterTokens(team, data);
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

  const handleTokenClick = (tokenId: string) => {
    if (selectedId === tokenId) {
      setSelectedId(null);
      return;
    }

    if (activeTool === 'eraser') {
      const token = tokens.find(t => t.id === tokenId);
      if (token && token.type !== 'ball') {
        saveToHistory(tokens, drawings);
        setTokens(prev => prev.filter(t => t.id !== tokenId));
      }
      return;
    }

    if (activeTool === 'status') {
      const p = tokens.find(t => t.id === tokenId && t.type !== 'ball');
      if (p) {
        saveToHistory(tokens, drawings);
        setTokens(prev => prev.map(t => (t.id === p.id) ? { ...t, status: ['up', 'prone', 'stunned', 'bonehead', 'stupid', 'fourchette'][(['up', 'prone', 'stunned', 'bonehead', 'stupid', 'fourchette'].indexOf(t.status) + 1) % 6] as TokenStatus } : t));
      }
      return;
    }

    const clickedToken = tokens.find(t => t.id === tokenId);
    if (!clickedToken) return;

    // Ball attachment logic
    const selectedToken = tokens.find(t => t.id === selectedId);
    if (selectedToken?.type === 'ball' && clickedToken.type !== 'ball') {
      if (clickedToken.location !== 'pitch') {
        setSelectedId(tokenId);
        return;
      }
      saveToHistory(tokens, drawings);
      setTokens(prev => prev.map(t => {
        if (t.id === selectedToken.id) return { ...t, x: clickedToken.x, y: clickedToken.y, attachedToId: clickedToken.id, location: clickedToken.location };
        return t;
      }));
      setSelectedId(clickedToken.id);
      toast.success("Balle récupérée !");
      return;
    }

    // Selecting a carried ball selects the carrier
    if (clickedToken.type === 'ball' && clickedToken.attachedToId) {
      setSelectedId(clickedToken.attachedToId);
      return;
    }

    setSelectedId(tokenId);
  };

  const movePlayerToZone = (tokenId: string, zone: TokenLocation) => {
    const player = tokens.find(t => t.id === tokenId);
    if (!player || player.type === 'ball') return;

    saveToHistory(tokens, drawings);

    setTokens(prev => prev.map(t => {
      // Move player and detach ball if any
      if (t.id === player.id) return { ...t, location: zone, x: -1, y: -1 };
      // Move carried ball along to the zone (but remain attached)
      if (t.type === 'ball' && t.attachedToId === player.id) return { ...t, location: zone, x: -1, y: -1 };
      return t;
    }));
  };

  const handleZoneClick = (team: 'blue' | 'red', zone: TokenLocation) => {
    if (!selectedId) return;
    const selectedToken = tokens.find(t => t.id === selectedId);
    if (!selectedToken || selectedToken.type === 'ball') return;

    if (selectedToken.type !== team) {
      toast.error(`C'est la zone adverse !`);
      return;
    }

    // Constraint: 16 total per team
    const teamTokens = tokens.filter(t => t.type === team);
    const playersInAction = teamTokens.filter(t => t.location !== 'box');
    if (selectedToken.location === 'box' && playersInAction.length >= 16) {
      toast.error("Capacité maximale de l'équipe (16) atteinte !");
      return;
    }

    movePlayerToZone(selectedId, zone);
  };

  const handleBoxClick = (team: 'blue' | 'red') => {
    if (!selectedId) return;
    const selectedToken = tokens.find(t => t.id === selectedId);
    if (!selectedToken || selectedToken.type === 'ball') return;
    if (selectedToken.type !== team) {
      toast.error(`C'est la boîte adverse !`);
      return;
    }
    movePlayerToZone(selectedId, 'box');
  };

  const handleSquareClick = (x: number, y: number) => {
    if (activeTool === 'draw') return;
    
    if (activeTool === 'eraser') { 
      const tAtPos = tokens.find(t => t.x === x && t.y === y && t.type !== 'ball');
      if (tAtPos) {
        saveToHistory(tokens, drawings);
        setTokens(prev => prev.filter(t => t.id !== tAtPos.id));
      }
      setDrawings([]); 
      return; 
    }

    if (activeTool === 'status') {
      const p = tokens.find(t => t.x === x && t.y === y && t.type !== 'ball');
      if (p) {
        saveToHistory(tokens, drawings);
        setTokens(prev => prev.map(t => (t.id === p.id) ? { ...t, status: ['up', 'prone', 'stunned', 'bonehead', 'stupid', 'fourchette'][(['up', 'prone', 'stunned', 'bonehead', 'stupid', 'fourchette'].indexOf(t.status) + 1) % 6] as TokenStatus } : t));
      }
      return;
    }

    if (!selectedId) return;

    const selectedToken = tokens.find(t => t.id === selectedId);
    if (!selectedToken) return;

    saveToHistory(tokens, drawings);

    // Movement constraints
    if (selectedToken.type !== 'ball') {
      const teamTokens = tokens.filter(t => t.type === selectedToken.type);
      const playersInAction = teamTokens.filter(t => t.location !== 'box');
      const onPitchCount = teamTokens.filter(t => t.location === 'pitch').length;

      if (selectedToken.location === 'box' && playersInAction.length >= 16) {
        toast.error("Capacité maximale de l'équipe (16) atteinte !");
        return;
      }
      if (selectedToken.location !== 'pitch' && onPitchCount >= 14) {
        toast.error("Déjà 14 joueurs sur le terrain !");
        return;
      }
      const playerAtTarget = tokens.find(t => t.x === x && t.y === y && t.type !== 'ball' && t.id !== selectedToken.id);
      if (playerAtTarget) { toast.error("Case déjà occupée"); return; }
    }

    let caughtBall = false;
    const newTokens = tokens.map(t => {
      if (t.id === selectedToken.id) {
        if (t.type === 'ball') {
          const player = tokens.find(p => p.x === x && p.y === y && p.type !== 'ball');
          return { ...t, x, y, location: 'pitch' as TokenLocation, attachedToId: player?.id };
        }
        return { ...t, x, y, location: 'pitch' as TokenLocation };
      }
      // Move carried ball along
      if (t.type === 'ball' && selectedToken.type !== 'ball') {
         if (t.attachedToId === selectedToken.id) return { ...t, x, y };
         // Pickup ball if moving onto it
         if (t.x === x && t.y === y) { 
           caughtBall = true; 
           return { ...t, x, y, attachedToId: selectedToken.id }; 
         }
      }
      return t;
    }) as TokenData[];
    
    setTokens(newTokens);
    if (caughtBall) toast.success("Balle récupérée !");
  };

  const findNearestFreeSquare = (x: number, y: number, currentTokens: TokenData[]): { x: number, y: number } => {
    const COLS = 26;
    const ROWS = 15;
    
    const isSquareOccupied = (tx: number, ty: number) => {
      return currentTokens.some(t => t.location === 'pitch' && t.x === tx && t.y === ty && t.type !== 'ball');
    };

    if (!isSquareOccupied(x, y)) return { x, y };

    // Spiral search for nearest free square
    for (let r = 1; r < 5; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && !isSquareOccupied(nx, ny)) {
            return { x: nx, y: ny };
          }
        }
      }
    }
    return { x, y };
  };

  const handleDetachBall = () => {
    const ball = tokens.find(t => t.type === 'ball');
    if (!ball || !ball.attachedToId) return;

    const carrier = tokens.find(t => t.id === ball.attachedToId);
    if (!carrier) return;

    saveToHistory(tokens, drawings);
    const dropPos = findNearestFreeSquare(carrier.x, carrier.y, tokens);

    setTokens(prev => prev.map(t => t.type === 'ball' ? { ...t, attachedToId: undefined, x: dropPos.x, y: dropPos.y } : t));
    toast.success("Balle lâchée sur une case libre");
  };

  const handleFullscreen = () => {
    if (!isFullscreen) { document.documentElement.requestFullscreen().catch(() => {}); setIsFullscreen(true); } 
    else { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); setIsFullscreen(false); }
  };

  const handleShare = () => { navigator.clipboard.writeText(window.location.href); toast.success("Lien copié !"); };

  const ballItem = tokens.find(t => t.type === 'ball');
  const carrier = ballItem?.attachedToId ? tokens.find(t => t.id === ballItem.attachedToId) : null;

  return (
    <main 
      className={`bbscheme-page ${isFullscreen ? 'fullscreen' : ''}`}
      onContextMenu={(e) => { e.preventDefault(); setSelectedId(null); }}
    >
      <header className="tool-header">
        <div className="header-left">
          <BackButton href="/" title="Retour" />
          <div className="title-group">
            <h1 className="title-modern">BB<span>Scheme</span></h1>
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
            <Tooltip text={ballItem?.attachedToId ? "Détacher le ballon du joueur" : "Ballon libre (au sol)"} position="bottom">
              <button 
                className={`tool-btn`} 
                onClick={handleDetachBall}
                disabled={!ballItem?.attachedToId}
                style={{ opacity: !ballItem?.attachedToId ? 0.4 : 1 }}
              >
                <BallIcon size={18} />
              </button>
            </Tooltip>
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
            <Tooltip text="Tout vider" position="bottom"><button className="tool-btn" onClick={() => setIsClearModalOpen(true)}><Trash2 size={18} /></button></Tooltip>
            <Tooltip text="Plein écran" position="bottom"><button className={`tool-btn ${isFullscreen ? 'active' : ''}`} onClick={handleFullscreen}>{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}</button></Tooltip>
            <Tooltip text="Partager" position="bottom"><button className="tool-btn share-btn" onClick={handleShare}><Share2 size={18} /></button></Tooltip>
            <div className="divider" />
            <Tooltip text="Aide & Guide" position="bottom"><button className={`tool-btn help-btn ${isHelpOpen ? 'active' : ''}`} onClick={() => setIsHelpOpen(true)}><HelpCircle size={18} /></button></Tooltip>
          </div>
        </div>
        <div className="header-right">
          {isStarPlayerSelected && (
          <div className="star-player-selector" style={{ marginRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 900, textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>STAR:</span>
            <ClassicSelect 
                onChange={(e) => handleStarPlayerSelect(e.target.value)} 
                value={selectedToken?.playerInfo?.name === "Star Player" ? "aucun" : selectedToken?.playerInfo?.name || "aucun"}
                size="sm"
                containerStyle={{ width: "180px" }}
              >
                <option value="aucun">Aucun (Générique)</option>
                {allStarPlayers.map((star, idx) => (
                  <option key={`star-opt-${idx}`} value={star.name}>
                    {star.name} ({star.cost / 1000}k)
                  </option>
                ))}
              </ClassicSelect>
            </div>
          )}
          <div className="credits-link">
          <span>Inspiré par <a href="https://www.teamfrancebb.fr/bbpusher/" target="_blank" rel="noopener noreferrer">Elyoukey et Thot</a></span>
          </div>
        </div>
      </header>

      <Modal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Guide Tactique BB Scheme">
        <div className="help-content">
          <section className="help-section">
            <h3><MousePointer2 size={16} /> Sélection & Déplacement</h3>
            <p>Cliquez sur un joueur ou le ballon pour le sélectionner. Cliquez ensuite sur une case du terrain, une zone de la fosse ou dans la réserve pour le déplacer.</p>
          </section>
          <section className="help-section">
            <h3><BallIcon size={16} /> Gestion du Ballon</h3>
            <p>Pour attacher le ballon à un joueur : sélectionnez le ballon puis cliquez sur le joueur. Une fois attaché, le bouton "Ballon" de la barre d'outils devient une ancre pour détacher la balle.</p>
          </section>
          <section className="help-section">
            <h3><Pencil size={16} /> Annotation</h3>
            <p>Dessinez des flèches ou des zones tactiques directement sur le terrain. Cliquez sur la gomme pour tout effacer.</p>
          </section>
          <section className="help-section">
            <h3><Wand2 size={16} /> États du joueur</h3>
            <p>Cliquez sur un joueur pour changer son état : <strong>Couché</strong>, <strong>Sonné</strong>, <strong>Cerveau Lent</strong> (Os), <strong>Débile</strong> (Crocs) ou <strong>Féroce</strong> (Fourchette).</p>
          </section>
        </div>
        <style jsx>{`
          .help-content { display: flex; flex-direction: column; gap: 1.2rem; max-height: 60vh; overflow-y: auto; padding-right: 10px; }
          .help-section { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
          .help-section h3 { display: flex; align-items: center; gap: 0.5rem; color: var(--accent); margin-bottom: 0.5rem; font-size: 1rem; }
          .help-section p { font-size: 0.85rem; line-height: 1.4; opacity: 0.8; margin: 0; }
        `}</style>
      </Modal>

      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={async () => {
          saveToHistory(tokens, drawings);
          setTokens([{ id: 'ball-initial', type: 'ball', x: 13, y: 7, status: 'up', location: 'pitch' }]);
          setDrawings([]);
          setIsClearModalOpen(false);
          setSelectedId(null);
          toast.success("Plateau tactique vidé");
        }}
        title="Tout vider"
        message="Voulez-vous vraiment vider tout le plateau ? Cela effacera tous les joueurs et toutes les annotations. Le ballon sera remis au centre."
        confirmLabel="Tout vider"
        isDanger={true}
      />

      <div className="tool-layout">
        <div className="work-area">
          <div className="global-team-area blue">
            <FigurineBox 
              team="blue" 
              roster={blueRoster?.roster || []} 
              tokens={tokens.filter(t => t.type === 'blue' && t.location === 'box')}
              rosterList={rosters}
              onRosterSelect={(file) => handleRosterSelect('blue', file)}
              onTokenClick={handleTokenClick}
              onBoxClick={() => handleBoxClick('blue')}
              selectedId={selectedId}
              isLoading={isBlueLoading}
              showTooltips={showTooltips}
              allTokens={tokens}
            />
            <div className="dugout-container">
              <Dugout 
                team="blue" 
                tokens={tokens.filter(t => t.type === 'blue' && (t.location === 'reserve' || t.location === 'ko' || t.location === 'injured' || t.location === 'expelled'))} 
                onTokenClick={handleTokenClick}
                onZoneClick={(zone) => handleZoneClick('blue', zone)}
                selectedId={selectedId} 
                showTooltips={showTooltips} 
                allTokens={tokens}
              />
            </div>
          </div>

          <div 
            ref={viewportRef}
            className={`pitch-viewport ${selectedId ? 'has-selection' : ''} ${isPanning ? 'panning' : ''}`}
            onMouseDown={handlePanningStart}
            onMouseMove={handlePanningMove}
            onMouseUp={handlePanningEnd}
            onMouseLeave={handlePanningEnd}
          >
            <div ref={resizerRef} className="pitch-resizer" style={{ width: `${(rotation === 90 ? 758 : 1308) * finalScale}px`, height: `${(rotation === 90 ? 1308 : 758) * finalScale}px` }}>
              <div className="pitch-rotator" style={{ transform: `scale(${finalScale}) rotate(${rotation}deg)`, transformOrigin: 'center center', transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                <Pitch 
                  tokens={tokens.filter(t => t.location === 'pitch')} 
                  onSquareClick={handleSquareClick} 
                  onTokenClick={handleTokenClick}
                  selectedId={selectedId} 
                  activeTool={activeTool} 
                  drawings={drawings} 
                  onDrawUpdate={(d) => { saveToHistory(tokens, drawings); setDrawings(d); }} 
                  rotation={rotation} 
                  finalScale={finalScale} 
                  showTooltips={showTooltips} 
                />
              </div>
            </div>
          </div>

          <div className="global-team-area red">
            <div className="dugout-container">
              <Dugout 
                team="red" 
                tokens={tokens.filter(t => t.type === 'red' && (t.location === 'reserve' || t.location === 'ko' || t.location === 'injured' || t.location === 'expelled'))} 
                onTokenClick={handleTokenClick}
                onZoneClick={(zone) => handleZoneClick('red', zone)}
                selectedId={selectedId} 
                showTooltips={showTooltips} 
                allTokens={tokens}
              />
            </div>
            <FigurineBox 
              team="red" 
              roster={redRoster?.roster || []} 
              tokens={tokens.filter(t => t.type === 'red' && t.location === 'box')}
              rosterList={rosters}
              onRosterSelect={(file) => handleRosterSelect('red', file)}
              onTokenClick={handleTokenClick}
              onBoxClick={() => handleBoxClick('red')}
              selectedId={selectedId}
              isLoading={isRedLoading}
              showTooltips={showTooltips}
              allTokens={tokens}
            />
          </div>
        </div>
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
