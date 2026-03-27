import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { TokenData, ToolType } from "../page";
import Token from "@/app/bbpusher/component/Token";
import "./Pitch.css";

interface PitchProps {
  tokens: TokenData[];
  onSquareClick: (x: number, y: number) => void;
  activeId: string | null;
  isVertical: boolean;
  activeTool: ToolType;
}

const Pitch: React.FC<PitchProps> = ({ tokens, onSquareClick, activeId, isVertical, activeTool }) => {
  const COLS = 26;
  const ROWS = 15;

  const squares = [];
  // Swapper COLS/ROWS if vertical? Original site seems to just rotate the board.
  // I'll stick to 26x15 grid but rotate the whole container.

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const tokensAtPos = tokens.filter(t => t.x === x && t.y === y && t.id !== activeId);
      squares.push(
        <Square 
          key={`${x}-${y}`} 
          x={x} 
          y={y} 
          onClick={() => onSquareClick(x, y)} 
          tokens={tokensAtPos}
          activeTool={activeTool}
        />
      );
    }
  }

  return (
    <div className={`pitch-wrapper ${isVertical ? 'is-vertical' : ''}`}>
      <div className="pitch-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      }}>
        {squares}
      </div>
      
      {/* Pitch Markings Overview (Simplified) */}
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
  tokens: TokenData[];
  activeTool: ToolType;
}

const Square: React.FC<SquareProps> = ({ x, y, onClick, tokens, activeTool }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${x}-${y}`,
  });

  const isEndZone = x === 0 || x === 25;
  
  return (
    <div 
      ref={setNodeRef}
      className={`pitch-square ${isEndZone ? 'ez' : ''} ${isOver ? 'drag-over' : ''}`}
      onClick={(e) => {
        // En mode clic, on laisse le parent gérer
        onClick();
      }}
    >
      <div className="square-token-container">
        {tokens.map(token => (
          <div key={token.id} className="token-wrapper">
            <Token token={token} activeTool={activeTool} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pitch;
