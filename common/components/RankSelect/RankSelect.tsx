"use client";

import { useState, useRef, useEffect } from "react";
import { Lock, ChevronDown } from "lucide-react";
import "./RankSelect.css";

interface RankOption {
  id: string;
  label: string;
  min?: number;
}

const RANKS_LIST: RankOption[] = [
  { id: "auto", label: "Automatique (par défaut)" },
  { id: "none", label: "Aucun contour" },
  { id: "bronze", label: "Bronze", min: 100 },
  { id: "silver", label: "Argent", min: 300 },
  { id: "gold", label: "Or", min: 700 },
  { id: "platinum", label: "Platine", min: 1000 },
  { id: "diamond", label: "Diamant", min: 2000 },
  { id: "master", label: "Master", min: 4000 },
  { id: "grand-master", label: "Grand Master", min: 10000 },
];

export default function RankSelect({ value, onSelect, postCount }: { value: string, onSelect: (v: string) => void, postCount: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selected = RANKS_LIST.find(r => r.id === value) || RANKS_LIST[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="rank-custom-select" ref={dropdownRef}>
      <input type="hidden" name="avatarFrame" value={value} />
      
      <div className={`rank-select-trigger ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span className="current-label">{selected.label}</span>
        <ChevronDown size={16} className={`arrow ${isOpen ? 'rotated' : ''}`} />
      </div>

      {isOpen && (
        <div className="rank-select-dropdown fade-in">
          {RANKS_LIST.map((rank) => {
            const isLocked = rank.min && postCount < rank.min;
            const isSelected = value === rank.id;

            return (
              <div 
                key={rank.id} 
                className={`rank-item-option ${isLocked ? 'locked' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => !isLocked && (onSelect(rank.id), setIsOpen(false))}
              >
                <div className="rank-item-info">
                  <div className="rank-item-text">
                    {isLocked && <Lock size={12} className="lock-icon" />}
                    <span className="rank-item-label">{rank.label}</span>
                    {isLocked && rank.min !== undefined && <span className="rank-item-min">{rank.min - postCount} msg restants (Pallier: {rank.min})</span>}
                  </div>
                  {!isLocked && rank.id !== 'auto' && rank.id !== 'none' && (
                    <div className="rank-line-preview-container">
                        <div className={`rank-line-preview rank-${rank.id}`} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
