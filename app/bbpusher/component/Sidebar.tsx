import React from "react";
import { TokenData, TokenType } from "../page";
import "./Sidebar.css";
import "./Sidebar-mobile.css";


interface SidebarProps {
  tokens: TokenData[];
  activeTool: string;
  onToolSelect: (tool: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ tokens, activeTool, onToolSelect }) => {
  // Areas like Reserves, KO, CAS
  // For now simple placeholder for team stats
  const blueCount = tokens.filter(t => t.type === 'blue').length;
  const redCount = tokens.filter(t => t.type === 'red').length;

  return (
    <aside className="tool-sidebar">
      <div className="sidebar-section">
        <h3>Équipes</h3>
        
        <div className="team-stat blue">
          <div className="team-ident color-blueText">Bleu</div>
          <div className="count">{blueCount} / 11</div>
        </div>

        <div className="team-stat red">
          <div className="team-ident color-redText">Rouge</div>
          <div className="count">{redCount} / 11</div>
        </div>
      </div>

      <div className="sidebar-section instructions">
        <h3>Aide</h3>
        <ul>
          <li><strong>Placer :</strong> Sélectionnez un outil et cliquez sur une case.</li>
          <li><strong>Déplacer :</strong> Glissez-déposez un pion.</li>
          <li><strong>État :</strong> Cliquez sur un joueur pour changer son état (Debout, Couché, Sonné).</li>
          <li><strong>Gomme :</strong> Utilisez la gomme pour supprimer un pion.</li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
