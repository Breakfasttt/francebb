"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, User as UserIcon } from "lucide-react";
import UserAvatar, { Rank } from "@/common/components/UserAvatar/UserAvatar";
import { searchUsersAction } from "@/app/forum/actions";
import "./UserSearch.css";

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

  return (
    <div className="user-search-container" ref={containerRef}>
      <div className="selected-users">
        {selectedUsers.map(user => (
          <div key={user.id} className="selected-user-tag">
            <UserAvatar image={user.image} name={user.name || ""} size={24} selectedRank={user.avatarFrame} />
            <span>{user.name}</span>
            <button type="button" className="remove-user-btn" onClick={() => onRemove(user.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="user-search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={selectedUsers.length >= maxSelections ? "Limite atteinte" : placeholder}
          disabled={selectedUsers.length >= maxSelections}
          onFocus={() => query.length >= 2 && setShowResults(true)}
        />
        {isLoading && <div style={{ position: 'absolute', right: '1rem', scale: '0.8' }}>⏳</div>}
      </div>

      {showResults && results.length > 0 && (
        <div className="user-search-results">
          {results.map(user => (
            <div key={user.id} className="user-result-item" onClick={() => handleSelect(user)}>
              <UserAvatar image={user.image} name={user.name || ""} size={32} selectedRank={user.avatarFrame} />
              <span>{user.name}</span>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && query.length >= 2 && !isLoading && (
        <div className="user-search-results">
          <div style={{ padding: '1rem', color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>
            Aucun utilisateur trouvé
          </div>
        </div>
      )}
    </div>
  );
}
