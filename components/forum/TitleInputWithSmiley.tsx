"use client";

import SmileyPicker from "./SmileyPicker";
import { useRef, useState } from "react";
import { parseInlineBBCode } from "@/lib/bbcode";

export default function TitleInputWithSmiley() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [titleValue, setTitleValue] = useState("");

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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          id="title"
          name="title"
          required
          ref={inputRef}
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          placeholder="Ex: Rechercher des joueurs, Stratégies Elfes..."
          style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '1rem' }}
        />
        <div style={{ alignSelf: 'stretch', display: 'flex' }}>
          <SmileyPicker onSelect={handleSmileySelect} />
        </div>
      </div>
      
      {/* Title Live Preview */}
      {titleValue && titleValue.trim() !== "" && (
        <div style={{ 
          marginTop: '0.2rem', 
          padding: '0.8rem 1rem', 
          background: 'rgba(0,0,0,0.2)', 
          borderRadius: '8px', 
          color: '#ccc',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          borderLeft: '4px solid var(--primary)'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.2rem', fontWeight: 'normal' }}>Aperçu du titre :</span>
          <span dangerouslySetInnerHTML={{ __html: parseInlineBBCode(titleValue) }} />
        </div>
      )}
    </div>
  );
}

