import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TokenData, PlayerRosterInfo } from '../page';
import Token from './Token';
import './FigurineBox.css';

interface FigurineBoxProps {
  team: 'blue' | 'red';
  roster: PlayerRosterInfo[];
  tokens: TokenData[]; // Tokens currently in the box
  rosterList: { name: string; file: string }[];
  onRosterSelect: (file: string) => void;
  isLoading?: boolean;
  showTooltips?: boolean;
}

const FigurineBox: React.FC<FigurineBoxProps> = ({ 
  team, 
  roster, 
  tokens, 
  rosterList, 
  onRosterSelect, 
  isLoading,
  showTooltips
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `box-${team}`,
  });

  return (
    <div ref={setNodeRef} className={`figurine-box ${team} ${isOver ? 'drag-over' : ''} ${isLoading ? 'loading' : ''}`}>
      <div className="box-header">
        <label>{team === 'blue' ? 'Équipe Bleue' : 'Équipe Rouge'}</label>
        <select 
          onChange={(e) => onRosterSelect(e.target.value)} 
          defaultValue=""
          className="roster-select-box"
        >
          <option value="" disabled>Choisir Roster</option>
          {rosterList.map(r => (
            <option key={`${team}-${r.file}`} value={r.file}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="box-content">
        {roster.length === 0 ? (
          <div className="empty-message">Sélectionnez un roster pour commencer</div>
        ) : (
          [...roster].sort((a, b) => {
            const maxA = Math.max(...a.qty.split('-').map(Number));
            const maxB = Math.max(...b.qty.split('-').map(Number));
            return maxA - maxB;
          }).map((player, idx) => {
            const playerTokens = tokens.filter(t => t.playerInfo?.name === player.name);
            return (
              <div key={`${player.name}-${idx}`} className="player-type-section">
                <div className="player-type-info">
                  <span className="player-name">{player.name}</span>
                  <span className="player-qty">({player.qty})</span>
                </div>
                <div className="tokens-list">
                  {playerTokens.map(token => (
                    <Token 
                      key={token.id} 
                      token={token} 
                      showTooltip={showTooltips}
                    />
                  ))}
                  {playerTokens.length === 0 && <div className="empty-slot">Vidé</div>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FigurineBox;
