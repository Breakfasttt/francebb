"use client";

/**
 * BB Pusher - Plateau tactique Blood Bowl
 * Permet de placer des joueurs et le ballon sur un terrain interactif.
 */

import React, { useState, useEffect, useCallback } from "react";
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { 
  Eraser, 
  Share2, 
  RotateCcw, 
  Download, 
  Trash2, 
  Settings2,
  ChevronLeft,
  RefreshCcw,
  MousePointer2,
  User,
  Users,
  Goal
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import Pitch from "@/app/bbpusher/component/Pitch";
import Sidebar from "@/app/bbpusher/component/Sidebar";
import Token from "@/app/bbpusher/component/Token";

import "./page.css";

// Types
export type TokenType = 'blue' | 'red' | 'ball';
export type ToolType = TokenType | 'select' | 'eraser' | 'status';
export type TokenStatus = 'up' | 'prone' | 'stunned';

export interface TokenData {
  id: string;
  type: TokenType;
  x: number;
  y: number;
  status: TokenStatus;
  number?: number;
}

export default function BBPusherPage() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>('blue');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isVertical, setIsVertical] = useState(false);

  // Configuration des capteurs pour le Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // -- Serialization Logic --

  const serializeState = useCallback((currentTokens: TokenData[], vertical: boolean) => {
    const prefix = vertical ? "V" : "H";
    if (currentTokens.length === 0) return prefix;
    
    // Format: V|tokens...
    const tokensStr = currentTokens.map(t => {
      const typeCode = t.type === 'blue' ? 'b' : t.type === 'red' ? 'r' : 'l';
      const statusCode = t.status === 'up' ? 'u' : t.status === 'prone' ? 'p' : 's';
      return `${typeCode}${t.x}-${t.y}-${statusCode}${t.number ?? ''}`;
    }).join('|');
    
    return `${prefix}|${tokensStr}`;
  }, []);

  const deserializeState = useCallback((hash: string) => {
    if (!hash) return { tokens: [], isVertical: false };
    
    try {
      const mainParts = hash.split('|');
      const prefix = mainParts[0];
      const vertical = prefix === "V";
      const parts = mainParts.slice(1);

      const loadedTokens = parts.length > 0 && parts[0] !== "" ? parts.map((p, index) => {
        const typeChar = p[0];
        const rest = p.substring(1).split('-');
        const x = parseInt(rest[0]);
        const y = parseInt(rest[1]);
        const statusChar = rest[2][0];
        const number = rest[2].substring(1) ? parseInt(rest[2].substring(1)) : undefined;

        return {
          id: `token-${index}-${Date.now()}-${Math.random()}`,
          type: typeChar === 'b' ? 'blue' : typeChar === 'r' ? 'red' : 'ball',
          x,
          y,
          status: statusChar === 'u' ? 'up' : statusChar === 'p' ? 'prone' : 'stunned',
          number
        } as TokenData;
      }) : [];

      return { tokens: loadedTokens, isVertical: vertical };
    } catch (e) {
      console.error("Failed to deserialize state", e);
      return { tokens: [], isVertical: false };
    }
  }, []);

  // Initial load from Hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const { tokens: loadedTokens, isVertical: vertical } = deserializeState(hash);
      setTokens(loadedTokens);
      setIsVertical(vertical);
    }
  }, [deserializeState]);

  // Update Hash on change
  useEffect(() => {
    const serialized = serializeState(tokens, isVertical);
    window.history.replaceState(null, "", `#${serialized}`);
  }, [tokens, isVertical, serializeState]);

  // -- Event Handlers --

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const [overX, overY] = (over.id as string).split('-').map(Number);
      
      setTokens(prev => prev.map(t => {
        if (t.id === active.id) {
          return { ...t, x: overX, y: overY };
        }
        return t;
      }));
    }
  };

  const handleSquareClick = (x: number, y: number) => {
    if (activeTool === 'select') return;

    if (activeTool === 'eraser') {
      setTokens(prev => prev.filter(t => t.x !== x || t.y !== y));
      return;
    }

    if (activeTool === 'status') {
      const atPos = tokens.filter(t => t.x === x && t.y === y && t.type !== 'ball');
      if (atPos.length > 0) {
        setTokens(prev => prev.map(t => {
          if (t.x === x && t.y === y && t.type !== 'ball') {
            const nextStatus: TokenStatus = 
              t.status === 'up' ? 'prone' : 
              t.status === 'prone' ? 'stunned' : 'up';
            return { ...t, status: nextStatus };
          }
          return t;
        }));
      }
      return;
    }

    // Placement
    if (activeTool === 'ball') {
      setTokens(prev => [
        ...prev.filter(t => t.type !== 'ball'),
        {
          id: `ball-${Date.now()}`,
          type: 'ball',
          x,
          y,
          status: 'up'
        }
      ]);
      return;
    }

    // Placement joueur : on évite les doublons de même équipe sur la même case
    setTokens(prev => {
      const filtered = prev.filter(t => t.x !== x || t.y !== y || t.type !== activeTool);
      return [
        ...filtered,
        {
          id: `${activeTool}-${Date.now()}`,
          type: activeTool as TokenType,
          x,
          y,
          status: 'up'
        }
      ];
    });
  };

  const handleClear = () => {
    if (confirm("Voulez-vous vraiment vider le terrain ?")) {
      setTokens([]);
      toast.success("Terrain vidé");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien de partage copié dans le presse-papier !");
  };

  const toggleVertical = () => {
    setIsVertical(prev => !prev);
  };

  const activeToken = tokens.find(t => t.id === activeId);

  return (
    <main className={`bbpusher-page ${isVertical ? 'vertical-mode' : 'horizontal-mode'}`}>
      <header className="tool-header">
        <div className="header-left">
          <Link href="/ressources" className="back-link">
            <ChevronLeft size={20} />
          </Link>
          <h1>BB Pusher</h1>
        </div>

        <div className="header-right">
          <div className="tool-selector-group">
            <button
              className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`}
              onClick={() => setActiveTool('select')}
              title="Sélection"
            >
              <MousePointer2 size={18} />
            </button>
            <button
              className={`tool-btn ${activeTool === 'blue' ? 'active' : ''}`}
              onClick={() => setActiveTool('blue')}
              title="Joueur Bleu"
            >
              <User size={18} color="#3b82f6" />
            </button>
            <button
              className={`tool-btn ${activeTool === 'red' ? 'active' : ''}`}
              onClick={() => setActiveTool('red')}
              title="Joueur Rouge"
            >
              <User size={18} color="#ef4444" />
            </button>
            <button
              className={`tool-btn ${activeTool === 'ball' ? 'active' : ''}`}
              onClick={() => setActiveTool('ball')}
              title="Ballon"
            >
              <Goal size={18} color="#fbbf24" />
            </button>
            <button
              className={`tool-btn ${activeTool === 'status' ? 'active' : ''}`}
              onClick={() => setActiveTool('status')}
              title="Changer État"
            >
              <RefreshCcw size={18} color="var(--accent)" />
            </button>
            <button
              className={`tool-btn ${activeTool === 'eraser' ? 'active' : ''}`}
              onClick={() => setActiveTool('eraser')}
              title="Gomme"
            >
              <Eraser size={18} />
            </button>
          </div>

          <div className="divider" />

          <button className={`tool-btn ${isVertical ? 'active' : ''}`} onClick={toggleVertical} title="Rotation du terrain">
            <RotateCcw size={18} style={{ transform: isVertical ? 'rotate(90deg)' : 'none' }} />
          </button>
          <button className="tool-btn" onClick={handleClear} title="Vider le terrain">
            <Trash2 size={18} />
          </button>
          <button className="tool-btn share-btn" onClick={handleShare} title="Partager">
            <Share2 size={18} /> <span>Partager</span>
          </button>
        </div>
      </header>
      
      <div className="tool-layout">
        <DndContext 
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Sidebar 
            tokens={tokens} 
            activeTool={activeTool} 
            onToolSelect={(tool: ToolType) => setActiveTool(tool)} 
          />
          
          <div className="pitch-container">
            <Pitch 
              tokens={tokens} 
              onSquareClick={handleSquareClick}
              activeId={activeId}
              isVertical={isVertical}
              activeTool={activeTool}
            />
          </div>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.4',
                },
              },
            }),
          }}>
            {activeId && activeToken ? (
              <Token token={activeToken} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </main>
  );
}
