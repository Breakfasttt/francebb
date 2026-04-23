import React from "react";
import { TokenData, ToolType } from "../page";
import { 
  HelpCircle, 
  Star
} from "lucide-react";
import { createPortal } from "react-dom";
import "./Token.css";

interface TokenProps {
  token: TokenData;
  isOverlay?: boolean;
  activeTool?: ToolType;
  rotation?: number; 
  hasBall?: boolean; 
  showTooltip?: boolean; 
  onClick?: () => void;
  isSelected?: boolean;
}

const Token: React.FC<TokenProps> = ({ 
  token, 
  isOverlay, 
  activeTool, 
  rotation = 0, 
  hasBall, 
  showTooltip = true,
  onClick,
  isSelected
}) => {
  const isBall = token.type === 'ball';
  const isCarried = !!token.attachedToId;
  
  // Custom Initials Logic
  const getInitials = (name: string, rosterName?: string) => {
    if (!name) return "";
    let cleanName = name.replace(/\([^)]*\)/g, '').trim();
    
    if (cleanName.startsWith("Guerrière ")) {
      cleanName = cleanName.replace("Guerrière ", "").trim();
    }

    const stopWords = ["DES", "LES", "DU", "DE", "LE", "LA", "ET", "D’", "D'", "L’", "L'", "D", "L"];
    // Mots du roster à ignorer (normalisés et sans S final pour le pluriel)
    const rosterWords = rosterName 
      ? rosterName.toUpperCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .split(/[\s\-’']+/)
          .filter(w => w.length > 2)
          .map(w => w.replace(/S$/, ""))
      : [];

    const words = cleanName.split(/[\s\-’']+/);
    
    const filteredWords = words.filter(word => {
      const upWord = word.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (!upWord || stopWords.includes(upWord)) return false;
      
      const stem = upWord.replace(/S$/, "");
      // Ne pas garder si le mot (ou sa racine) est dans le nom du roster
      if (rosterWords.some(rw => rw.startsWith(stem) || stem.startsWith(rw))) return false;
      
      return true;
    });

    if (filteredWords.length === 0) return cleanName.substring(0, 2).toUpperCase();
    if (filteredWords.length === 1) {
      if (filteredWords[0].length >= 2) return filteredWords[0].substring(0, 2).toUpperCase();
      return filteredWords[0].toUpperCase();
    }
    
    const result = filteredWords.map(word => word[0]).join("").toUpperCase();
    return result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const isGenericStar = token.playerInfo?.name === "Star Player";
  const initial = isGenericStar ? "" : (token.playerInfo?.acronym || (token.playerInfo ? getInitials(token.playerInfo.name, token.playerInfo.parentRoster?.name) : (token.number?.toString() || "")));
  
  // Tooltip position state
  const [tooltipPos, setTooltipPos] = React.useState<{ x: number, y: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (isOverlay || !token.playerInfo) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ 
      x: rect.left + rect.width / 2, 
      y: rect.top 
    });
  };

  const handleMouseLeave = () => setTooltipPos(null);

  // Formatter pour le prix
  const formatCost = (cost: any) => {
    if (!cost || cost === 0) return "Variable";
    const num = parseInt(cost.toString().replace(/[^0-9]/g, ''));
    if (isNaN(num)) return cost;
    return `${Math.floor(num / 1000)}k`;
  };
  
  const style: React.CSSProperties = {
    zIndex: (isBall ? 70 : 10),
    cursor: 'pointer'
  };

  const visualStyle: React.CSSProperties = {
    transform: isOverlay ? 'none' : `rotate(${-rotation}deg)`,
  };

  return (
    <div 
      ref={containerRef}
      style={style} 
      className={`token-container ${token.type} ${token.status} ${token.location} ${isOverlay ? 'overlay' : ''} ${isBall ? 'ball-token' : 'player-token'} ${isSelected ? 'selected' : ''} ${(token.id.includes('-star-') || token.playerInfo?.name === "Star Player") ? 'is-star-player' : ''}`}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="token-inner" style={visualStyle}>
        {isBall ? (
          <div className="ball-icon">
            <BallGraphic />
          </div>
        ) : (
          <div className="token-visual">
            <div className="token-base">
               {isGenericStar || token.id.includes('-star-') ? (
                 <StarGraphic team={token.type as 'blue' | 'red'} size={50} initial={initial} />
               ) : (
                 initial && <span className="token-number">{initial}</span>
               )}
            </div>

            {showTooltip && tooltipPos && token.playerInfo && createPortal(
              <div 
                className="token-stats-hover portal-tooltip" 
                style={{ 
                  left: `${tooltipPos.x}px`, 
                  top: `${tooltipPos.y - 12}px`,
                  transform: 'translateX(-50%) translateY(-100%)'
                }}
              >
                <div className="tooltip-header">
                  <span className="player-name-full">{token.playerInfo.name}</span>
                  <span className="player-cost-badge">{formatCost(token.playerInfo.cost)}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-val">{token.playerInfo.ma}</span>
                  <span className="stat-val">{token.playerInfo.st}</span>
                  <span className="stat-val">{token.playerInfo.ag}</span>
                  <span className="stat-val">{token.playerInfo.pa}</span>
                  <span className="stat-val">{token.playerInfo.av}</span>
                </div>
                <div className="stat-labels">
                  <span>MA</span><span>ST</span><span>AG</span><span>PA</span><span>AR</span>
                </div>
                {token.playerInfo.skills && token.playerInfo.skills.length > 0 && (
                  <div className="tooltip-skills">
                    {token.playerInfo.skills.join(', ')}
                  </div>
                )}
              </div>,
              document.body
            )}
            
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

function BallGraphic({ size = "100%" }: { size?: number | string }) {
  // Un ballon de Blood Bowl se doit d'être agressif (piques) et en cuir
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      {/* Piques du ballon */}
      <path d="M16 2L18 6L14 6L16 2Z" fill="#94a3b8" /> {/* Haut */}
      <path d="M16 30L14 26L18 26L16 30Z" fill="#94a3b8" /> {/* Bas */}
      <path d="M2 16L6 14L6 18L2 16Z" fill="#94a3b8" /> {/* Gauche */}
      <path d="M30 16L26 18L26 14L30 16Z" fill="#94a3b8" /> {/* Droite */}
      
      {/* Corps du ballon (Ovale cuir) */}
      <ellipse cx="16" cy="16" rx="10" ry="13" fill="#6d3a1a" stroke="#4a2510" strokeWidth="1" />
      
      {/* Lacets blancs */}
      <path d="M16 8V24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 11H19" stroke="white" strokeWidth="1" />
      <path d="M13 14H19" stroke="white" strokeWidth="1" />
      <path d="M13 17H19" stroke="white" strokeWidth="1" />
      <path d="M13 20H19" stroke="white" strokeWidth="1" />
      
      {/* Reflet cuir */}
      <path d="M11 12C10 14 10 18 11 20" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
    </svg>
  );
}

function StarGraphic({ team, size, initial }: { team: 'blue' | 'red', size: number, initial: string }) {
  const color = team === 'blue' ? '#1e40af' : '#991b1b';
  const borderColor = team === 'blue' ? '#3b82f6' : '#ef4444';
  
  return (
    <div className="star-graphic-container" style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M12 0.5L15.3 8L23.5 9L17.5 14.5L19 22.5L12 18.5L5 22.5L6.5 14.5L0.5 9L8.7 8L12 0.5Z" 
          fill={color} 
          stroke={borderColor} 
          strokeWidth="1.2" 
          strokeLinejoin="round" 
        />
      </svg>
      {initial && (
        <span className="token-number" style={{ position: 'absolute', top: '53%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.85rem', textShadow: '1px 1px 0 rgba(0,0,0,0.8)' }}>
          {initial}
        </span>
      )}
    </div>
  );
}

export default Token;
