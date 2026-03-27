import React, { useRef, useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { TokenData, ToolType, DrawingPath } from "../page";
import Token from "@/app/bbpusher/component/Token";
import "./Pitch.css";

interface PitchProps {
  tokens: TokenData[];
  onSquareClick: (x: number, y: number) => void;
  activeId: string | null;
  activeTool: ToolType;
  drawings: DrawingPath[];
  onDrawUpdate: (drawings: DrawingPath[]) => void;
  rotation: number;
  finalScale: number;
  showTooltips?: boolean;
}

const Pitch: React.FC<PitchProps> = ({ 
  tokens, 
  onSquareClick, 
  activeId, 
  activeTool,
  drawings,
  onDrawUpdate,
  rotation,
  finalScale,
  showTooltips
}) => {
  const COLS = 26;
  const ROWS = 15;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);

  const displayTokens = tokens.filter(t => t.type !== 'ball' || !t.attachedToId);

  const squares = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const tokensAtPos = displayTokens.filter(t => t.x === x && t.y === y && t.id !== activeId);
      squares.push(
        <Square 
          key={`${x}-${y}`} x={x} y={y} onClick={() => onSquareClick(x, y)} 
          tokens={tokensAtPos} allTokens={tokens} activeTool={activeTool} rotation={rotation}
          showTooltips={showTooltips}
        />
      );
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 4;

    drawings.forEach(path => {
      if (path.points.length < 2) return;
      ctx.beginPath(); ctx.strokeStyle = path.color;
      ctx.moveTo(path.points[0].x, path.points[0].y);
      path.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });

    if (currentPath && currentPath.points.length >= 2) {
      ctx.beginPath(); ctx.strokeStyle = currentPath.color;
      ctx.moveTo(currentPath.points[0].x, currentPath.points[0].y);
      currentPath.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  }, [drawings, currentPath]);

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const centerX = 1300 / 2;
    const centerY = 750 / 2;

    // Normalised coordinates relative to the visual center of the transformed box
    const nx = (e.clientX - (rect.left + rect.width / 2)) / finalScale;
    const ny = (e.clientY - (rect.top + rect.height / 2)) / finalScale;

    // Inverse rotate the point to get back to original canvas local space
    // Since CSS rotate is Clockwise, we rotate Counter-Clockwise to get back
    const rad = -rotation * Math.PI / 180;
    const x = nx * Math.cos(rad) - ny * Math.sin(rad) + centerX;
    const y = nx * Math.sin(rad) + ny * Math.cos(rad) + centerY;
    
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== 'draw') return;
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    setCurrentPath({ points: [{ x, y }], color: '#ef4444' });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentPath) return;
    const { x, y } = getCanvasCoords(e);
    setCurrentPath(prev => prev ? { ...prev, points: [...prev.points, { x, y }] } : null);
  };

  const handleMouseUp = () => {
    if (isDrawing && currentPath) { onDrawUpdate([...drawings, currentPath]); setCurrentPath(null); }
    setIsDrawing(false);
  };

  return (
    <div className="pitch-wrapper">
      <div className="pitch-grid" style={{ 
        display: 'grid', gridTemplateColumns: `repeat(${COLS}, 50px)`, gridTemplateRows: `repeat(${ROWS}, 50px)`,
      }}>
        {squares}
        <canvas 
          ref={canvasRef} width={COLS * 50} height={ROWS * 50}
          className={`draw-layer ${activeTool === 'draw' ? 'active' : ''}`}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        />
      </div>
      <div className="pitch-overlays" style={{ pointerEvents: 'none' }}>
        <div className="pitch-line line-center"></div>
        <div className="pitch-line line-ez-left"></div>
        <div className="pitch-line line-ez-right"></div>
      </div>
    </div>
  );
};

interface SquareProps {
  x: number; y: number; onClick: () => void;
  tokens: TokenData[]; allTokens: TokenData[]; activeTool: ToolType; rotation: number;
  showTooltips?: boolean;
}

const Square: React.FC<SquareProps> = ({ x, y, onClick, tokens, allTokens, activeTool, rotation, showTooltips }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `${x}-${y}` });
  const isEndZone = x === 0 || x === 25;
  const isWideZoneLine = (y === 3 || y === 10) && (x > 0 && x < 25);
  return (
    <div 
      ref={setNodeRef} className={`pitch-square ${isEndZone ? 'ez' : ''} ${isOver ? 'drag-over' : ''} ${isWideZoneLine ? 'wide-line' : ''}`}
      onClick={() => { if (activeTool !== 'draw') onClick(); }}
    >
      <div className="square-token-container">
        {tokens.map(token => {
          const carriedBall = allTokens.find(t => t.type === 'ball' && t.attachedToId === token.id);
          return (
            <div key={token.id} className="token-wrapper">
              <Token token={token} activeTool={activeTool} rotation={rotation} hasBall={!!carriedBall} showTooltip={showTooltips} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pitch;
