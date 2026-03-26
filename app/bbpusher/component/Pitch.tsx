import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { TokenData } from "../page";
import Token from "@/app/bbpusher/component/Token";
import "./Pitch.css";

interface PitchProps {
  tokens: TokenData[];
  onSquareClick: (x: number, y: number) => void;
  activeId: string | null;
}

const Pitch: React.FC<PitchProps> = ({ tokens, onSquareClick, activeId }) => {
  const COLS = 26;
  const ROWS = 15;

  const squares = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      squares.push(<Square key={`${x}-${y}`} x={x} y={y} onClick={() => onSquareClick(x, y)} />);
    }
  }

  return (
    <div className="pitch-wrapper">
      <div className="pitch-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      }}>
        {squares}
        
        {/* Render Tokens */}
        {tokens.map(token => (
          token.id !== activeId && (
            <div 
              key={token.id} 
              className="token-on-pitch"
              style={{
                gridColumn: token.x + 1,
                gridRow: token.y + 1,
                pointerEvents: 'none', // Pointer events pass to Square for drag start? No, Token handles drag
              }}
            >
              <Token token={token} />
            </div>
          )
        ))}
      </div>
      
      {/* Pitch Markings Overview (Simplified) */}
      <div className="pitch-overlays" style={{ pointerEvents: 'none' }}>
        <div className="pitch-line line-center" style={{ left: '50%' }}></div>
        <div className="pitch-line line-ez-left" style={{ left: 'calc(100% / 26)' }}></div>
        <div className="pitch-line line-ez-right" style={{ right: 'calc(100% / 26)' }}></div>
      </div>
    </div>
  );
};

interface SquareProps {
  x: number;
  y: number;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ x, y, onClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${x}-${y}`,
  });

  // Determiner le type de case pour le style (EZ, LOS, Wide Zone)
  const isEndZone = x === 0 || x === 25;
  const isCenter = x === 12 || x === 13;
  
  return (
    <div 
      ref={setNodeRef}
      className={`pitch-square ${isEndZone ? 'ez' : ''} ${isOver ? 'drag-over' : ''}`}
      onClick={onClick}
    >
      <div className="square-pos">{x}-{y}</div>
    </div>
  );
};

export default Pitch;
