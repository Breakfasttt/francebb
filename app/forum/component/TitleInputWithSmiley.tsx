"use client";

import { useRef, useState } from "react";
import { parseInlineBBCode } from "@/lib/bbcode";
import { Smile } from "lucide-react";
import SmileyGrid from "@/common/components/SmileyGrid/SmileyGrid";

interface TitleInputWithSmileyProps {
  initialValue?: string;
  name?: string;
  placeholder?: string;
}

export default function TitleInputWithSmiley({ 
  initialValue = "", 
  name = "title", 
  placeholder = "Ex: Rechercher des joueurs, Stratégies Elfes..." 
}: TitleInputWithSmileyProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [titleValue, setTitleValue] = useState(initialValue);
  const [isSmileyOpen, setIsSmileyOpen] = useState(false);

  const handleSmileySelect = (code: string) => {
    if (!inputRef.current) return;
    
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const currentVal = inputRef.current.value;
    
    const newVal = currentVal.substring(0, start) + code + currentVal.substring(end);
    inputRef.current.value = newVal;
    setTitleValue(newVal);
    
    inputRef.current.focus();
    const newPos = start + code.length;
    inputRef.current.setSelectionRange(newPos, newPos);
    setIsSmileyOpen(false); // Auto-close after selection
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
        <button
          type="button"
          onClick={() => setIsSmileyOpen(!isSmileyOpen)}
          className={`widget-button ${isSmileyOpen ? 'active' : 'secondary-btn'}`}
          style={{ width: 'auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}
          title="Insérer un smiley"
        >
          <Smile size={20} />
        </button>
        <input
          type="text"
          id="title"
          name={name}
          required
          ref={inputRef}
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          placeholder="Ex: Rechercher des joueurs, Stratégies Elfes..."
          style={{ 
            flex: 1, 
            padding: '0.8rem', 
            background: 'var(--glass-bg, rgba(0,0,0,0.03))', 
            border: '1px solid var(--glass-border)', 
            borderRadius: '8px', 
            color: 'var(--foreground)', 
            fontSize: '1rem', 
            height: '100%', 
            minHeight: '45px' 
          }}
        />
      </div>

      {isSmileyOpen && (
        <div className="active-tool-panel" style={{ background: "var(--card-bg)", padding: "1rem", border: "1px solid var(--glass-border)", borderRadius: "8px" }}>
          <SmileyGrid onSelect={handleSmileySelect} />
        </div>
      )}
      
      {/* Title Live Preview */}
      {titleValue && titleValue.trim() !== "" && (
        <div style={{ 
          marginTop: '0.2rem', 
          padding: '0.8rem 1rem', 
          background: 'var(--primary-transparent)', 
          borderRadius: '8px', 
          color: 'var(--foreground)',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          borderLeft: '4px solid var(--primary)'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', fontWeight: 'normal' }}>Aperçu du titre :</span>
          <span dangerouslySetInnerHTML={{ __html: parseInlineBBCode(titleValue) }} />
        </div>
      )}
    </div>
  );
}

