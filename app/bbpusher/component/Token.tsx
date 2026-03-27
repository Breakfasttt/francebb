import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { TokenData, ToolType } from "../page";
import { Footprints, CircleOff, Skull } from "lucide-react";
import "./Token.css";

interface TokenProps {
  token: TokenData;
  isOverlay?: boolean;
  activeTool?: ToolType;
}

const Token: React.FC<TokenProps> = ({ token, isOverlay, activeTool }) => {
  const isStatusMode = activeTool === 'status';

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: token.id,
    disabled: isOverlay || isStatusMode
  });

  const style: React.CSSProperties = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.3 : 1,
    pointerEvents: isStatusMode ? 'none' : 'auto',
  } : {
    pointerEvents: isStatusMode ? 'none' : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`token-container ${token.type} ${token.status} ${isOverlay ? 'overlay' : ''}`}
      {...listeners} 
      {...attributes}
    >
      <div className="token-inner">
        {token.type === 'ball' ? (
          <div className="ball-icon">🏈</div>
        ) : (
          <>
            <div className="token-status-icon">
              {token.status === 'prone' && <CircleOff size={10} />}
              {token.status === 'stunned' && <Skull size={10} />}
            </div>
            {token.number && <span className="token-number">{token.number}</span>}
          </>
        )}
      </div>
    </div>
  );
};

export default Token;
