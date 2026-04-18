import React from "react";
import { TokenData } from "../page";
import Token from "./Token";
import "./Dugout.css";

interface DugoutProps {
  team: 'blue' | 'red';
  tokens: TokenData[];
  onTokenClick: (id: string) => void;
  onZoneClick: (zone: TokenData['location']) => void;
  selectedId: string | null;
  showTooltips?: boolean;
  allTokens?: TokenData[];
}

const Dugout: React.FC<DugoutProps> = ({ team, tokens, onTokenClick, onZoneClick, selectedId, showTooltips, allTokens = [] }) => {
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
            onTokenClick={onTokenClick}
            onZoneClick={() => onZoneClick(zone.id)}
            selectedId={selectedId}
            showTooltips={showTooltips}
            allTokens={allTokens}
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
  onTokenClick: (id: string) => void;
  onZoneClick: () => void;
  selectedId: string | null;
  showTooltips?: boolean;
  allTokens: TokenData[];
}

const DugoutZone: React.FC<ZoneProps> = ({ team, zone, tokens, onTokenClick, onZoneClick, selectedId, showTooltips, allTokens }) => {
  return (
    <div 
      className="dugout-zone"
      onClick={onZoneClick}
    >
      <span className="zone-label">{zone.label}</span>
      <div className="zone-tokens">
        {tokens.map(token => {
          const carriedBall = allTokens.find(t => t.type === 'ball' && t.attachedToId === token.id);
          return (
            <div key={token.id} className="token-wrapper">
              <Token 
                token={token} 
                showTooltip={showTooltips} 
                onClick={() => onTokenClick(token.id)} 
                isSelected={selectedId === token.id}
                hasBall={!!carriedBall}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dugout;
