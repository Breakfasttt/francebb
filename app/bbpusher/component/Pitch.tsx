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
  rotation: number; // Pitch rotation for counter-rotation of tokens
}

const Pitch: React.FC<PitchProps> = ({ 
  tokens, 
  onSquareClick, 
  activeId, 
  activeTool,
  drawings,
  onDrawUpdate,
  rotation
}) => {
  const COLS = 26;
  const ROWS = 15;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);

  // Filter logic: Only show players and the ball if it is NOT carried.
  // Carried ball is now rendered INSIDE the carrier's Token overlay.
  const displayTokens = tokens.filter(t => t.type !== 'ball' || !t.attachedToId);

  const squares = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const tokensAtPos = displayTokens.filter(t => t.x === x && t.y === y && t.id !== activeId);
      squares.push(
        <Square 
          key={`${x}-${y}`} 
          x={x} 
          y={y} 
          onClick={() => onSquareClick(x, y)} 
          tokens={tokensAtPos}
          allTokens={tokens} // For checking carried status
          activeTool={activeTool}
          rotation={rotation}
        />
      );
    }
  }

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== 'draw') return;
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPath({ points: [{ x, y }], color: '#ef4444' });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentPath) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPath(prev => prev ? { ...prev, points: [...prev.points, { x, y }] } : null);
  };

  const handleMouseUp = () => {
    if (isDrawing && currentPath) {
      onDrawUpdate([...drawings, currentPath]);
      setCurrentPath(null);
    }
    setIsDrawing(false);
  };

  return (
    <div className="pitch-wrapper">
      <div className="pitch-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${COLS}, 50px)`,
        gridTemplateRows: `repeat(${ROWS}, 50px)`,
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
  x: number;
  y: number;
  onClick: () => void;
  tokens: TokenData[]; // Displayed tokens here
  allTokens: TokenData[]; // All state for carrier check
  activeTool: ToolType;
  rotation: number;
}

const Square: React.FC<SquareProps> = ({ x, y, onClick, tokens, allTokens, activeTool, rotation }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `${x}-${y}` });
  const isEndZone = x === 0 || x === 25;
  const isWideZoneLine = (y === 3 || y === 10) && (x > 0 && x < 25);
  
  return (
    <div 
      ref={setNodeRef}
      className={`pitch-square ${isEndZone ? 'ez' : ''} ${isOver ? 'drag-over' : ''} ${isWideZoneLine ? 'wide-line' : ''}`}
      onClick={() => { if (activeTool !== 'draw') onClick(); }}
    >
      <div className="square-token-container">
        {tokens.map(token => {
          const carriedBall = allTokens.find(t => t.type === 'ball' && t.attachedToId === token.id);
          return (
            <div key={token.id} className="token-wrapper">
              <Token 
                token={token} 
                activeTool={activeTool} 
                rotation={rotation} 
                hasBall={!!carriedBall}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pitch;
