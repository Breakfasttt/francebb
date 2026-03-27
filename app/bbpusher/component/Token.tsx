import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { TokenData, ToolType } from "../page";
import { 
  HelpCircle, 
  Star
} from "lucide-react";
import "./Token.css";

interface TokenProps {
  token: TokenData;
  isOverlay?: boolean;
  activeTool?: ToolType;
  rotation?: number; // Pitch rotation
  hasBall?: boolean; // If this player is carrying a ball
}

const Token: React.FC<TokenProps> = ({ token, isOverlay, activeTool, rotation = 0, hasBall }) => {
  const isBall = token.type === 'ball';
  const isCarried = !!token.attachedToId;
  
  // Drag restriction logic
  let canDrag = true;
  if (activeTool === 'player') canDrag = !isBall;
  if (activeTool === 'ball') canDrag = isBall;
  if (activeTool === 'status' || activeTool === 'draw' || activeTool === 'eraser') canDrag = false;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: token.id,
    disabled: !canDrag || isOverlay
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 1000 : (isBall ? 70 : 10),
    pointerEvents: (isBall && isCarried && activeTool === 'select') ? 'none' : (isDragging && !isOverlay ? 'none' : 'auto')
  };

  const visualStyle: React.CSSProperties = {
    transform: isOverlay ? 'none' : `rotate(${-rotation}deg)`,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`token-container ${token.type} ${token.status} ${isOverlay ? 'overlay' : ''} ${isDragging && !isOverlay ? 'dragging-source' : ''} ${isBall ? 'ball-token' : 'player-token'}`}
      {...listeners} 
      {...attributes}
    >
      <div className="token-inner" style={visualStyle}>
        {isBall ? (
          <div className="ball-icon">
            <BallGraphic />
          </div>
        ) : (
          <div className="token-visual">
            <div className="token-base">
               {token.number && <span className="token-number">{token.number}</span>}
            </div>
            
            <div className="status-overlay">
              {token.status === 'stunned' && (
                <div className="stars-animation">
                  <Star className="star" size={10} fill="currentColor" />
                  <Star className="star" size={10} fill="currentColor" />
                </div>
              )}
              {token.status === 'bonehead' && <HelpCircle className="floating-icon" size={16} />}
              {token.status === 'stupid' && <FangsIcon className="floating-icon bite-anim" size={16} />}
              {token.status === 'fourchette' && <ForkIcon className="floating-icon-large croque-anim" size={24} />}
            </div>

            {hasBall && (
              <div className="carried-ball-overlay">
                <BallGraphic size={16} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function ForkIcon({ className, size = 16 }: { className?: string, size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2v6a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V2"/>
      <path d="M12 12v10"/>
      <path d="M10 2v4"/>
      <path d="M14 2v4"/>
    </svg>
  );
}

function FangsIcon({ className, size = 16 }: { className?: string, size?: number }) {
  return (
    <svg width={size * 1.5} height={size} viewBox="0 0 32 24" fill="currentColor" className={className}>
      <path d="M2 4C2 4 6 8 16 8C26 8 30 4 30 4V10C30 10 26 9 16 9C6 9 2 10 2 10V4Z" fillOpacity="0.4" />
      <path d="M6 5L9 17L12 5H6Z" />
      <path d="M20 5L23 17L26 5H20Z" />
      <path d="M2 3H30V7H2V3Z" />
    </svg>
  );
}

function BallGraphic({ size = 24 }: { size?: number }) {
  const h = Math.round(size * 0.83);
  return (
    <svg width={size} height={h} viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 1.5C15.5 1.5 18 5 18 10C18 15 15.5 18.5 12 18.5C8.5 18.5 6 15 6 10C6 5 8.5 1.5 12 1.5Z" fill="#8B4513" stroke="white" strokeWidth="1.5"/><path d="M6 10H18" stroke="white" strokeWidth="1" strokeDasharray="2 2"/><path d="M10 5V15M14 5V15" stroke="white" strokeWidth="1"/>
    </svg>
  );
}

export default Token;
