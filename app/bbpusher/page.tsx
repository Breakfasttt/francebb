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
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import Pitch from "@/app/bbpusher/component/Pitch";
import Toolbar from "@/app/bbpusher/component/Toolbar";
import Sidebar from "@/app/bbpusher/component/Sidebar";
import Token from "@/app/bbpusher/component/Token";

import "./page.css";

// Types
export type TokenType = 'blue' | 'red' | 'ball';
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
  const [activeTool, setActiveTool] = useState<TokenType | 'select' | 'eraser'>('blue');
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configuration des capteurs pour le Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // -- Serialization Logic --

  const serializeState = useCallback((currentTokens: TokenData[]) => {
    if (currentTokens.length === 0) return "";
    
    // Format: id,type,x,y,status,num|...
    // Pour raccourcir, on utilise des codes : b=blue, r=red, l=ball | u=up, p=prone, s=stunned
    return currentTokens.map(t => {
      const typeCode = t.type === 'blue' ? 'b' : t.type === 'red' ? 'r' : 'l';
      const statusCode = t.status === 'up' ? 'u' : t.status === 'prone' ? 'p' : 's';
      return `${typeCode}${t.x}-${t.y}-${statusCode}${t.number ?? ''}`;
    }).join('|');
  }, []);

  const deserializeState = useCallback((hash: string) => {
    if (!hash) return [];
    
    try {
      const parts = hash.split('|');
      return parts.map((p, index) => {
        const typeChar = p[0];
        const rest = p.substring(1).split('-');
        const x = parseInt(rest[0]);
        const y = parseInt(rest[1]);
        const statusChar = rest[2][0];
        const number = rest[2].substring(1) ? parseInt(rest[2].substring(1)) : undefined;

        return {
          id: `token-${index}-${Date.now()}`,
          type: typeChar === 'b' ? 'blue' : typeChar === 'r' ? 'red' : 'ball',
          x,
          y,
          status: statusChar === 'u' ? 'up' : statusChar === 'p' ? 'prone' : 'stunned',
          number
        } as TokenData;
      });
    } catch (e) {
      console.error("Failed to deserialize state", e);
      return [];
    }
  }, []);

  // Initial load from Hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const loadedTokens = deserializeState(hash);
      setTokens(loadedTokens);
    }
  }, [deserializeState]);

  // Update Hash on change
  useEffect(() => {
    const serialized = serializeState(tokens);
    if (serialized) {
      window.history.replaceState(null, "", `#${serialized}`);
    } else {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [tokens, serializeState]);

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

    // Si on place un ballon, on enlève l'ancien s'il existe
    if (activeTool === 'ball') {
      setTokens(prev => [
        ...prev.filter(t => t.type !== 'ball' && (t.x !== x || t.y !== y)),
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

    // Placement d'un joueur
    const existingAtPos = tokens.find(t => t.x === x && t.y === y);
    if (existingAtPos) {
      // Si déjà un pion, on change son statut s'il est de la même équipe, ou on le remplace
      if (existingAtPos.type === activeTool) {
        // Cycle states: up -> prone -> stunned -> up
        const nextStatus: TokenStatus = 
          existingAtPos.status === 'up' ? 'prone' : 
          existingAtPos.status === 'prone' ? 'stunned' : 'up';
        
        setTokens(prev => prev.map(t => (t.id === existingAtPos.id ? { ...t, status: nextStatus } : t)));
      } else {
        // Remplacer
        setTokens(prev => [
          ...prev.filter(t => t.id !== existingAtPos.id),
          {
            id: `${activeTool}-${Date.now()}`,
            type: activeTool,
            x,
            y,
            status: 'up'
          }
        ]);
      }
    } else {
      setTokens(prev => [
        ...prev,
        {
          id: `${activeTool}-${Date.now()}`,
          type: activeTool,
          x,
          y,
          status: 'up'
        }
      ]);
    }
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

  const activeToken = tokens.find(t => t.id === activeId);

  return (
    <main className="bbpusher-page">
      <header className="tool-header">
        <div className="header-left">
          <Link href="/ressources" className="back-link">
            <ChevronLeft size={20} />
          </Link>
          <h1>BB Pusher</h1>
        </div>

        <div className="header-right">
          <button className="tool-btn" onClick={handleClear} title="Vider le terrain">
            <RotateCcw size={18} />
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
            onToolSelect={(tool: any) => setActiveTool(tool)} 
          />
          
          <div className="pitch-container">
            <Pitch 
              tokens={tokens} 
              onSquareClick={handleSquareClick}
              activeId={activeId}
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

      <Toolbar 
        activeTool={activeTool} 
        onSelect={setActiveTool} 
      />
    </main>
  );
}
