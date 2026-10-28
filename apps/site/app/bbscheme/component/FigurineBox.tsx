import React from 'react';
import { TokenData, PlayerRosterInfo } from '../page';
import Token from './Token';
import ClassicSelect from "@/common/components/Form/ClassicSelect";
import './FigurineBox.css';

interface FigurineBoxProps {
  team: 'blue' | 'red';
  roster: PlayerRosterInfo[];
  tokens: TokenData[]; 
  rosterList: { name: string; file: string }[];
  onRosterSelect: (file: string) => void;
  onTokenClick: (id: string) => void;
  onBoxClick: () => void;
  selectedId: string | null;
  rosterFile?: string;
  isLoading?: boolean;
  showTooltips?: boolean;
  allTokens?: TokenData[];
}

const FigurineBox: React.FC<FigurineBoxProps> = ({ 
  team, 
  roster, 
  tokens, 
  rosterList, 
  onRosterSelect, 
  onTokenClick,
  onBoxClick,
  selectedId,
  rosterFile,
  isLoading,
  showTooltips,
  allTokens = []
}) => {
  return (
    <div 
      className={`figurine-box ${team} ${isLoading ? 'loading' : ''}`}
      onClick={(e) => { 
        if ((e.target as HTMLElement).closest('.tokens-list') || (e.target as HTMLElement).closest('.box-header')) return; 
        onBoxClick(); 
      }}
    >
      <div className="box-header">
        <label>{team === 'blue' ? 'Réserve équipe bleue' : 'Réserve équipe rouge'}</label>
        <ClassicSelect 
          onChange={(e) => onRosterSelect(e.target.value)} 
          value={rosterFile || ""}
          size="sm"
          containerStyle={{ width: "160px" }}
        >
          <option value="">Aucun</option>
          {rosterList.map(r => (
            <option key={`${team}-${r.file}`} value={r.file}>
              {r.name}
            </option>
          ))}
        </ClassicSelect>
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
            const playerTokens = tokens.filter(t => {
              if (t.type !== team) return false;
              const isOnPitch = t.location === 'pitch';
              // FONCTIONNALITÉ FOSSES DÉSACTIVÉE : On affiche tout ce qui n'est pas sur le terrain
              // const isInDugout = ['ko', 'injured', 'expelled', 'reserve'].includes(t.location);
              // if (isOnPitch || (isInDugout && t.location !== 'reserve')) return false;
              if (isOnPitch) return false;

              return t.playerInfo?.name === player.name;
            });
            return (
              <div key={`${player.name}-${idx}`} className="player-type-section">
                <div className="player-type-info">
                  <span className="player-name">{player.name}</span>
                  <span className="player-qty">({player.qty})</span>
                </div>
                <div className="tokens-list">
                  {playerTokens.map(token => {
                    const carriedBall = allTokens.find(t => t.type === 'ball' && t.attachedToId === token.id);
                    return (
                      <Token 
                        key={token.id} 
                        token={token} 
                        showTooltip={showTooltips}
                        onClick={() => onTokenClick(token.id)}
                        isSelected={selectedId === token.id}
                        hasBall={!!carriedBall}
                      />
                    );
                  })}
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
