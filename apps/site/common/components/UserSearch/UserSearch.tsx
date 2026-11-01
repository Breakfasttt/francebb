"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Button, Input } from "@bbfrance/ui";
import UserAvatar, { Rank } from "@/common/components/UserAvatar/UserAvatar";
import { searchUsersAction } from "@/app/forum/actions";

interface User {
  id: string;
  name: string | null;
  image: string | null;
  avatarFrame: Rank | null;
}

interface UserSearchProps {
  selectedUsers: User[];
  onSelect: (user: User) => void;
  onRemove: (userId: string) => void;
  placeholder?: string;
  maxSelections?: number;
}

export default function UserSearch({ 
  selectedUsers, 
  onSelect, 
  onRemove, 
  placeholder = "Rechercher un utilisateur...",
  maxSelections = 5
}: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        const data = await searchUsersAction(query);
        // Filtrer les utilisateurs déjà sélectionnés
        const filtered = data.filter(u => !selectedUsers.some(s => s.id === u.id)) as User[];
        setResults(filtered);
        setIsLoading(false);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedUsers]);

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
    if (selectedUsers.length < maxSelections) {
      onSelect(user);
      setQuery("");
      setShowResults(false);
    }
  };

  const isFull = selectedUsers.length >= maxSelections;

  // Apparence de la refonte (carte 101), sur le modèle de MultiLigueSearch : pastilles des membres choisis avec une
  // croix de 44 pixels, champ de packages/ui, résultats en boutons.
  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      {selectedUsers.length > 0 && (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {selectedUsers.map(user => (
            <li key={user.id} className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-bb-border bg-bb-surface-2 pl-1.5 text-sm text-bb-text">
              <UserAvatar image={user.image} name={user.name || ""} size={28} selectedRank={user.avatarFrame} />
              <span className="truncate font-semibold">{user.name}</span>
              <Button type="button" variant="quiet" size="tap-icon" className="rounded-full" onClick={() => onRemove(user.id)} aria-label={`Retirer ${user.name || "ce membre"}`}>
                <X size={16} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <Search size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bb-text-muted" aria-hidden="true" />
        <Input
          type="text"
          className="pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isFull ? "Limite atteinte" : placeholder}
          disabled={isFull}
          onFocus={() => query.length >= 2 && setShowResults(true)}
        />
        {isLoading && <Loader2 size={16} className="absolute top-1/2 right-3 -translate-y-1/2 animate-spin text-bb-text-muted" aria-label="Recherche en cours" />}

        {showResults && query.length >= 2 && !isLoading && (
          <div className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-bb-md border border-bb-border bg-bb-surface p-1 shadow-bb">
            {results.length > 0 ? (
              results.map(user => (
                <Button
                  key={user.id}
                  type="button"
                  variant="quiet"
                  size="tap"
                  className="w-full justify-start gap-3 py-1.5 text-left font-semibold whitespace-normal text-bb-text"
                  onClick={() => handleSelect(user)}
                >
                  <UserAvatar image={user.image} name={user.name || ""} size={32} selectedRank={user.avatarFrame} />
                  <span>{user.name}</span>
                </Button>
              ))
            ) : (
              <p className="m-0 p-3 text-center text-sm text-bb-text-muted">Aucun utilisateur trouvé</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
