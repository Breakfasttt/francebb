"use client";

/**
 * Choix de plusieurs ligues : ligues référencées sur le site (recherche) et ligues en saisie libre.
 * Utilisé par l'inscription (onboarding) et par l'édition du profil. Il n'envoie rien lui-même : il ajoute au
 * formulaire qui l'entoure des champs cachés (`ligueIds`, un par ligue référencée, et `ligueCustom`, les ligues
 * libres séparées par des virgules).
 * Refonte (carte 091, ADR 0006) : composants et couleurs v2 de packages/ui, champs de 44 pixels de haut en
 * 16 pixels de texte, les deux champs empilés sur téléphone. Le comportement n'a pas changé.
 */
import { useState, useRef, useEffect, useId } from "react";
import { Search, X, Shield, Plus, Loader2 } from "lucide-react";
import { Button, Input, Label } from "@bbfrance/ui";
import { searchLiguesAction } from "@/app/ligues/actions";

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
  const fieldId = useId();

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

  /** Pastille d'une ligue choisie, avec sa croix de retrait (44 pixels pour le pouce). */
  const tag = "inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full border border-bb-border bg-bb-surface-2 pl-3 text-sm text-bb-text";

  return (
    <div className="flex flex-col gap-4" ref={containerRef}>
      {/* Champs cachés pour le formulaire */}
      {selectedLigues.map(l => (
        <input key={l.id} type="hidden" name={nameIds} value={l.id} />
      ))}
      <input type="hidden" name={nameCustom} value={customLigues.join(", ")} />

      {/* Ligues choisies */}
      {(selectedLigues.length > 0 || customLigues.length > 0) && (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {selectedLigues.map(ligue => (
            <li key={ligue.id} className={tag}>
              <Shield size={14} className="shrink-0 text-bb-accent-text" aria-hidden="true" />
              <span className="truncate font-semibold">{ligue.acronym || ligue.name}</span>
              <Button type="button" variant="quiet" size="tap-icon" className="rounded-full" onClick={() => handleRemove(ligue.id)} aria-label={`Retirer ${ligue.acronym || ligue.name}`}>
                <X size={16} aria-hidden="true" />
              </Button>
            </li>
          ))}
          {customLigues.map(custom => (
            <li key={custom} className={`${tag} border-dashed`}>
              <span className="truncate italic">{custom}</span>
              <Button type="button" variant="quiet" size="tap-icon" className="rounded-full" onClick={() => handleRemoveCustom(custom)} aria-label={`Retirer ${custom}`}>
                <X size={16} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Les deux champs : côte à côte sur ordinateur, empilés sur téléphone */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recherche dans les ligues référencées */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${fieldId}-search`}>Ligue référencée</Label>
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bb-text-muted" aria-hidden="true" />
            <Input
              id={`${fieldId}-search`}
              type="text"
              className="pl-10"
              aria-label="Rechercher une ligue référencée"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              onFocus={() => query.length >= 2 && setShowResults(true)}
            />

            {(isLoading || (showResults && query.trim().length >= 2)) && (
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
                        {ligue.geographicalZone && <span className="text-sm text-bb-text-muted">{ligue.geographicalZone}</span>}
                      </span>
                    </Button>
                  ))
                ) : (
                  <p className="m-0 p-3 text-sm text-bb-text-muted">
                    Aucune ligue trouvée pour &quot;{query}&quot;.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Saisie libre, pour une ligue absente du site */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${fieldId}-custom`}>Autre (saisie libre)</Label>
          <div className="flex gap-2">
            <Input
              id={`${fieldId}-custom`}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDownCustom}
              aria-label="Autre ligue (saisie libre)"
              placeholder="Ex : Ligue locale..."
            />
            <Button type="button" variant="primary" size="tap-icon" className="shrink-0" onClick={handleAddCustom} aria-label="Ajouter cette ligue">
              <Plus size={20} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
