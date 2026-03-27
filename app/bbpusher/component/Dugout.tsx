import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { TokenData } from "../page";
import Token from "./Token";
import "./Dugout.css";

interface DugoutProps {
  team: 'blue' | 'red';
  tokens: TokenData[];
  activeId: string | null;
  showTooltips?: boolean;
}

const Dugout: React.FC<DugoutProps> = ({ team, tokens, activeId, showTooltips }) => {
  const zones: { id: TokenData['location']; label: string }[] = [
    { id: 'reserve', label: 'Réserves' },
    { id: 'ko', label: 'K.O.' },
    { id: 'injured', label: 'Blessés' },
    { id: 'expelled', label: 'Exclus' },
  ];

  return (
    <div className={`dugout team-${team} glass`}>
      <h3 className="dugout-title">{team === 'blue' ? 'Fosse Bleue' : 'Fosse Rouge'}</h3>
      <div className="dugout-zones">
        {zones.map(zone => (
          <DugoutZone 
            key={zone.id} 
            team={team} 
            zone={zone} 
            tokens={tokens.filter(t => t.location === zone.id)} 
            activeId={activeId}
            showTooltips={showTooltips}
          />
        ))}
      </div>
    </div>
  );
};

interface ZoneProps {
  team: string;
  zone: { id: TokenData['location']; label: string };
  tokens: TokenData[];
  activeId: string | null;
  showTooltips?: boolean;
}

const DugoutZone: React.FC<ZoneProps> = ({ team, zone, tokens, activeId, showTooltips }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `dugout-${team}-${zone.id}`,
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`dugout-zone ${isOver ? 'drag-over' : ''}`}
    >
      <span className="zone-label">{zone.label}</span>
      <div className="zone-tokens">
        {tokens.map(token => (
          <div key={token.id} className="token-wrapper" style={{ 
            opacity: token.id === activeId ? 0 : 1,
            visibility: token.id === activeId ? 'hidden' : 'visible' 
          }}>
            <Token token={token} showTooltip={showTooltips} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dugout;
