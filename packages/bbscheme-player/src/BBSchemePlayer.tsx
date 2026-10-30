"use client";

/**
 * Lecteur BBScheme : affiche un plateau enregistré et rejoue son animation (lecture, image par image, vitesse,
 * rotation). Copié depuis apps/site/app/bbscheme/component/BBSchemePlayer.tsx (carte 024). Le paquet ne peut pas
 * appeler la base de données : c'est l'application qui fournit la fonction `loadBoard` (action serveur du site).
 * Les boutons viennent de @bbfrance/ui, car un paquet n'a pas accès aux boutons propres au site.
 */

import {
  Clock,
  Info,
  Loader2,
  Pause,
  Play,
  RotateCw,
  SkipBack,
  SkipForward,
  ExternalLink
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@bbfrance/ui";
import { DrawingPath, PlayerRosterInfo, TokenData } from "./types";
import "./BBSchemePlayer.css";
import "./BBSchemePlayer-mobile.css";
import Pitch from "./Pitch";

/** Réponse de la fonction qui lit un plateau : son contenu JSON, ou une erreur. */
export interface BoardStateResult {
  success: boolean;
  data?: string;
  error?: string;
}

export interface BBSchemePlayerProps {
  boardId: string;
  layout?: string;
  /** Lit le plateau `id` (dans le site : l'action serveur `getBoardState`). */
  loadBoard: (id: string) => Promise<BoardStateResult>;
}

const BBSchemePlayer: React.FC<BBSchemePlayerProps> = ({ boardId, layout, loadBoard }) => {
  const [frames, setFrames] = useState<TokenData[][]>([]);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [drawings, setDrawings] = useState<DrawingPath[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(800);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);

  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hydratation
  useEffect(() => {
    if (!boardId) return;

    const loadState = async () => {
      setLoading(true);
      const result = await loadBoard(boardId);
      if (result.success && result.data) {
        try {
          const parsed = JSON.parse(result.data);

          const starPlayerInfo: PlayerRosterInfo = {
            name: "Star Player", qty: "0-2",
            ma: "?", st: "?", ag: "?", pa: "?", av: "?",
            skills: ["Compétences variables"], primary: "", secondary: "", cost: 0
          };

          // Collect ALL unique rosters from all frames
          const allBlueFiles = new Set<string>();
          if (parsed.blueRosterFile) allBlueFiles.add(parsed.blueRosterFile);
          const allRedFiles = new Set<string>();
          if (parsed.redRosterFile) allRedFiles.add(parsed.redRosterFile);

          const parsedFrames = Array.isArray(parsed.frames) ? parsed.frames : [];
          parsedFrames.forEach((f: any) => {
            if (f && f.blueRosterFile) allBlueFiles.add(f.blueRosterFile);
            if (f && f.redRosterFile) allRedFiles.add(f.redRosterFile);
          });

          // Fetch Star Pool for hydration
          let starPool: PlayerRosterInfo[] = [];
          try {
            const resp = await fetch('/data/roster/all_star_players.json');
            const sd = await resp.json();
            starPool = sd.roster;
          } catch (e) { }

          // Load all rosters and create pools
          const bluePools: Record<string, TokenData[]> = {};
          const redPools: Record<string, TokenData[]> = {};

          const loadPool = async (file: string, team: 'blue' | 'red') => {
            const res = await fetch(`/data/roster/${file}.json`).then(r => r.json()).catch(() => null);
            if (!res) return;
            const enriched = { ...res, roster: [...res.roster, starPlayerInfo] };
            
            const pool = enriched.roster.flatMap((p: any) => {
              const isStar = p.name === "Star Player";
              const slug = isStar ? "star" : p.name.replace(/\s+/g, '-');
              const q = p.qty || "2";
              const limit = isStar ? 2 : (parseInt(q.includes('-') ? q.split('-').pop() : q) || 2);
              return Array.from({ length: limit }).map((_, i) => ({
                id: `${team}-${slug}-${i}`,
                type: team as any, x: -1, y: -1, status: 'up' as any, location: 'box' as any,
                number: isStar ? 99 + (i + 1) : i + 1,
                playerInfo: { ...p, parentRoster: enriched }
              }));
            });
            if (team === 'blue') bluePools[file] = pool; else redPools[file] = pool;
          };

          await Promise.all([
            ...Array.from(allBlueFiles).map(f => loadPool(f, 'blue')),
            ...Array.from(allRedFiles).map(f => loadPool(f, 'red'))
          ]);

          const ballBase: TokenData = { id: 'ball-initial', type: 'ball', x: 13, y: 7, status: 'up', location: 'pitch' };

          // FUSION 
          const firstFrameRosters = parsedFrames.length > 0 && !(parsedFrames[0] as any).tokens;

          const hydratedFrames = parsedFrames.map((f: any) => {
            const savedTokens = firstFrameRosters || !f.tokens ? f || [] : f.tokens;
            const bFile = firstFrameRosters || !f.tokens ? parsed.blueRosterFile : f.blueRosterFile;
            const rFile = firstFrameRosters || !f.tokens ? parsed.redRosterFile : f.redRosterFile;

            const bPool = bFile ? bluePools[bFile] || [] : [];
            const rPool = rFile ? redPools[rFile] || [] : [];
            
            const currentFrameTokens = [...bPool.map(t => ({ ...t })), ...rPool.map(t => ({ ...t })), { ...ballBase }];

            savedTokens.forEach((s: any) => {
              const idx = currentFrameTokens.findIndex(t => t.id === s.id);
              if (idx !== -1) {
                const base = currentFrameTokens[idx];
                currentFrameTokens[idx] = { ...base, ...s };
                
                // Restauration de l'info Star Player si besoin
                if (base.playerInfo?.name === "Star Player" && s.starName) {
                  const details = starPool.find(sd => sd.name === s.starName);
                  if (details) currentFrameTokens[idx].playerInfo = details;
                }
              } else if (s.type === 'ball') {
                const bIdx = currentFrameTokens.findIndex(t => t.type === 'ball');
                if (bIdx !== -1) currentFrameTokens[bIdx] = { ...currentFrameTokens[bIdx], ...s };
              }
            });
            
            return {
              tokens: currentFrameTokens,
              blueRosterFile: bFile,
              redRosterFile: rFile
            };
          });

          if (hydratedFrames.length > 0) {
            setFrames(hydratedFrames);
            setTokens(hydratedFrames[0].tokens);
          }
          
          if (parsed.drawings) setDrawings(parsed.drawings);
          if (parsed.rotation !== undefined) {
            if (layout === "vertical") setRotation(90);
            else setRotation(parsed.rotation);
          } else if (layout === "vertical") {
            setRotation(90);
          }
          if (parsed.speed !== undefined) setPlaybackSpeed(parsed.speed);
        } catch (e) {
          console.error("Parse error", e);
        }
      }
      setLoading(false);
    };

    loadState();
  }, [boardId]);

  // Auto-scale basé sur le conteneur
  useEffect(() => {
    if (loading) return;

    const updateScale = () => {
      if (!containerRef.current) return;

      const pitchW = (rotation === 90 ? 758 : 1308) + 8; // +8 pour marge de sécurité bordures
      const pitchH = (rotation === 90 ? 1308 : 758) + 8;
      const containerW = containerRef.current?.getBoundingClientRect().width || 0;

      if (containerW > 0) {
        // Viser la largeur complète du conteneur par défaut
        let newZoom = Math.min(1.0, containerW / pitchW);

        // MAIS brider la hauteur (650px max) pour ne pas être trop long sur le forum
        const MAX_H = 650;
        if (pitchH * newZoom > MAX_H) {
          newZoom = MAX_H / pitchH;
        }

        setZoom(newZoom);
      }
    };

    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    updateScale();
    window.addEventListener('resize', updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [rotation, loading]);

  const toggleRotation = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Playback
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      playTimerRef.current = setInterval(() => {
        setCurrentFrameIndex(prev => (prev + 1) % frames.length);
      }, playbackSpeed);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, frames.length, playbackSpeed]);

  useEffect(() => {
    if (frames[currentFrameIndex]) {
      const frame = frames[currentFrameIndex] as any;
      setTokens(frame.tokens || frame);
    }
  }, [currentFrameIndex, frames]);

  if (loading) {
    return (
      <div className="player-loading">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  const isVertical = rotation === 90 || rotation === 270;
  const nativeW = (isVertical ? 758 : 1308) + 8;
  const nativeH = (isVertical ? 1308 : 758) + 8;

  return (
    <div className="bb-player-root" ref={containerRef}>
      <div className="bb-player-viewport" style={{ height: `${nativeH * zoom}px` }}>
        {/* Container qui fait la TAILLE REELLE VISUELLE (dimension * zoom) */}
        <div style={{ width: `${nativeW * zoom}px`, height: `${nativeH * zoom}px`, overflow: 'hidden' }}>
          <div 
            className="bb-player-pitch-container" 
            style={{ 
              width: `${nativeW - 8}px`, 
              height: `${nativeH - 8}px`,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              margin: '4px' // Décalage pour voir la bordure
            }}
          >
            <div style={{ 
              transform: `rotate(${rotation}deg)`, 
              width: '1308px', 
              height: '758px', 
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Pitch
                tokens={tokens.filter(t => t.location === 'pitch')}
                onSquareClick={() => { }}
                onTokenClick={() => { }}
                selectedId={null}
                activeTool="select"
                drawings={drawings}
                onDrawUpdate={() => { }}
                rotation={rotation}
                finalScale={zoom}
                showTooltips={showTooltips}
                readOnly={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bb-player-controls theme-aware">
        <div className="ctrl-group main-actions">
          <Button
            className="bb-player-btn"
            variant="outline"
            size="icon"
            onClick={() => setCurrentFrameIndex(prev => Math.max(0, prev - 1))}
            disabled={currentFrameIndex === 0}
            aria-label="Image précédente"
          >
            <SkipBack size={14} />
          </Button>
          <Button
            className="bb-player-btn"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause" : "Lecture"}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </Button>
          <Button
            className="bb-player-btn"
            variant="outline"
            size="icon"
            onClick={() => setCurrentFrameIndex(prev => Math.min(frames.length - 1, prev + 1))}
            disabled={currentFrameIndex === frames.length - 1}
            aria-label="Image suivante"
          >
            <SkipForward size={14} />
          </Button>
        </div>

        <div className="player-progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${((currentFrameIndex + 1) / (frames.length || 1)) * 100}%` }} />
          </div>
          <span className="frame-info">{currentFrameIndex + 1} / {frames.length || 1}</span>
        </div>

        <div className="player-meta">
          <div className="speed-control-pill theme-aware">
            <Clock size={12} />
            <input 
              type="number" 
              value={playbackSpeed === 0 ? "" : playbackSpeed} 
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) setPlaybackSpeed(val);
                else if (e.target.value === "") setPlaybackSpeed(0);
              }}
              onBlur={() => {
                setPlaybackSpeed(prev => Math.max(100, Math.min(3000, prev)));
              }}
              className="speed-input"
            />
            <span className="unit">ms</span>
          </div>

          <div className="divider" />

          <div className="secondary-actions">
            <Button
              className="bb-player-btn"
              variant={showTooltips ? "default" : "outline"}
              size="icon"
              aria-pressed={showTooltips}
              onClick={() => setShowTooltips(!showTooltips)}
              title={showTooltips ? "Masquer les infos" : "Afficher les infos"}
              aria-label={showTooltips ? "Masquer les infos" : "Afficher les infos"}
            >
              <Info size={16} />
            </Button>
            <Button
              className="bb-player-btn"
              variant="outline"
              size="icon"
              onClick={toggleRotation}
              title="Pivoter le terrain"
              aria-label="Pivoter le terrain"
            >
              <RotateCw size={14} />
            </Button>
            <Button
              className="bb-player-btn"
              variant="outline"
              size="icon"
              onClick={() => window.open(`/bbscheme?id=${boardId}`, '_blank')}
              title="Ouvrir dans l'éditeur BBScheme"
              aria-label="Ouvrir dans l'éditeur BBScheme"
            >
              <ExternalLink size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BBSchemePlayer;
