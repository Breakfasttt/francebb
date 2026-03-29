"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Shield } from "lucide-react";
import { searchLiguesAction } from "@/app/ligues/actions";
import "./LigueSearch.css";

interface Ligue {
  id: string;
  name: string;
  acronym: string;
  region: string | null;
  geographicalZone: string | null;
}

interface LigueSearchProps {
  initialLigue?: Ligue | null;
  initialCustom?: string | null;
  placeholder?: string;
  nameId?: string;
  nameCustom?: string;
  onChange?: (ligueId: string | null, ligueCustom: string | null) => void;
}

export default function LigueSearch({ 
  initialLigue, 
  initialCustom,
  placeholder = "Rechercher une ligue...",
  nameId = "ligueId",
  nameCustom = "ligueCustom",
  onChange
}: LigueSearchProps) {
  const [query, setQuery] = useState(initialCustom || "");
  const [selectedLigue, setSelectedLigue] = useState<Ligue | null>(initialLigue || null);
  const [results, setResults] = useState<Ligue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2 && !selectedLigue) {
        setIsLoading(true);
        const data = await searchLiguesAction(query);
        setResults(data as Ligue[]);
        setIsLoading(false);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedLigue]);

  // Fermer les résultats si on clique ailleurs
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
    setSelectedLigue(ligue);
    setQuery("");
    setShowResults(false);
    if (onChange) onChange(ligue.id, null);
  };

  const handleClear = () => {
    setSelectedLigue(null);
    setQuery("");
    if (onChange) onChange(null, "");
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (onChange) onChange(null, val);
  };

  return (
    <div className="ligue-search-container" ref={containerRef}>
      <input type="hidden" name={nameId} value={selectedLigue?.id || ""} />
      <input type="hidden" name={nameCustom} value={selectedLigue ? "" : query} />

      {selectedLigue ? (
        <div className="selected-ligue-tag">
          <Shield size={18} className="ligue-icon" />
          <div className="ligue-info">
            <span className="ligue-name">{selectedLigue.name} ({selectedLigue.acronym})</span>
            {selectedLigue.geographicalZone && <span className="ligue-zone">{selectedLigue.geographicalZone}</span>}
          </div>
          <button type="button" className="remove-ligue-btn" onClick={handleClear}>
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="ligue-search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="ligue-search-input"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            onFocus={() => query.length >= 2 && setShowResults(true)}
          />
          {isLoading && <div className="loading-spinner">⏳</div>}
        </div>
      )}

      {isLoading && (
         <div className="ligue-search-results">
           <div className="no-results">Recherche en cours...</div>
         </div>
      )}

      {showResults && results.length > 0 && (
        <div className="ligue-search-results">
          {results.map(ligue => (
            <div key={ligue.id} className="ligue-result-item" onClick={() => handleSelect(ligue)}>
              <Shield size={16} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600 }}>{ligue.name} ({ligue.acronym})</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ligue.geographicalZone} - {ligue.region}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && query.length >= 2 && !isLoading && (
        <div className="ligue-search-results">
          <div className="no-results">
            Aucune ligue trouvée &quot;{query}&quot;.
          </div>
        </div>
      )}
    </div>
  );
}
