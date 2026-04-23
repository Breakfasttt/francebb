import React, { useRef, useEffect, useState } from "react";
import { TokenData, ToolType, DrawingPath } from "../page";
import Token from "@/app/bbscheme/component/Token";
import "./Pitch.css";

interface PitchProps {
  tokens: TokenData[];
  onSquareClick: (x: number, y: number) => void;
  onTokenClick: (id: string) => void;
  selectedId: string | null;
  activeTool: ToolType;
  drawings: DrawingPath[];
  onDrawUpdate: (drawings: DrawingPath[]) => void;
  rotation: number;
  finalScale: number;
  showTooltips?: boolean;
  readOnly?: boolean;
}

const Pitch: React.FC<PitchProps> = ({ 
  tokens, 
  onSquareClick, 
  onTokenClick,
  selectedId, 
  activeTool,
  drawings,
  onDrawUpdate,
  rotation,
  finalScale,
  showTooltips,
  readOnly
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
      const tokensAtPos = displayTokens.filter(t => t.x === x && t.y === y);
      squares.push(
        <Square 
          key={`${x}-${y}`} x={x} y={y} onClick={() => onSquareClick(x, y)} 
          tokens={tokensAtPos} allTokens={tokens} activeTool={activeTool} rotation={rotation}
          showTooltips={showTooltips} onTokenClick={onTokenClick} selectedId={selectedId}
          readOnly={readOnly}
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
    if (activeTool !== 'draw' || readOnly) return;
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
        <svg 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}
          viewBox={`0 0 ${COLS * 50} ${ROWS * 50}`}
        >
          <defs>
            <pattern id="pitchGridPattern" width="50" height="50" patternUnits="userSpaceOnUse">
              <path 
                d="M 50 0 L 0 0 0 50" 
                fill="none" 
                stroke="white" 
                strokeWidth="1" 
                strokeOpacity="0.2" 
                vectorEffect="non-scaling-stroke"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pitchGridPattern)" />
        </svg>

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
  showTooltips?: boolean; onTokenClick: (id: string) => void; selectedId: string | null;
  readOnly?: boolean;
}

const Square: React.FC<SquareProps> = ({ x, y, onClick, tokens, allTokens, activeTool, rotation, showTooltips, onTokenClick, selectedId, readOnly }) => {
  const isEndZone = x === 0 || x === 25;
  const isWideZoneLine = (y === 3 || y === 10) && (x > 0 && x < 25);
  return (
    <div 
      className={`pitch-square ${isEndZone ? 'ez' : ''} ${isWideZoneLine ? 'wide-line' : ''} ${readOnly ? 'read-only' : ''}`}
      onClick={() => { if (activeTool !== 'draw' && !readOnly) onClick(); }}
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
                showTooltip={showTooltips} 
                onClick={() => onTokenClick(token.id)}
                isSelected={selectedId === token.id}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pitch;
