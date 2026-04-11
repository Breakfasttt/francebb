"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Shield, Plus } from "lucide-react";
import { searchLiguesAction } from "@/app/ligues/actions";
import "../LigueSearch/LigueSearch.css";

interface Ligue {
  id: string;
  name: string;
  acronym: string;
  geographicalZone: string | null;
  region: string | null;
}

interface MultiLigueSearchProps {
  initialLigues?: Ligue[];
  initialCustom?: string | null;
  placeholder?: string;
  nameIds?: string;
  nameCustom?: string;
}

export default function MultiLigueSearch({ 
  initialLigues = [], 
  initialCustom = "",
  placeholder = "Ajouter une ligue...",
  nameIds = "ligueIds",
  nameCustom = "ligueCustom",
}: MultiLigueSearchProps) {
  const [selectedLigues, setSelectedLigues] = useState<Ligue[]>(initialLigues);
  const [customLigues, setCustomLigues] = useState<string[]>(
    initialCustom ? initialCustom.split(",").map(s => s.trim()).filter(Boolean) : []
  );
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Ligue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        const data = await searchLiguesAction(query);
        const filtered = (data as Ligue[]).filter(l => !selectedLigues.find(s => s.id === l.id));
        setResults(filtered);
        setIsLoading(false);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedLigues]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (ligue: Ligue) => {
    if (!selectedLigues.find(l => l.id === ligue.id)) {
      setSelectedLigues(prev => [...prev, ligue]);
    }
    setQuery("");
    setShowResults(false);
  };

  const handleRemove = (id: string) => {
    setSelectedLigues(prev => prev.filter(l => l.id !== id));
  };

  const handleAddCustom = () => {
    const val = inputValue.trim();
    if (val && !customLigues.includes(val)) {
      setCustomLigues(prev => [...prev, val]);
      setInputValue("");
    }
  };

  const handleRemoveCustom = (val: string) => {
    setCustomLigues(prev => prev.filter(c => c !== val));
  };

  const handleKeyDownCustom = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustom();
    }
  };

  return (
    <div className="multi-ligue-search-container" ref={containerRef}>
      {/* Champs cachés pour le formulaire */}
      {selectedLigues.map(l => (
        <input key={l.id} type="hidden" name={nameIds} value={l.id} />
      ))}
      <input type="hidden" name={nameCustom} value={customLigues.join(", ")} />

      {/* Liste des badges (tags) */}
      <div className="selected-ligues-list" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {selectedLigues.map(ligue => (
          <div key={ligue.id} className="selected-ligue-tag" style={{ margin: 0, padding: "0.4rem 0.8rem", height: "auto" }}>
            <Shield size={14} className="ligue-icon" />
            <span style={{ fontSize: "0.85rem" }}>{ligue.acronym || ligue.name}</span>
            <button type="button" onClick={() => handleRemove(ligue.id)} className="remove-ligue-btn">
              <X size={12} />
            </button>
          </div>
        ))}

        {customLigues.map(custom => (
          <div key={custom} className="selected-ligue-tag" style={{ 
            margin: 0, 
            padding: "0.4rem 0.8rem", 
            height: "auto", 
            background: "rgba(255, 255, 255, 0.05)",
            borderStyle: "dashed",
            borderColor: "var(--text-muted)"
          }}>
            <span style={{ fontSize: "0.85rem", fontStyle: "italic" }}>{custom}</span>
            <button type="button" onClick={() => handleRemoveCustom(custom)} className="remove-ligue-btn">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Grille de saisie côte à côte */}
      <div className="ligue-inputs-grid" style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "1.5rem" 
      }}>
        {/* Colonne 1: Recherche référencée */}
        <div className="form-group-sub">
          <label style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700 }}>
            Ligue référencée
          </label>
          <div className="ligue-search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="ligue-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              onFocus={() => query.length >= 2 && setShowResults(true)}
              style={{ height: "42px", paddingLeft: "2.5rem" }}
            />
            
            {isLoading && (
              <div className="ligue-search-results" style={{ top: "100%", marginTop: "5px" }}>
                <div className="no-results">Recherche en cours...</div>
              </div>
            )}

            {showResults && results.length > 0 && (
              <div className="ligue-search-results" style={{ top: "100%", marginTop: "5px" }}>
                {results.map(ligue => (
                  <div key={ligue.id} className="ligue-result-item" onClick={() => handleSelect(ligue)}>
                    <Shield size={16} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 600 }}>{ligue.name} ({ligue.acronym})</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{ligue.geographicalZone}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showResults && results.length === 0 && query.trim().length >= 2 && !isLoading && (
              <div className="ligue-search-results" style={{ top: "100%", marginTop: "5px" }}>
                <div className="no-results">
                  Aucune ligue trouvée pour &quot;{query}&quot;.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Colonne 2: Saisie libre */}
        <div className="form-group-sub">
          <label style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700 }}>
            Autre (Saisie libre)
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input 
              type="text" 
              className="ligue-search-input" 
              style={{ paddingLeft: "1rem", height: "42px", fontSize: "0.85rem" }} 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDownCustom}
              placeholder="Ex: Ligue locale..."
            />
            <button 
              type="button" 
              onClick={handleAddCustom}
              className="add-custom-btn"
              style={{
                background: "var(--primary)",
                border: "none",
                borderRadius: "8px",
                color: "white",
                padding: "0 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Responsive adjustments needed in CSS for ligue-inputs-grid if on small screens */}
      <style jsx>{`
        @media (max-width: 600px) {
          .ligue-inputs-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
