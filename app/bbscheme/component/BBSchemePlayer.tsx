"use client";

import {
  Clock,
  HelpCircle,
  Info,
  Loader2,
  Pause,
  Play,
  RotateCw,
  SkipBack,
  SkipForward
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { getBoardState } from "../actions";
import { DrawingPath, PlayerRosterInfo, RosterData, TokenData } from "../page";
import "./BBSchemePlayer.css";
import Pitch from "./Pitch";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import ToggleButton from "@/common/components/Button/ToggleButton";

interface BBSchemePlayerProps {
  boardId: string;
  layout?: string;
}

const BBSchemePlayer: React.FC<BBSchemePlayerProps> = ({ boardId, layout }) => {
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

  const playTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hydratation
  useEffect(() => {
    if (!boardId) return;

    const loadState = async () => {
      setLoading(true);
      const result = await getBoardState(boardId);
      if (result.success && result.data) {
        try {
          const parsed = JSON.parse(result.data);

          const starPlayerInfo: PlayerRosterInfo = {
            name: "Star Player", qty: "0-2",
            ma: "?", st: "?", ag: "?", pa: "?", av: "?",
            skills: ["Compétences variables"], primary: "", secondary: "", cost: 0
          };

          let bData: RosterData | null = null;
          let rData: RosterData | null = null;
          let blueBase: TokenData[] = [];
          let redBase: TokenData[] = [];

          // Fetch Star Pool for hydration
          let starPool: PlayerRosterInfo[] = [];
          try {
            const resp = await fetch('/data/roster/all_star_players.json');
            const sd = await resp.json();
            starPool = sd.roster;
          } catch (e) { }

          // Fetch Rosters
          if (parsed.blueRosterFile) {
            try {
              const r = await fetch(`/data/roster/${parsed.blueRosterFile}.json`);
              bData = await r.json();
              if (bData) {
                bData.roster = [...bData.roster, starPlayerInfo];
                blueBase = bData.roster.flatMap(p => {
                  const isStar = p.name === "Star Player";
                  const slug = isStar ? "star" : p.name.replace(/\s+/g, '-');
                  const q = p.qty || "2";
                  const limit = isStar ? 2 : (parseInt(q.includes('-') ? q.split('-').pop() : q) || 2);
                  
                  return Array.from({ length: limit }).map((_, i) => ({
                    id: `blue-${slug}-${i}`,
                    type: 'blue', x: -1, y: -1, status: 'up', location: 'box',
                    number: isStar ? 99 + (i + 1) : i + 1, playerInfo: p
                  }));
                }) as TokenData[];
              }
            } catch (e) { }
          }

          if (parsed.redRosterFile) {
            try {
              const r = await fetch(`/data/roster/${parsed.redRosterFile}.json`);
              rData = await r.json();
              if (rData) {
                rData.roster = [...rData.roster, starPlayerInfo];
                redBase = rData.roster.flatMap(p => {
                  const isStar = p.name === "Star Player";
                  const slug = isStar ? "star" : p.name.replace(/\s+/g, '-');
                  const q = p.qty || "2";
                  const limit = isStar ? 2 : (parseInt(q.includes('-') ? q.split('-').pop() : q) || 2);

                  return Array.from({ length: limit }).map((_, i) => ({
                    id: `red-${slug}-${i}`,
                    type: 'red', x: -1, y: -1, status: 'up', location: 'box',
                    number: isStar ? 99 + (i + 1) : i + 1, playerInfo: p
                  }));
                }) as TokenData[];
              }
            } catch (e) { }
          }

          const ballBase: TokenData = { id: 'ball-initial', type: 'ball', x: 13, y: 7, status: 'up', location: 'pitch' };

          // Hydrate Frames
          const hydratedFrames = (parsed.frames as any[][]).map(savedFrame => {
            const currentFrameTokens = [...blueBase, ...redBase, ballBase].map(t => ({ ...t }));
            
            savedFrame.forEach(s => {
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

            return currentFrameTokens;
          });

          if (hydratedFrames.length > 0) {
            setFrames(hydratedFrames);
            setTokens(hydratedFrames[0]);
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

      const pitchW = rotation === 90 ? 750 : 1300;
      const pitchH = rotation === 90 ? 1300 : 750;
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
      setTokens(frames[currentFrameIndex]);
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
  const nativeW = isVertical ? 750 : 1300;
  const nativeH = isVertical ? 1300 : 750;

  return (
    <div className="bb-player-root" ref={containerRef}>
      <div className="bb-player-viewport" style={{ height: `${nativeH * zoom}px` }}>
        {/* Container qui fait la TAILLE REELLE VISUELLE (dimension * zoom) */}
        <div style={{ width: `${nativeW * zoom}px`, height: `${nativeH * zoom}px`, overflow: 'hidden' }}>
          <div 
            className="bb-player-pitch-container" 
            style={{ 
              width: `${nativeW}px`, 
              height: `${nativeH}px`,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
          >
            <div style={{ 
              transform: `rotate(${rotation}deg)`, 
              width: '1300px', 
              height: '750px', 
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
          <ClassicButton 
            onClick={() => setCurrentFrameIndex(prev => Math.max(0, prev - 1))} 
            disabled={currentFrameIndex === 0}
            size="xs"
            icon={<SkipBack size={14} />}
          />
          <CTAButton 
            onClick={() => setIsPlaying(!isPlaying)}
            icon={isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            size="sm"
          />
          <ClassicButton 
            onClick={() => setCurrentFrameIndex(prev => Math.min(frames.length - 1, prev + 1))} 
            disabled={currentFrameIndex === frames.length - 1}
            size="xs"
            icon={<SkipForward size={14} />}
          />
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
            <ToggleButton 
              active={showTooltips} 
              onClick={() => setShowTooltips(!showTooltips)}
              size="xs"
              icon={<Info size={16} />}
              title={showTooltips ? "Masquer les infos" : "Afficher les infos"}
            />
            <ClassicButton 
              onClick={toggleRotation} 
              size="xs" 
              icon={<RotateCw size={14} />}
              title="Pivoter le terrain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BBSchemePlayer;
