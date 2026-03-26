import React from "react";
import { TokenType } from "../page";
import { User, Users, Goal, Eraser, MousePointer2 } from "lucide-react";
import "./Toolbar.css";

interface ToolbarProps {
  activeTool: TokenType | 'select' | 'eraser';
  onSelect: (tool: TokenType | 'select' | 'eraser') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onSelect }) => {
  const tools = [
    { id: 'select', icon: <MousePointer2 size={24} />, label: 'Sélection' },
    { id: 'blue', icon: <User size={24} color="#3b82f6" />, label: 'Joueur Bleu' },
    { id: 'red', icon: <User size={24} color="#ef4444" />, label: 'Joueur Rouge' },
    { id: 'ball', icon: <Goal size={24} color="#fbbf24" />, label: 'Ballon' },
    { id: 'eraser', icon: <Eraser size={24} />, label: 'Gomme' },
  ];

  return (
    <div className="tool-toolbar">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`toolbar-item ${activeTool === tool.id ? 'active' : ''}`}
          onClick={() => onSelect(tool.id as any)}
          title={tool.label}
        >
          {tool.icon}
          <span className="tooltip">{tool.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Toolbar;
