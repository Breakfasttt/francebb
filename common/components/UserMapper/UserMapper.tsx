"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, User as UserIcon } from "lucide-react";
import UserAvatar, { Rank } from "@/common/components/UserAvatar/UserAvatar";
import { searchUsersAction } from "@/app/forum/actions";
import "./UserMapper.css";

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

  return (
    <div className={`user-mapper-row ${className} ${selectedUser ? "has-selection" : ""}`} ref={containerRef}>
      {selectedUser && (
        <div className="selected-user-badge">
          <UserAvatar image={selectedUser.image} name={selectedUser.name || ""} size={20} selectedRank={selectedUser.avatarFrame as Rank} />
          <span className="selected-name">{selectedUser.name}</span>
          <button type="button" className="unselect-btn" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
            <X size={12} />
          </button>
        </div>
      )}

      <div className="mapper-input-wrapper">
        <Search size={14} className="mapper-search-icon" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="mapper-input"
        />
        {isLoading && <div className="mapper-loader">⏳</div>}

        {showResults && (results.length > 0 || query.length >= 2) && (
          <div className="mapper-results-popover">
            {results.length > 0 ? (
              results.map(user => (
                <div key={user.id} className="mapper-result-item" onClick={() => handleSelect(user)}>
                  <UserAvatar image={user.image} name={user.name || ""} size={24} selectedRank={user.avatarFrame as Rank} />
                  <span>{user.name}</span>
                </div>
              ))
            ) : !isLoading ? (
              <div className="mapper-no-results">Aucun utilisateur</div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
