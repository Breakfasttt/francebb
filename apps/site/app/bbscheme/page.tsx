"use client";

/**
 * BBScheme : plateau tactique de Blood Bowl (placer les joueurs, dessiner, animer image par image, partager).
 * L'habillage (barres d'outils, réserves, fenêtres) a été refait par la carte 100 avec les composants de packages/ui ;
 * la logique d'édition sur le terrain (déplacements, tracés, zoom, pincement à deux doigts) n'a pas changé.
 */

import BackButton from "@/common/components/BackButton/BackButton";
import {
  Clock,
  Copy,
  Download,
  Eraser,
  HelpCircle,
  Info,
  Loader2,
  LogOut,
  Maximize,
  Minimize,
  MoreHorizontal,
  MousePointer2,
  Pause,
  PenOff,
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
  X,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, ConfirmDialog, EmptyState, Input, Select, Sheet, SheetContent, cn, toast } from "@bbfrance/ui";
import { getBoardState, saveBoardState } from "./actions";
import {
  BBSchemePlayer,
  Pitch,
  type BoardFrame,
  type DrawingPath,
  type PlayerRosterInfo,
  type RosterData,
  type TokenData,
  type TokenLocation,
  type TokenStatus,
  type ToolType,
} from "@bbfrance/bbscheme-player";
import FigurineBox from "./component/FigurineBox";
import GifExportSheet from "./component/GifExportSheet";
import HelpSheet from "./component/HelpSheet";
import ToolButton from "./component/ToolButton";

import MobilePortal from "@/common/components/MobilePortal/MobilePortal";
import { useIsMobile } from "@/common/hooks/useIsMobile";
import { usePinchZoom } from "@/common/hooks/usePinchZoom";

// Règles du terrain (geste au doigt, pincement à deux doigts) : le reste de l'habillage est en classes Tailwind

interface HistoryState {
  tokens: TokenData[];
  drawings: DrawingPath[];
}

/** Bornes du zoom du terrain, communes au curseur, à la molette de la souris et au pincement à deux doigts. */
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;

export default function BBSchemePage() {
  const [tokens, setTokens] = useState<TokenData[]>([
    { id: 'ball-initial', type: 'ball', x: 13, y: 7, status: 'up', location: 'pitch' }
  ]);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(rotation);
  useEffect(() => { rotationRef.current = rotation; }, [rotation]);
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
  // Séquence & Lecteur
  const [frames, setFrames] = useState<BoardFrame[]>([{
    tokens: [{ id: 'ball-initial', type: 'ball', x: 13, y: 7, status: 'up', location: 'pitch' }],
    blueRosterFile: null,
    redRosterFile: null
  }]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(800); // ms per frame
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const searchParams = useSearchParams();
  const boardId = searchParams.get("id");
  const isEmbed = searchParams.get("embed") === "true";
  const isMobile = useIsMobile();

  const layout = searchParams.get("layout") || "horizontal";
  const [blueRoster, setBlueRoster] = useState<RosterData | null>(null);
  const [redRoster, setRedRoster] = useState<RosterData | null>(null);
  const [blueRosterFile, setBlueRosterFile] = useState<string>("");
  const [redRosterFile, setRedRosterFile] = useState<string>("");
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
  // Téléphone : réserve ouverte dans un panneau, et panneau « Plus d'outils »
  const [mobileActivePanel, setMobileActivePanel] = useState<'blue' | 'red' | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);

  // -- FIN DES HOOKS --

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

              // Collect ALL unique rosters from all frames
              const allBlueFiles = new Set<string>();
              if (parsed.blueRosterFile) allBlueFiles.add(parsed.blueRosterFile);
              const allRedFiles = new Set<string>();
              if (parsed.redRosterFile) allRedFiles.add(parsed.redRosterFile);

              parsed.frames.forEach((f: any) => {
                if (f.blueRosterFile) allBlueFiles.add(f.blueRosterFile);
                if (f.redRosterFile) allRedFiles.add(f.redRosterFile);
              });

              // Load all rosters and create pools
              const bluePools: Record<string, TokenData[]> = {};
              const redPools: Record<string, TokenData[]> = {};

              const loadPool = async (file: string, team: 'blue' | 'red') => {
                const res = await fetch(`/data/roster/${file}.json`).then(r => r.json()).catch(() => null);
                if (!res) return;
                const enriched = { ...res, roster: [...res.roster, genericStarInfo] };

                const pool = enriched.roster.flatMap((p: any) => {
                  const isStar = p.name === "Star Player";
                  const slug = isStar ? "star" : p.name.replace(/\s+/g, '-');
                  const q = p.qty || "2";
                  const limit = isStar ? 2 : (parseInt(q.includes('-') ? q.split('-').pop() : q) || 2);
                  return Array.from({ length: limit }).map((_, i) => ({
                    id: `${team}-${slug}-${i}`,
                    type: team as any, x: -1, y: -1, status: 'up' as any, location: 'box' as any,
                    number: isStar ? 99 + (i + 1) : i + 1,
                    playerInfo: { ...p, parentRoster: enriched } // Attach parent roster for re-hydration
                  }));
                });
                if (team === 'blue') bluePools[file] = pool; else redPools[file] = pool;
              };

              await Promise.all([
                ...Array.from(allBlueFiles).map(f => loadPool(f, 'blue')),
                ...Array.from(allRedFiles).map(f => loadPool(f, 'red'))
              ]);

              const ballBase: TokenData = { id: 'ball-initial', type: 'ball', x: 13, y: 7, status: 'up', location: 'pitch' };

              // Charger starPool pour enrichissement
              let starPool: PlayerRosterInfo[] = [];
              try {
                const resp = await fetch('/data/roster/all_star_players.json');
                const starData = await resp.json();
                starPool = starData.roster;
              } catch (e) { }

              // 2. FUSION DÉTERMINISTE (Stable & Robuste)
              const firstFrameRosters = (parsed.frames[0] as any).tokens ? false : true;

              const hydratedFrames = (parsed.frames as any[]).map((f: any) => {
                const savedTokens = firstFrameRosters ? f : f.tokens;
                const bFile = firstFrameRosters ? parsed.blueRosterFile : f.blueRosterFile;
                const rFile = firstFrameRosters ? parsed.redRosterFile : f.redRosterFile;

                const bPool = bFile ? bluePools[bFile] || [] : [];
                const rPool = rFile ? redPools[rFile] || [] : [];

                // On repart du pool complet spécifique à CETTE frame
                const currentFrameTokens = [...bPool.map(t => ({ ...t })), ...rPool.map(t => ({ ...t })), { ...ballBase }];

                savedTokens.forEach((s: any) => {
                  const idx = currentFrameTokens.findIndex(t => t.id === s.id);
                  if (idx !== -1) {
                    const base = currentFrameTokens[idx];
                    currentFrameTokens[idx] = { ...base, ...s };

                    // RESTAURATION CRITIQUE DU STAR PLAYER
                    if (base.playerInfo?.name === "Star Player" && s.starName) {
                      const details = starPool.find(sd => sd.name === s.starName);
                      if (details) currentFrameTokens[idx].playerInfo = details;
                    }
                  } else if (s.type === 'ball') {
                    const ballIdx = currentFrameTokens.findIndex(t => t.type === 'ball');
                    if (ballIdx !== -1) currentFrameTokens[ballIdx] = { ...currentFrameTokens[ballIdx], ...s };
                  }
                });

                return {
                  tokens: currentFrameTokens,
                  blueRosterFile: firstFrameRosters ? parsed.blueRosterFile : f.blueRosterFile,
                  redRosterFile: firstFrameRosters ? parsed.redRosterFile : f.redRosterFile
                };
              });

              if (hydratedFrames.length > 0) {
                setFrames(hydratedFrames);
                const firstFrame = hydratedFrames[0];
                setTokens([...firstFrame.tokens]);

                // On pré-charge les rosters globaux pour l'UI à partir de la première frame
                if (firstFrame.blueRosterFile) {
                  // handleRosterSelect s'occupera d'enrichir l'UI
                  handleRosterSelect('blue', firstFrame.blueRosterFile, false, true);
                } else {
                  setBlueRoster(null);
                  setBlueRosterFile("");
                }

                if (firstFrame.redRosterFile) {
                  handleRosterSelect('red', firstFrame.redRosterFile, false, true);
                } else {
                  setRedRoster(null);
                  setRedRosterFile("");
                }
              }
              if (parsed.drawings) setDrawings(parsed.drawings);
              if (parsed.rotation !== undefined) setRotation(parsed.rotation);
              if (parsed.speed !== undefined) setPlaybackSpeed(parsed.speed);

              // On force la fin du loading avant le déclenchement des effets
              setLoading(false);
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
    const hasInfo = firstFrame.tokens.some(t => t.playerInfo);

    if (!hasInfo && (blueRoster || redRoster)) {
      // On redéclenche une hydratation silencieuse pour enrichir les frames existantes
      setFrames(prevFrames => prevFrames.map(f => {
        return {
          ...f,
          tokens: f.tokens.map(t => {
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
          })
        };
      }));
    }
  }, [blueRoster, redRoster, loading]);

  // Synchronisation initiale de rotation
  useEffect(() => {
    // Priorité absolue au mobile (toujours vertical)
    if (isMobile && !isEmbed) {
      setRotation(90);
    } else {
      // Sinon on suit le paramètre layout seulement s'il est présent
      if (layout === "vertical") setRotation(90);
      else if (layout === "horizontal") setRotation(0);
    }
  }, [layout, isMobile, isEmbed]); // rotation retiré pour permettre le changement manuel

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
  const isInitialSyncRef = useRef(true);

  // Synchronisation unifiée Frames / Tokens / Rosters
  useEffect(() => {
    // CAS 1: Changement d'image OU chargement initial
    if (lastIndexRef.current !== currentFrameIndex || isInitialSyncRef.current) {
      const targetFrame = frames[currentFrameIndex];
      if (targetFrame) {
        setTokens(targetFrame.tokens);
        setSelectedId(null);

        // Synchronisation des rosters de la frame vers le global UI (avec normalisation strict)
        const frameBlue = targetFrame.blueRosterFile || "";
        const frameRed = targetFrame.redRosterFile || "";

        if (frameBlue !== blueRosterFile) {
          if (frameBlue) {
            handleRosterSelect('blue', frameBlue, false, true);
          } else {
            setBlueRoster(null);
            setBlueRosterFile("");
          }
        }
        if (frameRed !== redRosterFile) {
          if (frameRed) {
            handleRosterSelect('red', frameRed, false, true);
          } else {
            setRedRoster(null);
            setRedRosterFile("");
          }
        }
      }
      lastIndexRef.current = currentFrameIndex;
      if (!loading && frames.length > 0) isInitialSyncRef.current = false;
      return;
    }

    // CAS 2: Lecture (Playback)
    if (isPlaying) {
      const playbackFrame = frames[currentFrameIndex];
      if (playbackFrame && tokens !== playbackFrame.tokens) {
        setTokens(playbackFrame.tokens);
        // On ne recharge pas les rosters lourds en plein milieu d'une lecture fluide
      }
      return;
    }

    // CAS 3: Autosave du buffer vers la frame (Tokens uniquement)
    if (frames[currentFrameIndex]?.tokens !== tokens) {
      setFrames(prev => {
        if (prev[currentFrameIndex]?.tokens === tokens) return prev;
        const next = [...prev];
        next[currentFrameIndex] = {
          ...next[currentFrameIndex],
          tokens
        };
        return next;
      });
    }
  }, [currentFrameIndex, tokens, frames, isPlaying, blueRosterFile, redRosterFile]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      if (isEmbed) return; // Désactiver zoom en embed
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom(prev => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prev + delta)));
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
    };
  }, [isEmbed]);

  // Pincement à deux doigts sur le terrain (téléphone) : même valeur et mêmes bornes que le curseur de zoom.
  usePinchZoom(viewportRef, { zoom, min: ZOOM_MIN, max: ZOOM_MAX, onZoomChange: setZoom, enabled: !isEmbed });

  // Panning UI
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const handlePanningStart = (e: React.MouseEvent) => {
    if (activeTool !== 'select' || !viewportRef.current) return;
    // Ne pas démarrer le pan si on clique sur un bouton ou une interface directe
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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeTool !== 'select' || !viewportRef.current) return;
    if ((e.target as HTMLElement).closest('button')) return;
    // Deux doigts : c'est un pincement (usePinchZoom), pas un défilement.
    if (e.touches.length > 1) { setIsPanning(false); return; }

    const touch = e.touches[0];
    setIsPanning(true);
    setPanStart({
      x: touch.clientX,
      y: touch.clientY,
      scrollLeft: viewportRef.current.scrollLeft,
      scrollTop: viewportRef.current.scrollTop
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || !viewportRef.current || e.touches.length > 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - panStart.x;
    const dy = touch.clientY - panStart.y;
    viewportRef.current.scrollLeft = panStart.scrollLeft - dx;
    viewportRef.current.scrollTop = panStart.scrollTop - dy;
  };

  // -- History management --
  const saveToHistory = useCallback((currentTokens: TokenData[], currentDrawings: DrawingPath[]) => {
    setHistory(prev => [{ tokens: [...currentTokens.map(t => ({ ...t }))], drawings: [...currentDrawings.map(d => ({ ...d }))] }, ...prev.slice(0, 19)]);
  }, []);

  // -- Scaling Logic --
  const handleResize = useCallback(() => {
    if (!resizerRef.current) return;
    const viewport = resizerRef.current.closest('.pitch-viewport');
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const padding = isMobile ? 4 : 30; // Moins de padding sur mobile pour prendre toute la largeur
    const availableWidth = rect.width - padding;
    const availableHeight = rect.height - padding;

    const currentRot = rotationRef.current;
    const pitchW = currentRot === 90 ? 758 : 1308;
    const pitchH = currentRot === 90 ? 1308 : 758;

    // Force contain behavior to avoid overflow in either direction
    const newScale = Math.min(availableWidth / pitchW, availableHeight / pitchH, 1.1);

    if (Math.abs(baseScale - newScale) > 0.005) {
      setBaseScale(newScale);
    }
  }, [isMobile, baseScale]);

  const handleResizeRef = useRef(handleResize);
  useEffect(() => { handleResizeRef.current = handleResize; }, [handleResize]);


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
      "amazons": "Amazones", "black_orcs": "Orques Noirs", "bretonnians": "Bretonniens",
      "chaos_chosen": "Élus du Chaos", "chaos_dwarfs": "Nains du Chaos", "chaos_renegades": "Renégats du Chaos",
      "dark_elves": "Elfes Noirs", "dwarves": "Nains", "elven_union": "Union Elfique",
      "gnomes": "Gnomes", "goblins": "Gobelins", "halflings": "Halfelins",
      "high_elves": "Hauts Elfes", "humans": "Humains", "imperial_nobility": "Noblesse Impériale",
      "khorne": "Élus de Khorne", "lizardmen": "Hommes-Lézards", "necromantic_horror": "Horreur Nécromantique",
      "norse": "Nordiques", "nurgle": "Élus de Nurgle", "ogres": "Ogres",
      "old_world_alliance": "Alliance du Vieux Monde", "orcs": "Orques", "shambling_undead": "Morts-Vivants",
      "skaven": "Skavens", "slann_(naf)": "Slanns (NAF)", "snotlings": "Snotlings",
      "tomb_kings": "Rois des Tombes", "underworld_denizens": "Habitants des Bas-Fonds",
      "vampires": "Vampires", "wood_elves": "Elfes Sylvains", "all_star_players": "Star Players"
    };

    setRosters(rosterList.map(r => ({
      name: translationMap[r] || r.replace(/_/g, ' ').toUpperCase(),
      file: r
    })).sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  useEffect(() => {
    const triggerResize = () => handleResizeRef.current();
    triggerResize();
    const timer = setTimeout(triggerResize, 100);
    window.addEventListener('resize', triggerResize);
    return () => { window.removeEventListener('resize', triggerResize); clearTimeout(timer); };
  }, [isFullscreen, rotation]); // handleResize retiré des dépendances

  const finalScale = baseScale * zoom;

  // -- FIN DES HOOKS --

  // Mode embed (plateau affiché dans une iframe, par exemple dans un article d'un autre site) : le lecteur seul, posé
  // par-dessus la coquille du site (barres de navigation) qui n'a pas sa place dans un cadre intégré. Sa largeur est
  // limitée pour que le terrain (environ 1,7 fois plus large que haut) et ses commandes tiennent dans la hauteur du cadre.
  if (isEmbed) {
    return (
      <div className="fixed inset-0 z-[5001] overflow-auto bg-bb-bg">
        {boardId ? (
          <div className="mx-auto w-full max-w-[calc((100dvh-7rem)*1.72)] px-2">
            <BBSchemePlayer boardId={boardId} loadBoard={getBoardState} />
          </div>
        ) : (
          <EmptyState title="Aucun plateau à afficher">L&apos;adresse doit indiquer le plateau à lire avec le paramètre ?id=.</EmptyState>
        )}
      </div>
    );
  }

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


  const spawnRosterTokens = (team: 'blue' | 'red', roster: RosterData, fileName: string) => {
    // 1. Create the new team pool (all in box)
    const newTeamBase: TokenData[] = [];
    const starPlayerInfo: PlayerRosterInfo = {
      name: "Star Player", qty: "0-2",
      ma: "?", st: "?", ag: "?", pa: "?", av: "?",
      skills: ["Compétences variables"], primary: "", secondary: "", cost: 0
    };
    // Éviter les doublons si déjà présent dans le roster
    const rosterWithStars = roster.roster.some(p => p.name === "Star Player")
      ? roster.roster
      : [...roster.roster, starPlayerInfo];

    rosterWithStars.forEach(player => {
      let qty = 16;
      if (player.qty.includes('-')) qty = parseInt(player.qty.split('-').pop() || "16");
      else if (!isNaN(parseInt(player.qty))) qty = parseInt(player.qty);
      const isStar = player.name === "Star Player";
      const slug = isStar ? "star" : player.name.replace(/\s+/g, '-');
      const limit = isStar ? 2 : qty;

      for (let i = 0; i < limit; i++) {
        newTeamBase.push({
          id: `${team}-${slug}-${i}`,
          type: team, x: -1, y: -1, status: 'up', location: 'box',
          number: isStar ? 99 + (i + 1) : i + 1,
          playerInfo: player
        });
      }
    });

    // 2. Function to clear team tokens and detach ball
    const applyRosterClean = (currentTokens: TokenData[]) => {
      const otherStuff = currentTokens.filter(t => t.type !== team && t.type !== 'ball');
      let ball = currentTokens.find(t => t.type === 'ball');

      // Detach ball systematically
      if (ball) {
        ball = { ...ball, attachedToId: undefined };
      }

      // New base is already fresh in 'box'
      const newBase = newTeamBase.map(t => ({ ...t }));
      return [...otherStuff, ...newBase, ...(ball ? [ball] : [])];
    };

    // 3. Update Current Frame and Buffer
    // We only update the current frame to keep other frames independent as requested
    const updatedTokens = applyRosterClean(tokens);
    setTokens(updatedTokens);

    setFrames(fPrev => {
      const fNext = [...fPrev];
      fNext[currentFrameIndex] = {
        ...fNext[currentFrameIndex],
        tokens: updatedTokens,
        blueRosterFile: team === 'blue' ? fileName : fNext[currentFrameIndex].blueRosterFile,
        redRosterFile: team === 'red' ? fileName : fNext[currentFrameIndex].redRosterFile
      };
      return fNext;
    });
  };

  const handleRosterSelect = async (team: 'blue' | 'red', fileName: string, updateCurrentFrame = true, isSync = false) => {
    if (!fileName) {
      if (team === 'blue') {
        setBlueRoster(null);
        setBlueRosterFile("");
      } else {
        setRedRoster(null);
        setRedRosterFile("");
      }

      if (updateCurrentFrame) {
        const cleanup = (ts: TokenData[]) => ts.filter(t => t.type !== team);
        setTokens(prev => cleanup(prev));
        setFrames(fPrev => {
          const fNext = [...fPrev];
          fNext[currentFrameIndex] = {
            ...fNext[currentFrameIndex],
            tokens: cleanup(fNext[currentFrameIndex].tokens),
            blueRosterFile: team === 'blue' ? "" : fNext[currentFrameIndex].blueRosterFile,
            redRosterFile: team === 'red' ? "" : fNext[currentFrameIndex].redRosterFile
          };
          return fNext;
        });
      }
      return;
    }
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

      // Si on est en mode Sync (changement d'image), on ne ré-injecte pas les jetons (ce qui viderait le terrain)
      if (!isSync) {
        spawnRosterTokens(team, enrichedData, fileName);
        toast.success(`Roster ${data.name} chargé pour l'équipe ${team === 'blue' ? 'bleue' : 'rouge'}`);
      }
    } catch (e) {
      toast.error("Échec du chargement du roster");
    } finally {
      if (team === 'blue') setIsBlueLoading(false); else setIsRedLoading(false);
    }
  };


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
    const optimizedFrames = frames.map(frame => ({
      ...frame,
      tokens: frame.tokens.filter(t => t.type === 'ball' || t.location !== 'box').map(token => {
        const { playerInfo, ...stripped } = token;
        const starName = (token.playerInfo && token.playerInfo.name !== "Star Player" &&
          (token.id.includes('-star-') || token.playerInfo.qty === "0-2"))
          ? token.playerInfo.name : undefined;
        return { ...stripped, starName };
      })
    }));

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
    if (frames.length >= 50) {
      toast.error("Limite de 50 images atteinte");
      return;
    }
    const newFrame: BoardFrame = {
      tokens: [...tokens.map(t => ({ ...t }))],
      blueRosterFile,
      redRosterFile
    };
    setFrames(prev => [...prev, newFrame]);
    setCurrentFrameIndex(frames.length);
    toast.success("Image ajoutée");
  };

  const duplicateFrame = () => {
    if (frames.length >= 50) {
      toast.error("Limite de 50 images atteinte");
      return;
    }
    const newFrame: BoardFrame = {
      tokens: [...tokens.map(t => ({ ...t }))],
      blueRosterFile,
      redRosterFile
    };
    setFrames(prev => {
      const next = [...prev];
      next.splice(currentFrameIndex + 1, 0, newFrame);
      return next;
    });
    setCurrentFrameIndex(currentFrameIndex + 1);
    toast.success("Image dupliquée");
  };

  const handleReturnToReserve = () => {
    if (!selectedId) return;
    saveToHistory(tokens, drawings);
    setTokens(prev => prev.map(t => t.id === selectedId ? { ...t, location: 'box' } : t));
    setSelectedId(null);
    toast.success("Joueur remis en réserve");
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
      // Librairies d'export chargées à la demande (hors du JS initial de la page)
      const [{ default: html2canvas }, { default: gifshot }] = await Promise.all([import("html2canvas"), import("gifshot")]);

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
            // Fond de l'image : la couleur de fond du thème choisi (variable --bb-bg), comme à l'écran (carte 146)
            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--bb-bg").trim() || null,
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
  const isBallSelected = selectedToken?.type === 'ball';
  const isLastFrame = currentFrameIndex === frames.length - 1;

  // -- Habillage de l'éditeur (carte 100, ADR 0006) --
  // Ordinateur : barre d'outils en haut, une réserve de chaque côté du terrain, barre de l'animation en bas.
  // Téléphone : barre compacte des outils principaux en haut (le reste dans le panneau « Plus d'outils »), le terrain
  // au milieu, et en bas les réserves (panneaux qui montent du bas) et la lecture de l'animation.
  const goToPreviousFrame = () => setCurrentFrameIndex(prev => Math.max(0, prev - 1));
  const goToNextFrame = () => {
    if (isLastFrame) addFrame();
    else setCurrentFrameIndex(prev => prev + 1);
  };
  const clearDrawings = () => {
    saveToHistory(tokens, drawings);
    setDrawings([]);
    toast.success("Dessins effacés");
  };
  /** Une commande du panneau « Plus d'outils » referme d'abord le panneau, pour laisser voir le résultat. */
  const fromTools = (action: () => void) => () => {
    setToolsOpen(false);
    action();
  };
  /** Sur téléphone, choisir un pion dans une réserve referme le panneau : on touche ensuite la case du terrain. */
  const pickFromReserve = (tokenId: string) => {
    handleTokenClick(tokenId);
    setMobileActivePanel(null);
  };
  const putBackInReserve = (team: 'blue' | 'red') => {
    handleBoxClick(team);
    setMobileActivePanel(null);
  };

  const frameCounter = (
    <span className="min-w-12 shrink-0 text-center text-sm font-bold tabular-nums text-bb-text" aria-live="polite">
      {currentFrameIndex + 1} / {frames.length}
    </span>
  );
  const playButton = (
    <ToolButton
      label={isPlaying ? "Pause" : "Lecture"}
      icon={isPlaying ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
      onClick={() => setIsPlaying(!isPlaying)}
      className="bg-bb-accent text-bb-on-accent hover:bg-bb-accent-hover hover:text-bb-on-accent"
    />
  );
  const previousButton = (
    <ToolButton label="Image précédente" icon={<SkipBack size={18} aria-hidden="true" />} onClick={goToPreviousFrame} disabled={currentFrameIndex === 0 || isPlaying} />
  );
  const nextButton = (
    <ToolButton
      label={isLastFrame ? "Ajouter une image" : "Image suivante"}
      icon={isLastFrame ? <PlusCircle size={18} aria-hidden="true" /> : <SkipForward size={18} aria-hidden="true" />}
      onClick={goToNextFrame}
      disabled={isPlaying}
    />
  );
  const zoomSlider = (id: string) => (
    <input
      id={id}
      type="range"
      aria-label="Zoom du terrain"
      min={ZOOM_MIN}
      max={ZOOM_MAX}
      step="0.05"
      value={zoom}
      onChange={(e) => setZoom(parseFloat(e.target.value))}
      className="h-11 w-full cursor-pointer accent-bb-accent lg:h-10 lg:w-24"
    />
  );
  const speedInput = (id: string) => (
    <Input
      id={id}
      type="number"
      aria-label="Vitesse de lecture (millisecondes)"
      value={playbackSpeed}
      onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
      min={100}
      max={3000}
      step={100}
      className="w-24 text-center lg:min-h-10"
    />
  );
  const starSelect = (id: string) => (
    <Select
      id={id}
      aria-label="Star Player choisi"
      value={selectedToken?.playerInfo?.name === "Star Player" ? "aucun" : selectedToken?.playerInfo?.name || "aucun"}
      onChange={(e) => handleStarPlayerSelect(e.target.value)}
      className="lg:min-h-10 lg:w-56"
    >
      <option value="aucun">Star Player à choisir</option>
      {allStarPlayers.map((star, idx) => (
        <option key={`star-opt-${idx}`} value={star.name}>
          {star.name} ({star.cost / 1000}k)
        </option>
      ))}
    </Select>
  );
  const selectedName = selectedToken
    ? selectedToken.type === 'ball' ? "le ballon" : `${selectedToken.playerInfo?.name ?? "joueur"} n° ${selectedToken.number ?? ""}`.trim()
    : null;

  const reserveProps = (team: 'blue' | 'red') => ({
    team,
    roster: (team === 'blue' ? blueRoster : redRoster)?.roster || [],
    tokens: tokens.filter(t => t.type === team && t.location === 'box'),
    rosterList: rosters,
    onRosterSelect: (file: string) => handleRosterSelect(team, file),
    selectedId,
    rosterFile: team === 'blue' ? blueRosterFile : redRosterFile,
    isLoading: team === 'blue' ? isBlueLoading : isRedLoading,
    showTooltips,
    allTokens: tokens,
  });

  return (
    <div
      className={cn(
        // L'éditeur occupe tout l'espace entre la barre haute du site (57 pixels sur téléphone, 65 sur ordinateur) et,
        // sur ordinateur, le pied de page fixé en bas (40 pixels). En plein écran, il couvre tout l'écran.
        "fixed inset-x-0 bottom-0 flex flex-col bg-bb-bg font-bb-sans text-bb-text",
        isFullscreen ? "top-0 z-[5001]" : "top-[57px] z-[500] lg:top-[65px] lg:bottom-10"
      )}
      onContextMenu={(e) => { e.preventDefault(); setSelectedId(null); }}
    >
      {/* Téléphone : le bouton retour va dans la barre haute du site */}
      {isMobile && (
        <MobilePortal targetId="mobile-back-button-slot">
          <BackButton href="/" title="Retour à l'accueil" style={{ width: 44, height: 44 }} />
        </MobilePortal>
      )}

      {/* ===== Ordinateur : barre d'outils ===== */}
      <header className="hidden shrink-0 items-center gap-2 border-b border-bb-border bg-bb-surface px-3 py-1.5 lg:flex">
        <BackButton href="/" title="Retour à l'accueil" style={{ width: 44, height: 44 }} />
        <h1 className="m-0 border-0 p-0 text-lg font-bold whitespace-nowrap text-bb-text normal-case not-italic">BBScheme</h1>
        <span aria-hidden="true" className="mx-1 h-6 w-px bg-bb-border" />
        <div role="toolbar" aria-label="Outils" className="flex items-center gap-1">
          <ToolButton label="Sélection" icon={<MousePointer2 size={18} aria-hidden="true" />} active={activeTool === 'select'} onClick={() => setActiveTool('select')} />
          <ToolButton label="Crayon" icon={<Pencil size={18} aria-hidden="true" />} active={activeTool === 'draw'} onClick={() => setActiveTool('draw')} />
          <ToolButton label="État du joueur" icon={<Wand2 size={18} aria-hidden="true" />} active={activeTool === 'status'} onClick={() => setActiveTool('status')} />
          <ToolButton label="Gomme" icon={<Eraser size={18} aria-hidden="true" />} active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} />
          <ToolButton label="Lâcher le ballon" icon={<BallIcon size={18} />} onClick={handleDetachBall} disabled={!ballItem?.attachedToId} />
          <ToolButton label="Effacer les dessins" icon={<PenOff size={18} aria-hidden="true" />} onClick={clearDrawings} disabled={drawings.length === 0} />
          <ToolButton label="Annuler la dernière action" icon={<Undo2 size={18} aria-hidden="true" />} onClick={handleUndo} disabled={history.length === 0} />
          <ToolButton label="Tout vider" icon={<Trash2 size={18} aria-hidden="true" />} onClick={() => setIsClearModalOpen(true)} danger />
        </div>
        <div className="flex-1" />
        <div role="toolbar" aria-label="Affichage" className="flex items-center gap-1">
          <ZoomOut size={16} aria-hidden="true" className="text-bb-text-muted" />
          {zoomSlider("bbscheme-zoom-desktop")}
          <ZoomIn size={16} aria-hidden="true" className="mr-1 text-bb-text-muted" />
          <ToolButton label="Tourner le terrain" icon={<RotateCw size={18} aria-hidden="true" />} active={rotation === 90} onClick={() => setRotation(r => r === 0 ? 90 : 0)} />
          <ToolButton label="Afficher les infos des joueurs" icon={<Info size={18} aria-hidden="true" />} active={showTooltips} onClick={() => setShowTooltips(!showTooltips)} />
          <ToolButton label={isFullscreen ? "Quitter le plein écran" : "Plein écran"} icon={isFullscreen ? <Minimize size={18} aria-hidden="true" /> : <Maximize size={18} aria-hidden="true" />} onClick={handleFullscreen} />
          <ToolButton label="Aide" icon={<HelpCircle size={18} aria-hidden="true" />} onClick={() => setIsHelpOpen(true)} />
        </div>
        <Button type="button" variant="primary" size="tap" className="lg:min-h-10" onClick={handleShare} disabled={isSharing}>
          {isSharing ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}
          Partager
        </Button>
      </header>

      {/* ===== Téléphone : barre compacte des outils principaux ===== */}
      <div role="toolbar" aria-label="Outils" className="flex h-[52px] shrink-0 items-center gap-1 border-b border-bb-border bg-bb-surface px-2 lg:hidden">
        <ToolButton label="Sélection" icon={<MousePointer2 size={20} aria-hidden="true" />} active={activeTool === 'select'} onClick={() => setActiveTool('select')} />
        <ToolButton label="Crayon" icon={<Pencil size={20} aria-hidden="true" />} active={activeTool === 'draw'} onClick={() => setActiveTool('draw')} />
        <ToolButton label="État du joueur" icon={<Wand2 size={20} aria-hidden="true" />} active={activeTool === 'status'} onClick={() => setActiveTool('status')} />
        <ToolButton label="Gomme" icon={<Eraser size={20} aria-hidden="true" />} active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} />
        <ToolButton label="Annuler la dernière action" icon={<Undo2 size={20} aria-hidden="true" />} onClick={handleUndo} disabled={history.length === 0} />
        <div className="flex-1" />
        <ToolButton label="Plus d'outils" icon={<MoreHorizontal size={22} aria-hidden="true" />} onClick={() => setToolsOpen(true)} />
      </div>

      {/* ===== Terrain et réserves ===== */}
      <div className="flex min-h-0 flex-1 gap-3 lg:p-3">
        <FigurineBox {...reserveProps('blue')} onTokenClick={handleTokenClick} onBoxClick={() => handleBoxClick('blue')} className="hidden w-[280px] shrink-0 lg:flex" />

        <div className="relative flex min-h-0 min-w-0 flex-1">
          <div
            ref={viewportRef}
            role="region"
            aria-label="Terrain"
            aria-busy={loading || undefined}
            className={cn(
              // Classe pitch-viewport : repère de handleResize (ajuster le terrain à la place disponible) et des tests.
              // Gestes : au doigt, le terrain défile mais le navigateur ne zoome pas la page (touch-pan) ; le pincement à
              // deux doigts règle le zoom du terrain (hook usePinchZoom). Ne pas retirer sans vérifier le test
              // tests/e2e/bbscheme-pinch.spec.ts.
              "pitch-viewport relative min-h-0 min-w-0 flex-1 cursor-grab touch-pan-x touch-pan-y overflow-auto bg-bb-surface-2",
              "max-lg:flex max-lg:items-start max-lg:justify-center lg:grid lg:place-items-center lg:rounded-bb-lg lg:border lg:border-bb-border",
              // Un pion est choisi : le pointeur indique qu'on vise une case
              selectedId && "has-selection cursor-crosshair",
              // Déplacement du terrain à la souris ou au doigt (handlePanningStart)
              isPanning && "panning cursor-grabbing select-none"
            )}
            onMouseDown={handlePanningStart}
            onMouseMove={handlePanningMove}
            onMouseUp={handlePanningEnd}
            onMouseLeave={handlePanningEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handlePanningEnd}
          >
            <div ref={resizerRef} role="group" aria-label="Plateau" className="pitch-resizer relative flex items-center justify-center transition-[width,height] duration-600 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] [.pinching_&]:transition-none!" style={{
              width: `${(rotation === 90 ? 758 : 1308) * finalScale}px`,
              height: `${(rotation === 90 ? 1308 : 758) * finalScale}px`,
              margin: '0'
            }}>
              <div className="pitch-rotator [.pinching_&]:transition-none!" style={{ transform: `scale(${finalScale}) rotate(${rotation}deg)`, transformOrigin: 'center center', transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
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
                  readOnly={false}
                />
              </div>
            </div>
          </div>

          {/* Chargement d'un plateau partagé (?id=) : indicateur propre à BBScheme, posé sur le terrain */}
          {loading && (
            <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bb-bg/80 text-bb-text">
              <Loader2 size={36} className="animate-spin text-bb-accent-text" aria-hidden="true" />
              <p className="m-0 font-semibold">Chargement du plateau…</p>
            </div>
          )}
        </div>

        <FigurineBox {...reserveProps('red')} onTokenClick={handleTokenClick} onBoxClick={() => handleBoxClick('red')} className="hidden w-[280px] shrink-0 lg:flex" />
      </div>

      {/* ===== Ordinateur : barre de l'animation et du pion choisi ===== */}
      <div className="hidden shrink-0 items-center gap-2 border-t border-bb-border bg-bb-surface px-3 py-1.5 lg:flex">
        <div role="toolbar" aria-label="Animation" className="flex items-center gap-1">
          {previousButton}
          {playButton}
          {frameCounter}
          {nextButton}
          <span aria-hidden="true" className="mx-1 h-6 w-px bg-bb-border" />
          <ToolButton label="Dupliquer l'image" icon={<Copy size={18} aria-hidden="true" />} onClick={duplicateFrame} disabled={isPlaying} />
          <ToolButton label="Supprimer l'image" icon={<Trash2 size={18} aria-hidden="true" />} onClick={removeFrame} disabled={isPlaying || frames.length <= 1} />
          <label htmlFor="bbscheme-speed-desktop" className="ml-2 flex items-center gap-1.5 text-sm text-bb-text-muted">
            <Clock size={16} aria-hidden="true" /> Vitesse
          </label>
          {speedInput("bbscheme-speed-desktop")}
          <span className="text-sm text-bb-text-muted">ms</span>
          <Button type="button" variant="secondary" size="tap" aria-label="Exporter en GIF" className="ml-2 lg:min-h-10" onClick={handleGifExport} disabled={isPlaying || isExporting}>
            <Download size={18} aria-hidden="true" /> {isExporting ? `${exportProgress} %` : "GIF"}
          </Button>
        </div>
        <div className="flex-1" />
        {selectedName && (
          <div role="group" aria-label="Pion choisi" className="flex min-w-0 items-center gap-1">
            <span className="truncate text-sm text-bb-text-muted">Choisi : <strong className="text-bb-text">{selectedName}</strong></span>
            {isStarPlayerSelected && starSelect("bbscheme-star-desktop")}
            <ToolButton label="Remettre en réserve" icon={<LogOut size={18} aria-hidden="true" />} onClick={handleReturnToReserve} disabled={isBallSelected} />
            <ToolButton label="Désélectionner" icon={<X size={18} aria-hidden="true" />} onClick={() => setSelectedId(null)} />
          </div>
        )}
      </div>

      {/* ===== Téléphone : réserves et lecture de l'animation, à portée de pouce ===== */}
      <div data-page-bottom-bar="always" className="flex shrink-0 items-center gap-1 border-t border-bb-border bg-bb-surface px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] lg:hidden">
        <Button type="button" variant="secondary" size="tap" aria-label="Réserve bleue" className="min-w-0 flex-1 gap-1.5 px-2" onClick={() => setMobileActivePanel('blue')}>
          <span aria-hidden="true" className="size-3 shrink-0 rounded-full bg-blue-500" /> Bleue
        </Button>
        {previousButton}
        {playButton}
        {frameCounter}
        {nextButton}
        <Button type="button" variant="secondary" size="tap" aria-label="Réserve rouge" className="min-w-0 flex-1 gap-1.5 px-2" onClick={() => setMobileActivePanel('red')}>
          <span aria-hidden="true" className="size-3 shrink-0 rounded-full bg-red-500" /> Rouge
        </Button>
      </div>

      {/* Téléphone : réserves dans un panneau qui monte du bas */}
      {(['blue', 'red'] as const).map(team => (
        <Sheet key={team} open={mobileActivePanel === team} onOpenChange={(open) => { if (!open) setMobileActivePanel(null); }}>
          <SheetContent title={team === 'blue' ? "Réserve bleue" : "Réserve rouge"} description="Touchez un pion, puis la case du terrain où le placer.">
            <FigurineBox
              {...reserveProps(team)}
              onTokenClick={pickFromReserve}
              onBoxClick={() => putBackInReserve(team)}
              hideTitle
              className="mb-2"
            />
          </SheetContent>
        </Sheet>
      ))}

      {/* Téléphone : panneau « Plus d'outils » */}
      <Sheet open={toolsOpen} onOpenChange={setToolsOpen}>
        <SheetContent title="Outils">
          <ToolsSection title={selectedName ? `Pion choisi : ${selectedName}` : "Pion choisi : aucun"}>
            {isStarPlayerSelected && <div className="min-[400px]:col-span-2">{starSelect("bbscheme-star-mobile")}</div>}
            <ToolsRow label="Remettre en réserve" icon={<LogOut size={18} aria-hidden="true" />} onClick={fromTools(handleReturnToReserve)} disabled={!selectedId || isBallSelected} />
            <ToolsRow label="Désélectionner" icon={<X size={18} aria-hidden="true" />} onClick={fromTools(() => setSelectedId(null))} disabled={!selectedId} />
          </ToolsSection>
          <ToolsSection title="Terrain">
            <label htmlFor="bbscheme-zoom-mobile" className="flex items-center gap-2 text-sm font-semibold min-[400px]:col-span-2">
              <ZoomIn size={18} aria-hidden="true" className="shrink-0 text-bb-text-muted" /> Zoom
              {zoomSlider("bbscheme-zoom-mobile")}
            </label>
            <ToolsRow label="Lâcher le ballon" icon={<BallIcon size={18} />} onClick={fromTools(handleDetachBall)} disabled={!ballItem?.attachedToId} />
            <ToolsRow label="Effacer les dessins" icon={<PenOff size={18} aria-hidden="true" />} onClick={fromTools(clearDrawings)} disabled={drawings.length === 0} />
            <ToolsRow label="Afficher les infos des joueurs" icon={<Info size={18} aria-hidden="true" />} pressed={showTooltips} onClick={fromTools(() => setShowTooltips(!showTooltips))} />
            <ToolsRow label="Tourner le terrain" icon={<RotateCw size={18} aria-hidden="true" />} pressed={rotation === 90} onClick={fromTools(() => setRotation(r => r === 0 ? 90 : 0))} />
            <ToolsRow label={isFullscreen ? "Quitter le plein écran" : "Plein écran"} icon={isFullscreen ? <Minimize size={18} aria-hidden="true" /> : <Maximize size={18} aria-hidden="true" />} onClick={fromTools(handleFullscreen)} />
          </ToolsSection>
          <ToolsSection title="Animation">
            <label htmlFor="bbscheme-speed-mobile" className="flex items-center gap-2 text-sm font-semibold min-[400px]:col-span-2">
              <Clock size={18} aria-hidden="true" className="shrink-0 text-bb-text-muted" /> Vitesse
              {speedInput("bbscheme-speed-mobile")}
              <span className="font-normal text-bb-text-muted">millisecondes par image</span>
            </label>
            <ToolsRow label="Dupliquer l'image" icon={<Copy size={18} aria-hidden="true" />} onClick={fromTools(duplicateFrame)} disabled={isPlaying} />
            <ToolsRow label="Supprimer l'image" icon={<Trash2 size={18} aria-hidden="true" />} onClick={fromTools(removeFrame)} disabled={isPlaying || frames.length <= 1} />
            <ToolsRow label="Exporter en GIF" icon={<Download size={18} aria-hidden="true" />} onClick={fromTools(handleGifExport)} disabled={isPlaying || isExporting} />
          </ToolsSection>
          <ToolsSection title="Plateau">
            <ToolsRow label="Partager" icon={isSharing ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />} onClick={fromTools(handleShare)} disabled={isSharing} />
            <ToolsRow label="Aide" icon={<HelpCircle size={18} aria-hidden="true" />} onClick={fromTools(() => setIsHelpOpen(true))} />
            <ToolsRow label="Tout vider" icon={<Trash2 size={18} aria-hidden="true" />} onClick={fromTools(() => setIsClearModalOpen(true))} danger />
          </ToolsSection>
        </SheetContent>
      </Sheet>

      <HelpSheet open={isHelpOpen} onOpenChange={setIsHelpOpen} />

      <GifExportSheet open={isExporting} progress={exportProgress} gif={generatedGif} onClose={() => setIsExporting(false)} />

      <ConfirmDialog
        open={isClearModalOpen}
        onOpenChange={setIsClearModalOpen}
        title="Tout vider"
        message="Tous les joueurs et tous les dessins seront retirés du plateau. Le ballon revient au centre. « Annuler la dernière action » permet de revenir en arrière."
        confirmLabel="Tout vider"
        danger
        onConfirm={() => {
          saveToHistory(tokens, drawings);
          setTokens([{ id: 'ball-initial', type: 'ball', x: 13, y: 7, status: 'up', location: 'pitch' }]);
          setDrawings([]);
          setIsClearModalOpen(false);
          setSelectedId(null);
          toast.success("Plateau tactique vidé");
        }}
      />
    </div>
  );
}

function BallIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C15.3137 2 18 6.47715 18 12C18 17.5228 15.3137 22 12 22C8.68629 22 6 17.5228 6 12C6 6.47715 8.68629 2 12 2Z" fill="currentColor" fillOpacity="0.2" /><path d="M12 2C15.3137 2 18 6.47715 18 12C18 17.5228 15.3137 22 12 22C8.68629 22 6 17.5228 6 12C6 6.47715 8.68629 2 12 2Z" stroke="currentColor" strokeWidth="2" /><path d="M6 12H18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" /><path d="M9 7H15M9 17H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Ligne du panneau « Plus d'outils » (téléphone) : icône et nom, sur toute la largeur, 44 pixels de haut au moins. */
function ToolsRow({ label, icon, onClick, disabled, pressed, danger }: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  /** Option à deux états (allumée ou non), annoncée par aria-pressed. */
  pressed?: boolean;
  danger?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="tap"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn("w-full justify-start gap-3 font-semibold", danger && "text-bb-danger-text", pressed && "border-bb-accent bg-bb-accent-soft")}
    >
      {icon}
      {label}
    </Button>
  );
}

/** Groupe de commandes du panneau « Plus d'outils », avec son titre ; deux colonnes dès 400 pixels de large. */
function ToolsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-bb-border py-3 last:border-b-0">
      <h3 className="m-0 mb-2 border-0 p-0 text-sm font-bold text-bb-text-muted normal-case not-italic">{title}</h3>
      <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">{children}</div>
    </section>
  );
}
