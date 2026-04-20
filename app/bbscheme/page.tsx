"use client";

/**
 * BB Scheme - Plateau tactique Blood Bowl
 */

import BackButton from "@/common/components/BackButton/BackButton";
import ClassicSelect from "@/common/components/Form/ClassicSelect";
import html2canvas from "html2canvas";
import {
  Clock,
  Copy,
  Download,
  Eraser,
  HelpCircle,
  Info,
  Loader2,
  Maximize,
  Minimize,
  MousePointer2,
  Pause,
  Pencil,
  Play,
  PlusCircle,
  RotateCw,
  Share2,
  SkipBack,
  SkipForward,
  Trash2,
  Undo2,
  Wand2,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { getBoardState, saveBoardState } from "./actions";
// @ts-ignore
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import gifshot from "gifshot";

import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import Modal from "@/common/components/Modal/Modal";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import BBSchemePlayer from "./component/BBSchemePlayer";
import Dugout from "./component/Dugout";
import FigurineBox from "./component/FigurineBox";
import Pitch from "./component/Pitch";

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
  const [isSharing, setIsSharing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [generatedGif, setGeneratedGif] = useState<string | null>(null);

  // Séquence & Lecteur
  const [frames, setFrames] = useState<TokenData[][]>([[{ id: 'ball-initial', type: 'ball', x: 13, y: 7, status: 'up', location: 'pitch' }]]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(800); // ms per frame
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const searchParams = useSearchParams();
  const boardId = searchParams.get("id");
  const isEmbed = searchParams.get("embed") === "true";

  // SI MODE EMBED : Affichage du player dédié uniquement
  if (isEmbed && boardId) {
    return <BBSchemePlayer boardId={boardId} />;
  }

  const layout = searchParams.get("layout") || "horizontal";
  const [blueRoster, setBlueRoster] = useState<RosterData | null>(null);
  const [redRoster, setRedRoster] = useState<RosterData | null>(null);
  const [blueRosterFile, setBlueRosterFile] = useState<string | null>(null);
  const [redRosterFile, setRedRosterFile] = useState<string | null>(null);
  const [rosters, setRosters] = useState<{ name: string, file: string }[]>([]);
  const [isBlueLoading, setIsBlueLoading] = useState(false);
  const [isRedLoading, setIsRedLoading] = useState(false);
  const [baseScale, setBaseScale] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Ajustement automatique de l'échelle en mode Embed (YouTube style)
  useEffect(() => {
    if (isEmbed) {
      const updateScale = () => {
        // Unités exactes du terrain (26 cases * 50px = 1300, 15 cases * 50px = 750)
        const pitchW = rotation === 90 ? 750 : 1300;
        const pitchH = rotation === 90 ? 1300 : 750;
        const scaleW = window.innerWidth / pitchW;
        const scaleH = (window.innerHeight - 60) / pitchH; // -60 pour la barre de contrôle
        setZoom(Math.min(scaleW, scaleH)); // 100% fit
      };
      updateScale();
      window.addEventListener('resize', updateScale);
      setTimeout(updateScale, 100); // Hack pour s'assurer que les dimensions sont prêtes
      return () => window.removeEventListener('resize', updateScale);
    }
  }, [isEmbed, rotation]);
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

  // Chargement de l'état depuis l'ID URL
  useEffect(() => {
    if (boardId) {
      const loadState = async () => {
        setLoading(true);
        try {
          const result = await getBoardState(boardId);
          if (result.success && result.data) {
            const parsed = JSON.parse(result.data);
            if (parsed.frames && parsed.frames.length > 0) {
              const genericStarInfo: PlayerRosterInfo = {
                name: "Star Player", qty: "0-2",
                ma: "?", st: "?", ag: "?", pa: "?", av: "?",
                skills: ["Compétences variables"], primary: "", secondary: "", cost: 0
              };

              // 1. Charger les rosters d'abord de manière synchrone
              const [resBlue, resRed] = await Promise.all([
                parsed.blueRosterFile ? fetch(`/data/roster/${parsed.blueRosterFile}.json`).then(r => r.json()).catch(() => null) : null,
                parsed.redRosterFile ? fetch(`/data/roster/${parsed.redRosterFile}.json`).then(r => r.json()).catch(() => null) : null
              ]);

              let blueBase: TokenData[] = [];
              let redBase: TokenData[] = [];

              if (resBlue) {
                const enriched = { ...resBlue, roster: [...resBlue.roster, genericStarInfo] };
                setBlueRoster(enriched);
                setBlueRosterFile(parsed.blueRosterFile);
                blueBase = enriched.roster.flatMap((p: any, pIdx: number) => {
                  const isStar = p.name === "Star Player";
                  const q = p.qty || "2";
                  const limit = isStar ? 2 : (parseInt(q.includes('-') ? q.split('-').pop() : q) || 2);
                  return Array.from({ length: limit }).map((_, i) => ({
                    id: `blue-${pIdx}-${i}`, // ID UNIQUE ET FIXE PAR POSITION DANS LE ROSTER
                    type: 'blue' as const, x: -1, y: -1, status: 'up' as const, location: 'box' as const,
                    number: isStar ? 99 + (i + 1) : i + 1,
                    playerInfo: p
                  }));
                }) as TokenData[];
              }

              if (resRed) {
                const enriched = { ...resRed, roster: [...resRed.roster, genericStarInfo] };
                setRedRoster(enriched);
                setRedRosterFile(parsed.redRosterFile);
                redBase = enriched.roster.flatMap((p: any, pIdx: number) => {
                  const isStar = p.name === "Star Player";
                  const q = p.qty || "2";
                  const limit = isStar ? 2 : (parseInt(q.includes('-') ? q.split('-').pop() : q) || 2);
                  return Array.from({ length: limit }).map((_, i) => ({
                    id: `red-${pIdx}-${i}`, // ID UNIQUE ET FIXE PAR POSITION DANS LE ROSTER
                    type: 'red' as const, x: -1, y: -1, status: 'up' as const, location: 'box' as const,
                    number: isStar ? 99 + (i + 1) : i + 1,
                    playerInfo: p
                  }));
                }) as TokenData[];
              }

              const ballBase: TokenData = { id: 'ball-initial', type: 'ball', x: 13, y: 7, status: 'up', location: 'pitch' };
              const fullPack = [...blueBase, ...redBase, ballBase];
              const baseIds = new Set(fullPack.map(b => b.id));

              // Charger starPool pour enrichissement
              let starPool: PlayerRosterInfo[] = [];
              try {
                const resp = await fetch('/data/roster/all_star_players.json');
                const starData = await resp.json();
                starPool = starData.roster;
              } catch (e) { }

              // 2. FUSION DÉTERMINISTE (Stable & Robuste)
              const hydratedFrames = (parsed.frames as any[][]).map((savedFrame: any[]) => {
                // On repart du pool complet (fullPack) où tout le monde est en réserve ('box')
                const currentFrameTokens = fullPack.map(t => ({ ...t }));

                savedFrame.forEach(s => {
                  const idx = currentFrameTokens.findIndex(t => t.id === s.id);
                  if (idx !== -1) {
                    // On fusionne les data de sauvegarde sur le pion du pool (qui a déjà le playerInfo générique)
                    const base = currentFrameTokens[idx];
                    currentFrameTokens[idx] = { ...base, ...s };

                    // RESTAURATION CRITIQUE DU STAR PLAYER
                    // Si c'est un emplacement Star Player et qu'on a un nom de star dans la save
                    if (base.playerInfo?.name === "Star Player" && s.starName) {
                      const details = starPool.find(sd => sd.name === s.starName);
                      if (details) currentFrameTokens[idx].playerInfo = details;
                    }
                  } else if (s.type === 'ball') {
                    // Le ballon est géré par simple correspondance de type
                    const ballIdx = currentFrameTokens.findIndex(t => t.type === 'ball');
                    if (ballIdx !== -1) currentFrameTokens[ballIdx] = { ...currentFrameTokens[ballIdx], ...s };
                  }
                });

                return currentFrameTokens;
              });

              if (hydratedFrames.length > 0) {
                setFrames(hydratedFrames);
                setTokens([...hydratedFrames[0]]);
              }
              if (parsed.drawings) setDrawings(parsed.drawings);
              if (parsed.rotation !== undefined) setRotation(parsed.rotation);
              if (parsed.speed !== undefined) setPlaybackSpeed(parsed.speed);
            }
          } else {
            toast.error(result.error || "Plateau introuvable");
          }
        } catch (err) {
          console.error("Critical load error", err);
        } finally {
          setLoading(false);
        }
      };
      loadState();
    }
  }, [boardId]);

  // Sync frames when roster data is loaded (important for box tokens)
  useEffect(() => {
    if (loading || frames.length === 0) return;

    // Si on a des rosters chargés mais que nos frames actuelles n'ont pas les infos de joueur, on ré-hydrate
    const firstFrame = frames[0];
    const hasInfo = firstFrame.some(t => t.playerInfo);

    if (!hasInfo && (blueRoster || redRoster)) {
      // On redéclenche une hydratation silencieuse pour enrichir les frames existantes
      setFrames(prevFrames => prevFrames.map(f => {
        return f.map(t => {
          if (t.playerInfo) return t;
          // Chercher dans les rosters
          let info;
          if (t.id.startsWith('blue-')) {
            const namePart = t.id.split('-').slice(1, -1).join(' ').replace(/-/g, ' ');
            info = blueRoster?.roster.find(p => p.name === namePart);
          } else if (t.id.startsWith('red-')) {
            const namePart = t.id.split('-').slice(1, -1).join(' ').replace(/-/g, ' ');
            info = redRoster?.roster.find(p => p.name === namePart);
          }
          return info ? { ...t, playerInfo: info } : t;
        });
      }));
    }
  }, [blueRoster, redRoster, loading]);

  // Synchronisation de rotation si layout forcé
  useEffect(() => {
    if (layout === "vertical" && rotation !== 90) setRotation(90);
    if (layout === "horizontal" && rotation !== 0) setRotation(0);
  }, [layout]);

  // Logique du lecteur (Playback)
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentFrameIndex(prev => {
          const next = prev + 1;
          if (next >= frames.length) {
            return 0; // Loop
          }
          return next;
        });
      }, playbackSpeed);
    } else if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, frames.length, playbackSpeed]);

  const lastIndexRef = useRef(currentFrameIndex);

  // Synchronisation unifiée Frames / Tokens
  useEffect(() => {
    // CAS 1: Changement d'index (On charge la nouvelle frame dans le buffer)
    if (lastIndexRef.current !== currentFrameIndex) {
      if (frames[currentFrameIndex]) {
        setTokens(frames[currentFrameIndex]);
      }
      lastIndexRef.current = currentFrameIndex;
      return; // On arrête là pour ce cycle pour éviter de reboucler sur la sauvegarde
    }

    // CAS 2: Lecture (Playback) - On force la valeur si on est en train de jouer
    if (isPlaying) {
      if (frames[currentFrameIndex] && tokens !== frames[currentFrameIndex]) {
        setTokens(frames[currentFrameIndex]);
      }
      return;
    }

    // CAS 3: Modification en cours (Autosave vers Frames)
    if (frames[currentFrameIndex] !== tokens) {
      setFrames(prev => {
        if (prev[currentFrameIndex] === tokens) return prev; // Déjà sync
        const next = [...prev];
        next[currentFrameIndex] = tokens;
        return next;
      });
    }
  }, [currentFrameIndex, tokens, frames, isPlaying]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      if (isEmbed) return; // Désactiver zoom en embed
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

      // Si c'est le Star Player (ajouté manuellement), on s'assure d'utiliser l'ID attendu par le loader
      const isStar = player.name === "Star Player";
      const slug = isStar ? "star" : player.name.replace(/\s+/g, '-');

      for (let i = 0; i < qty; i++) {
        newTokens.push({
          id: `${team}-${slug}-${i}`,
          type: team,
          x: -1, y: -1, status: 'up', location: 'box',
          number: isStar ? 99 + (i + 1) : i + 1,
          playerInfo: player
        });
      }
    });

    setTokens(prev => {
      // CLEAR ALL existing tokens of the same team
      const otherTeamTokens = prev.filter(t => t.type !== team && t.type !== 'ball');
      const ball = prev.find(t => t.type === 'ball');
      const finalTokens = [...otherTeamTokens, ...newTokens, ...(ball ? [ball] : [])];

      // Update frames source of truth as well
      setFrames(fPrev => {
        const fNext = [...fPrev];
        fNext[currentFrameIndex] = finalTokens;
        return fNext;
      });

      return finalTokens;
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

      if (team === 'blue') {
        setBlueRoster(enrichedData);
        setBlueRosterFile(fileName);
      } else {
        setRedRoster(enrichedData);
        setRedRosterFile(fileName);
      }
      spawnRosterTokens(team, enrichedData);
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
    setHistory(prev => [{ tokens: [...currentTokens.map(t => ({ ...t }))], drawings: [...currentDrawings.map(d => ({ ...d }))] }, ...prev.slice(0, 19)]);
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
      if (selectedId && selectedId !== clickedToken.attachedToId) {
        // Redirect click to the carrier for move/pickup logic
        handleTokenClick(clickedToken.attachedToId);
        return;
      }
      setSelectedId(clickedToken.attachedToId);
      return;
    }

    if (selectedToken && selectedToken.type !== 'ball' && clickedToken.type === 'ball') {
      // Moveto ball and pickup
      handleSquareClick(clickedToken.x, clickedToken.y);
      return;
    }

    setSelectedId(tokenId);
  };

  const movePlayerToZone = (tokenId: string, zone: TokenLocation) => {
    const player = tokens.find(t => t.id === tokenId);
    if (!player || player.type === 'ball') return;

    saveToHistory(tokens, drawings);

    setTokens(prev => {
      const ball = prev.find(t => t.type === 'ball' && t.attachedToId === player.id);
      let dropPos = { x: player.x, y: player.y };

      if (ball && zone !== 'pitch') {
        // Detach ball if player leaves pitch
        dropPos = findNearestFreeSquare(player.x, player.y, prev);
      }

      return prev.map(t => {
        // Move player
        if (t.id === player.id) return { ...t, location: zone, x: -1, y: -1 };
        // Handle ball
        if (t.type === 'ball' && t.attachedToId === player.id) {
          if (zone === 'pitch') return { ...t, location: zone, x: -1, y: -1 }; // Should not happen via this fn but for safety
          return { ...t, attachedToId: undefined, location: 'pitch', x: dropPos.x, y: dropPos.y };
        }
        return t;
      });
    });
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
    if (!isFullscreen) { document.documentElement.requestFullscreen().catch(() => { }); setIsFullscreen(true); }
    else { if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); setIsFullscreen(false); }
  };

  const handleShare = async () => {
    setIsSharing(true);

    // OPTIMISATION ULTRA : On ne capture QUE les tokens qui ne sont pas dans la "box" (réserve initiale)
    // Les autres seront recréés dynamiquement à partir du roster lors du chargement.
    const optimizedFrames = frames.map(frame =>
      frame.filter(t => t.type === 'ball' || t.location !== 'box').map(token => {
        const { playerInfo, ...stripped } = token;
        // Si c'est une star nommée, on sauvegarde son nom pour la réhydratation
        const starName = (token.playerInfo && token.playerInfo.name !== "Star Player" &&
          (token.id.includes('-star-') || token.playerInfo.qty === "0-2"))
          ? token.playerInfo.name : undefined;
        return { ...stripped, starName };
      })
    );

    const stateData = JSON.stringify({
      frames: optimizedFrames,
      drawings,
      blueRosterFile,
      redRosterFile,
      rotation,
      speed: playbackSpeed
    });

    const result = await saveBoardState(stateData);
    setIsSharing(false);

    if (result.success) {
      const shareUrl = `${window.location.origin}/bbscheme?id=${result.id}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Lien de partage copié !");
    } else {
      toast.error(result.error || "Erreur lors du partage");
    }
  };

  const addFrame = () => {
    const newFrame = [...tokens.map(t => ({ ...t }))];
    setFrames(prev => [...prev, newFrame]);
    setCurrentFrameIndex(frames.length);
    toast.success("Image ajoutée");
  };

  const duplicateFrame = () => {
    const newFrame = [...tokens.map(t => ({ ...t }))];
    setFrames(prev => {
      const next = [...prev];
      next.splice(currentFrameIndex + 1, 0, newFrame);
      return next;
    });
    setCurrentFrameIndex(currentFrameIndex + 1);
    toast.success("Image dupliquée");
  };

  const removeFrame = () => {
    if (frames.length <= 1) return;
    const targetIndex = Math.max(0, currentFrameIndex - 1);
    setFrames(prev => prev.filter((_, i) => i !== currentFrameIndex));
    setCurrentFrameIndex(targetIndex);
    toast.success("Image supprimée");
  };

  const handleGifExport = async () => {
    if (frames.length === 0) return;

    setIsExporting(true);
    setExportProgress(0);
    setGeneratedGif(null);
    setIsPlaying(false);

    const capturedImages: string[] = [];
    const originalFrame = currentFrameIndex;

    try {
      // Masquer les outils temporairement pour la capture si nécessaire
      // Capture frame by frame
      for (let i = 0; i < frames.length; i++) {
        setCurrentFrameIndex(i);
        setExportProgress(Math.round(((i + 1) / frames.length) * 50));

        // Attendre que le DOM se mette à jour
        await new Promise(resolve => setTimeout(resolve, 100));

        const pitchElement = document.querySelector(".pitch-resizer") as HTMLElement;
        if (pitchElement) {
          const canvas = await html2canvas(pitchElement, {
            backgroundColor: "#0c0c14",
            scale: 1, // On garde une taille raisonnable pour le GIF
            logging: false,
            useCORS: true
          });
          capturedImages.push(canvas.toDataURL("image/png"));
        }
      }

      setExportProgress(60);

      // Génération du GIF via gifshot
      gifshot.createGIF({
        images: capturedImages,
        interval: playbackSpeed / 1000,
        gifWidth: 800,
        gifHeight: 500,
        numWorkers: 2,
      }, (obj: any) => {
        if (!obj.error) {
          setGeneratedGif(obj.image);
          setExportProgress(100);
          toast.success("GIF généré avec succès !");
        } else {
          toast.error("Erreur lors de la génération du GIF");
          setIsExporting(false);
        }
      });

    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur lors de l'export");
      setIsExporting(false);
    } finally {
      setCurrentFrameIndex(originalFrame);
    }
  };

  const ballItem = tokens.find(t => t.type === 'ball');
  const carrier = ballItem?.attachedToId ? tokens.find(t => t.id === ballItem.attachedToId) : null;

  return (
    <main
      className={`bbscheme-page ${isFullscreen ? 'fullscreen' : ''} ${isEmbed ? 'is-embed' : ''}`}
      onContextMenu={(e) => { e.preventDefault(); setSelectedId(null); }}
    >
      {!isEmbed && (
        <header className="tool-header">
          <div className="header-left">
            <BackButton href="/" title="Retour" />
            <div className="title-group">
              <h1 className="title-modern">BB<span>Scheme</span></h1>
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div className="tool-handler">
            <div className="zoom-bar">
              <ZoomOut size={14} color="#fff" />
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
              />
              <ZoomIn size={14} color="#fff" />
            </div>
            <div className="divider" style={{ opacity: 0.3 }} />
            <div className="tool-group">
              <Tooltip text="Sélect. intelligente" position="bottom"><button className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`} onClick={() => setActiveTool('select')}><MousePointer2 size={18} /></button></Tooltip>
              <Tooltip text="Annotation" position="bottom"><button className={`tool-btn ${activeTool === 'draw' ? 'active' : ''}`} onClick={() => setActiveTool('draw')}><Pencil size={18} color="#ef4444" /></button></Tooltip>
              <Tooltip text={ballItem?.attachedToId ? "Détacher le ballon" : "Ballon libre"} position="bottom">
                <button
                  className={`tool-btn`}
                  onClick={handleDetachBall}
                  disabled={!ballItem?.attachedToId}
                  style={{ opacity: !ballItem?.attachedToId ? 0.4 : 1 }}
                >
                  <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyItems: 'center' }}>🏈</div>
                </button>
              </Tooltip>
              <Tooltip text="État du joueur" position="bottom"><button className={`tool-btn ${activeTool === 'status' ? 'active' : ''}`} onClick={() => setActiveTool('status')}><Wand2 size={18} className="status-tool-icon" /></button></Tooltip>
              <Tooltip text="Gomme" position="bottom"><button className={`tool-btn ${activeTool === 'eraser' ? 'active' : ''}`} onClick={() => setActiveTool('eraser')}><Eraser size={18} /></button></Tooltip>
              <Tooltip text="Annuler" position="bottom"><button className="tool-btn" onClick={handleUndo} disabled={history.length === 0}><Undo2 size={18} /></button></Tooltip>
              <Tooltip text="Tout vider" position="bottom"><button className="tool-btn" onClick={() => setIsClearModalOpen(true)}><Trash2 size={18} /></button></Tooltip>
            </div>

            <div className="divider" />

            {/* Séquence complète */}
            <div className="sequence-group" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {/* 1. Sélecteur de vitesse */}
              <div className="speed-control theme-aware">
                <Clock size={12} />
                <input
                  type="number"
                  className="speed-input theme-aware"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  min={100}
                  max={3000}
                  step={100}
                />
                <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>ms</span>
              </div>

              {/* 2. Compteur d'images */}
              <div className="frame-counter" style={{ minWidth: '40px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                {currentFrameIndex + 1}/{frames.length}
              </div>

              {/* 3. Précédent */}
              <Tooltip text="Image précédente" position="bottom">
                <span><ClassicButton onClick={() => setCurrentFrameIndex(prev => Math.max(0, prev - 1))} disabled={currentFrameIndex === 0 || isPlaying} size="xs" icon={<SkipBack size={14} />} /></span>
              </Tooltip>

              {/* 4. Lecture */}
              <Tooltip text={isPlaying ? "Pause" : "Lecture"} position="bottom">
                <span>
                  <CTAButton
                    onClick={() => setIsPlaying(!isPlaying)}
                    icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    size="sm"
                    style={{ borderRadius: "6px", width: "36px", height: "36px", padding: 0, justifyContent: "center" }}
                  />
                </span>
              </Tooltip>

              {/* 5. Suivant */}
              <Tooltip text="Image suivante" position="bottom">
                <span><ClassicButton onClick={() => setCurrentFrameIndex(prev => Math.min(frames.length - 1, prev + 1))} disabled={currentFrameIndex === frames.length - 1 || isPlaying} size="xs" icon={<SkipForward size={14} />} /></span>
              </Tooltip>

              <div className="divider" style={{ opacity: 0.3 }} />

              {/* Actions images */}
              <Tooltip text="Ajouter image" position="bottom"><span><ClassicButton onClick={addFrame} size="xs" icon={<PlusCircle size={14} />} disabled={isPlaying} /></span></Tooltip>
              <Tooltip text="Dupliquer image" position="bottom"><span><ClassicButton onClick={duplicateFrame} size="xs" icon={<Copy size={14} />} disabled={isPlaying} /></span></Tooltip>
              <Tooltip text="Supprimer image" position="bottom"><span><ClassicButton onClick={removeFrame} size="xs" icon={<Trash2 size={14} />} disabled={isPlaying || frames.length <= 1} /></span></Tooltip>
              <Tooltip text="Exporter en GIF" position="bottom">
                <span>
                  <CTAButton onClick={handleGifExport} disabled={isPlaying || isExporting} size="xs" style={{ padding: '0 8px', height: '28px' }}>
                    <Download size={12} /> <span style={{ marginLeft: '4px', fontSize: '0.7rem' }}>{isExporting ? `${exportProgress}%` : 'GIF'}</span>
                  </CTAButton>
                </span>
              </Tooltip>
            </div>

            <div className="divider" />

            <div className="action-group">
              <Tooltip text="Afficher les infos" position="bottom">
                <button className={`tool-btn ${showTooltips ? 'active' : ''}`} onClick={() => setShowTooltips(!showTooltips)}>
                  <Info size={18} />
                </button>
              </Tooltip>
              <Tooltip text="Rotation" position="bottom"><button className={`tool-btn ${rotation === 90 ? 'active' : ''}`} onClick={() => setRotation(r => r === 0 ? 90 : 0)}><RotateCw size={18} /></button></Tooltip>
              <Tooltip text="Partager / Sauvegarder" position="bottom"><button className="tool-btn share-btn" onClick={handleShare} disabled={isSharing}>{isSharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}</button></Tooltip>
              <Tooltip text="Plein écran" position="bottom"><button className="tool-btn" onClick={handleFullscreen}>{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}</button></Tooltip>
              <Tooltip text="Aide" position="bottom"><button className="tool-btn help-trigger-btn" onClick={() => setIsHelpOpen(true)}><HelpCircle size={18} /></button></Tooltip>
            </div>
          </div>
          <div style={{ flex: 1 }} />
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
      )}


      <Modal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Guide Tactique BB Scheme" hideFooter={true}>
        <div className="help-content">
          <section className="help-section">
            <h3>🖱️ Interactions</h3>
            <div className="help-grid">
              <div className="item"><strong>Déplacer</strong> : Cliquez sur un jeton (terrain/réserve) puis sur sa destination.</div>
              <div className="item"><strong>Ballon</strong> : Pour l'attacher, sélectionnez le ballon puis cliquez sur le joueur cible.</div>
              <div className="item"><strong>Sélection</strong> : Un clic droit (ou clic dans le vide) déselectionne l'outil ou le jeton.</div>
            </div>
          </section>
          <section className="help-section">
            <h3>🔹 Outils Principaux</h3>
            <div className="help-grid">
              <div className="item"><strong><MousePointer2 size={14} /> Sélecteur</strong> : Sélectionner et déplacer (Drag & Drop ou Clic-Clic).</div>
              <div className="item"><strong><Pencil size={14} /> Crayon</strong> : Tracer des flèches et annotations.</div>
              <div className="item"><strong>🏈 Ballon</strong> : Détache le ballon du porteur sélectionné.</div>
              <div className="item"><strong><Wand2 size={14} /> Baguette</strong> : Changer l'état (Couché, Sonné, etc.).</div>
              <div className="item"><strong><Eraser size={14} /> Gomme</strong> : Effacer tous les dessins.</div>
              <div className="item"><strong><Undo2 size={14} /> Annuler</strong> : Revenir en arrière sur le dernier mouvement.</div>
              <div className="item"><strong><Trash2 size={14} /> Vider</strong> : Réinitialiser tout le plateau.</div>
            </div>
          </section>

          <section className="help-section">
            <h3>⏱️ Séquences & Lecteur</h3>
            <div className="help-grid">
              <div className="item"><strong><Clock size={14} /> Vitesse</strong> : Délai entre deux images (en ms).</div>
              <div className="item"><strong><PlusCircle size={14} /> (+)</strong> : Ajouter une nouvelle image à la séquence.</div>
              <div className="item"><strong><Copy size={14} /> Dupliquer</strong> : Copier l'image actuelle (pratique pour les petits mouvements).</div>
              <div className="item"><strong><Download size={14} /> GIF</strong> : Exporter votre tactique en image animée.</div>
            </div>
          </section>

          <section className="help-section">
            <h3>⚙️ Options d'Affichage</h3>
            <div className="help-grid">
              <div className="item"><strong><Info size={14} /> Infos</strong> : Afficher/Masquer les bulles d'aide des joueurs.</div>
              <div className="item"><strong><RotateCw size={14} /> Rotation</strong> : Basculer le terrain (Horizontal / Vertical).</div>
              <div className="item"><strong><Share2 size={14} /> Partager</strong> : Générer un lien permanent pour cette tactique.</div>
            </div>
          </section>
        </div>
        <style jsx>{`
          .help-content { display: flex; flex-direction: column; gap: 1.2rem; max-height: 60vh; overflow-y: auto; padding-right: 10px; }
          .help-section { background: rgba(0, 65, 117, 0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(0, 65, 117, 0.1); }
          .help-section h3 { display: flex; align-items: center; gap: 0.5rem; color: var(--primary); margin-bottom: 0.8rem; font-size: 1rem; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 0.3rem; }
          .help-grid { display: grid; grid-template-columns: 1fr; gap: 0.6rem; }
          .item { font-size: 0.85rem; line-height: 1.4; color: #2d2016; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; }
          .item strong { color: var(--primary); display: flex; align-items: center; gap: 0.3rem; min-width: 90px; }
          .speed-control {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-left: 1rem;
            opacity: 0.8;
            background: var(--nav-btn-bg);
            padding: 4px 8px;
            border-radius: 8px;
            border: 1px solid var(--nav-btn-border);
            color: var(--nav-btn-color);
          }
          .speed-input {
            background: transparent;
            border: none;
            color: var(--nav-btn-color);
            font-size: 0.75rem;
            font-weight: 800;
            width: 45px;
            text-align: center;
            outline: none;
            font-family: inherit;
          }
        `}</style>
      </Modal>

      <Modal
        isOpen={isExporting}
        onClose={() => { if (exportProgress === 100) setIsExporting(false); }}
        title="Exportation GIF"
        hideFooter={true}
      >
        <div className="export-modal-content" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center", padding: "1rem" }}>
          {exportProgress < 100 ? (
            <div style={{ textAlign: "center", width: "100%" }}>
              <div className="loader-container" style={{ marginBottom: "1rem" }}>
                <Loader2 size={48} className="animate-spin" style={{ color: "var(--accent)", margin: "auto" }} />
              </div>
              <p style={{ fontWeight: 600 }}>Génération de votre séquence...</p>
              <div className="progress-bar-bg" style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", marginTop: "1rem", overflow: "hidden" }}>
                <div className="progress-bar-fill" style={{ width: `${exportProgress}%`, height: "100%", background: "var(--accent)", transition: "width 0.3s" }} />
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                {exportProgress < 50 ? "Capture des images..." : "Compilation du GIF..."}
              </p>
            </div>
          ) : (
            <div style={{ textAlign: "center", width: "100%" }}>
              <div style={{ background: "#000", borderRadius: "8px", overflow: "hidden", marginBottom: "1.5rem", border: "1px solid var(--glass-border)" }}>
                {generatedGif && <img src={generatedGif} alt="Export Result" style={{ maxWidth: "100%", display: "block" }} />}
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <CTAButton onClick={() => {
                  const link = document.createElement("a");
                  link.href = generatedGif!;
                  link.download = `bbscheme-${new Date().getTime()}.gif`;
                  link.click();
                }} icon={Download}>Télécharger</CTAButton>
                <ClassicButton onClick={() => setIsExporting(false)}>Fermer</ClassicButton>
              </div>
            </div>
          )}
        </div>
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

      <div className={`tool-layout ${isEmbed ? 'is-embed' : ''}`}>
        <div className="work-area">
          {!isEmbed && (
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
                rosterFile={blueRosterFile}
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
          )}

          <div
            ref={viewportRef}
            className={`pitch-viewport ${selectedId ? 'has-selection' : ''} ${isPanning ? 'panning' : ''} ${isEmbed ? 'read-only embed-player' : ''}`}
            onMouseDown={(e) => { if (!isEmbed) handlePanningStart(e); }}
            onMouseMove={(e) => { if (!isEmbed) handlePanningMove(e); }}
            onMouseUp={handlePanningEnd}
            onMouseLeave={handlePanningEnd}
          >
            <div ref={resizerRef} className="pitch-resizer" style={{
              width: `${(rotation === 90 ? 758 : 1308) * finalScale}px`,
              height: `${(rotation === 90 ? 1308 : 758) * finalScale}px`,
              margin: isEmbed ? 'auto' : '0'
            }}>
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
                  readOnly={isEmbed}
                />
              </div>
            </div>
          </div>

          {isEmbed && (
            <div className="embed-footer-bar">
              <div className="playback-group player-style">
                <button className="player-control-btn" onClick={() => setCurrentFrameIndex(prev => Math.max(0, prev - 1))} disabled={currentFrameIndex === 0 || isPlaying}><SkipBack size={18} /></button>
                <button className="player-play-btn" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
                <button className="player-control-btn" onClick={() => setCurrentFrameIndex(prev => Math.min(frames.length - 1, prev + 1))} disabled={currentFrameIndex === frames.length - 1 || isPlaying}><SkipForward size={18} /></button>

                <div className="player-progress">
                  <div className="player-progress-track">
                    <div className="player-progress-fill" style={{ width: `${((currentFrameIndex + 1) / frames.length) * 100}%` }} />
                  </div>
                  <span className="player-frame-text">{currentFrameIndex + 1} / {frames.length}</span>
                </div>

                <div className="player-speed-pill">
                  {playbackSpeed}ms
                </div>
              </div>
            </div>
          )}

          {!isEmbed && (
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
                rosterFile={redRosterFile}
                isLoading={isRedLoading}
                showTooltips={showTooltips}
                allTokens={tokens}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function BallIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C15.3137 2 18 6.47715 18 12C18 17.5228 15.3137 22 12 22C8.68629 22 6 17.5228 6 12C6 6.47715 8.68629 2 12 2Z" fill="currentColor" fillOpacity="0.2" /><path d="M12 2C15.3137 2 18 6.47715 18 12C18 17.5228 15.3137 22 12 22C8.68629 22 6 17.5228 6 12C6 6.47715 8.68629 2 12 2Z" stroke="currentColor" strokeWidth="2" /><path d="M6 12H18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" /><path d="M9 7H15M9 17H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
