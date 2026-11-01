"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Shield, Loader2 } from "lucide-react";
import { Button, Input } from "@bbfrance/ui";
import { searchLiguesAction } from "@/app/ligues/actions";

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
  /** Identifiant du champ de recherche, pour le relier à un libellé (`<Label htmlFor>`, carte 095). */
  inputId?: string;
  onChange?: (ligueId: string | null, ligueCustom: string | null) => void;
}

export default function LigueSearch({ 
  initialLigue, 
  initialCustom,
  placeholder = "Rechercher une ligue...",
  nameId = "ligueId",
  nameCustom = "ligueCustom",
  inputId,
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

  // Apparence de la refonte (carte 101), sur le modèle de MultiLigueSearch : champ de packages/ui, liste de résultats
  // en boutons de 44 pixels, croix de retrait nommée pour les lecteurs d'écran.
  return (
    <div className="relative flex flex-col gap-2" ref={containerRef}>
      <input type="hidden" name={nameId} value={selectedLigue?.id || ""} />
      <input type="hidden" name={nameCustom} value={selectedLigue ? "" : query} />

      {selectedLigue ? (
        <div className="flex min-h-11 items-center gap-3 rounded-bb-md border border-bb-border bg-bb-surface-2 py-1 pr-1 pl-3 text-bb-text">
          <Shield size={18} className="shrink-0 text-bb-accent-text" aria-hidden="true" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-semibold break-words">{selectedLigue.name} ({selectedLigue.acronym})</span>
            {selectedLigue.geographicalZone && <span className="text-sm text-bb-text-muted">{selectedLigue.geographicalZone}</span>}
          </div>
          <Button type="button" variant="quiet" size="tap-icon" className="shrink-0 rounded-full" onClick={handleClear} aria-label={`Retirer ${selectedLigue.acronym || selectedLigue.name}`}>
            <X size={16} aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bb-text-muted" aria-hidden="true" />
          <Input
            id={inputId}
            type="text"
            className="pl-10"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            onFocus={() => query.length >= 2 && setShowResults(true)}
          />
        </div>
      )}

      {(isLoading || (showResults && query.length >= 2)) && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-bb-md border border-bb-border bg-bb-surface p-1 shadow-bb">
          {isLoading ? (
            <p className="m-0 flex items-center gap-2 p-3 text-sm text-bb-text-muted">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Recherche en cours...
            </p>
          ) : results.length > 0 ? (
            results.map(ligue => (
              <Button
                key={ligue.id}
                type="button"
                variant="quiet"
                size="tap"
                className="w-full justify-start gap-3 py-2 text-left font-normal whitespace-normal text-bb-text"
                onClick={() => handleSelect(ligue)}
              >
                <Shield size={16} className="shrink-0 text-bb-accent-text" aria-hidden="true" />
                <span className="flex min-w-0 flex-col">
                  <span className="font-semibold">{ligue.name} ({ligue.acronym})</span>
                  <span className="text-sm text-bb-text-muted">{[ligue.geographicalZone, ligue.region].filter(Boolean).join(" - ")}</span>
                </span>
              </Button>
            ))
          ) : (
            <p className="m-0 p-3 text-sm text-bb-text-muted">
              Aucune ligue trouvée &quot;{query}&quot;.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
