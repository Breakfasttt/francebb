"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Button, Input, cn } from "@bbfrance/ui";
import UserAvatar, { Rank } from "@/common/components/UserAvatar/UserAvatar";
import { searchUsersAction } from "@/app/forum/actions";

interface User {
  id: string;
  name: string | null;
  image: string | null;
  avatarFrame?: Rank | null;
}

interface UserMapperProps {
  selectedUser: User | null;
  onSelect: (user: User) => void;
  onRemove: () => void;
  placeholder?: string;
  className?: string;
}

export default function UserMapper({ 
  selectedUser, 
  onSelect, 
  onRemove, 
  placeholder = "Rechercher...",
  className = ""
}: UserMapperProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const data = (await searchUsersAction(query)) as any[];
          setResults(data);
          setShowResults(true);
        } catch (error) {
          console.error("User search failed", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

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

  const handleSelect = (user: User) => {
    onSelect(user);
    setQuery("");
    setShowResults(false);
  };

  // Lie une ligne (résultat de tournoi, archive du classement) à un membre du site. Apparence de la refonte
  // (carte 101) : le membre choisi en pastille avec sa croix, puis le champ de recherche ; tout fait 44 pixels de haut
  // et le champ passe à la ligne s'il manque de place.
  return (
    <div className={cn("relative flex w-full min-w-0 flex-wrap items-center gap-1", className)} ref={containerRef}>
      {selectedUser && (
        <div className="inline-flex min-h-11 max-w-full min-w-0 items-center gap-1.5 rounded-bb-md border border-bb-border bg-bb-accent-soft pl-2 text-sm font-semibold text-bb-text">
          <UserAvatar image={selectedUser.image} name={selectedUser.name || ""} size={24} selectedRank={selectedUser.avatarFrame as Rank} />
          <span className="min-w-0 truncate">{selectedUser.name}</span>
          <Button
            type="button"
            variant="quiet"
            size="tap-icon"
            className="shrink-0"
            aria-label={`Délier ${selectedUser.name || "ce membre"}`}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          >
            <X size={14} aria-hidden="true" />
          </Button>
        </div>
      )}

      <div className="relative min-w-0 flex-1 basis-32">
        <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bb-text-muted" aria-hidden="true" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="min-w-0 pl-9"
        />
        {isLoading && <Loader2 size={16} className="absolute top-1/2 right-3 -translate-y-1/2 animate-spin text-bb-text-muted" aria-label="Recherche en cours" />}

        {showResults && (results.length > 0 || query.length >= 2) && (
          <div className="absolute inset-x-0 top-full z-20 mt-1 max-h-60 min-w-48 overflow-y-auto rounded-bb-md border border-bb-border bg-bb-surface p-1 shadow-bb">
            {results.length > 0 ? (
              results.map(user => (
                <Button
                  key={user.id}
                  type="button"
                  variant="quiet"
                  size="tap"
                  className="w-full justify-start gap-2 py-1.5 text-left text-sm font-semibold whitespace-normal text-bb-text"
                  onClick={() => handleSelect(user)}
                >
                  <UserAvatar image={user.image} name={user.name || ""} size={24} selectedRank={user.avatarFrame as Rank} />
                  <span>{user.name}</span>
                </Button>
              ))
            ) : !isLoading ? (
              <p className="m-0 p-3 text-center text-sm text-bb-text-muted">Aucun utilisateur</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
