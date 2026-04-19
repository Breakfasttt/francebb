"use client";

import {
  Loader2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  RotateCw
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { getBoardState } from "../actions";
import { DrawingPath, PlayerRosterInfo, RosterData, TokenData } from "../page";
import "./BBSchemePlayer.css";
import Pitch from "./Pitch";

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

          // Fetch Rosters
          if (parsed.blueRosterFile) {
            try {
              const r = await fetch(`/data/roster/${parsed.blueRosterFile}.json`);
              bData = await r.json();
              if (bData) {
                bData.roster = [...bData.roster, starPlayerInfo];
                blueBase = bData.roster.flatMap(p =>
                  Array.from({ length: parseInt(p.qty.split('-')[1]) || 2 }).map((_, i) => ({
                    id: `blue-${p.name.replace(/\s+/g, '-')}-${i}`,
                    type: 'blue', x: -1, y: -1, status: 'up', location: 'box',
                    number: i + 1, playerInfo: p
                  }))
                ).slice(0, 18) as TokenData[];
              }
            } catch (e) { }
          }

          if (parsed.redRosterFile) {
            try {
              const r = await fetch(`/data/roster/${parsed.redRosterFile}.json`);
              rData = await r.json();
              if (rData) {
                rData.roster = [...rData.roster, starPlayerInfo];
                redBase = rData.roster.flatMap(p =>
                  Array.from({ length: parseInt(p.qty.split('-')[1]) || 2 }).map((_, i) => ({
                    id: `red-${p.name.replace(/\s+/g, '-')}-${i}`,
                    type: 'red', x: -1, y: -1, status: 'up', location: 'box',
                    number: i + 1, playerInfo: p
                  }))
                ).slice(0, 18) as TokenData[];
              }
            } catch (e) { }
          }

          // Hydrate Frames
          const hydratedFrames = (parsed.frames as TokenData[][]).map(savedFrame => {
            const fullPack = [...blueBase, ...redBase, { id: 'ball-initial', type: 'ball', x: 13, y: 7, status: 'up', location: 'pitch' }] as TokenData[];
            return fullPack.map(baseToken => {
              const saved = savedFrame.find(s => s.id === baseToken.id);
              if (saved) return { ...baseToken, ...saved };
              return baseToken;
            });
          });

          setFrames(hydratedFrames);
          setTokens(hydratedFrames[0]);
          if (parsed.drawings) setDrawings(parsed.drawings);
          if (parsed.rotation !== undefined) {
            // Si on demande explicitement vertical dans le BBCode, on force la rotation
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
                showTooltips={true}
                readOnly={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bb-player-controls">
        <button className="ctrl-btn" onClick={() => setCurrentFrameIndex(prev => Math.max(0, prev - 1))} disabled={currentFrameIndex === 0}>
          <SkipBack size={18} />
        </button>
        <button className="ctrl-btn main" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>
        <button className="ctrl-btn" onClick={() => setCurrentFrameIndex(prev => Math.min(frames.length - 1, prev + 1))} disabled={currentFrameIndex === frames.length - 1}>
          <SkipForward size={18} />
        </button>

        <div className="player-progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${((currentFrameIndex + 1) / frames.length) * 100}%` }} />
          </div>
          <span className="frame-info">{currentFrameIndex + 1} / {frames.length}</span>
        </div>

        <div className="player-meta">
          <div className="speed-info">{playbackSpeed}ms</div>
          <button className="ctrl-btn" onClick={toggleRotation} title="Pivoter le terrain">
            <RotateCw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BBSchemePlayer;
