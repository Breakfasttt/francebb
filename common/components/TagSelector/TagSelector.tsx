"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Tag as TagIcon, Plus } from "lucide-react";
import "./TagSelector.css";

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  value,
  onChange,
  suggestions = [],
  placeholder = "Ajouter un tag...",
  className = ""
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrer les suggestions en fonction de la saisie
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter(
        s => s.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s)
      ).slice(0, 5); // Max 5 suggestions pour rester propre
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, suggestions, value]);

  // Fermer les suggestions si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className={`tag-selector-container ${className}`} ref={dropdownRef}>
      <div className="tag-selector-input-area">
        {/* Affichage des badges avant l'input ou au dessus ? 
            L'utilisateur demande "au dessus (ou en dessous)", 
            je vais le mettre au dessus pour plus de visibilité. */}
        {value.length > 0 && (
          <div className="selected-tags-badge-list">
            {value.map(tag => (
              <span key={tag} className="tag-badge-removable">
                <TagIcon size={12} strokeWidth={3} />
                {tag}
                <button 
                  type="button" 
                  onClick={() => removeTag(tag)}
                  className="remove-tag-btn"
                  title="Supprimer le tag"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="tag-input-wrapper">
          <TagIcon className="tag-field-icon" size={18} />
          <input
            type="text"
            className="tag-main-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.trim() && filteredSuggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
          />
          {inputValue.trim() && (
             <button 
                type="button" 
                className="add-quick-tag-btn" 
                onClick={() => addTag(inputValue)}
                title="Ajouter ce tag"
             >
                <Plus size={16} />
             </button>
          )}
        </div>

        {/* Liste des suggestions */}
        {showSuggestions && (
          <div className="tag-suggestions-dropdown">
            <div className="suggestions-header">Tags existants suggérés :</div>
            {filteredSuggestions.map(tag => (
              <button
                key={tag}
                type="button"
                className="suggestion-item"
                onClick={() => addTag(tag)}
              >
                <TagIcon size={14} className="suggestion-icon" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelector;
