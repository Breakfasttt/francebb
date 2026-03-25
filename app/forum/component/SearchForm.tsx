"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, Calendar, User, FolderTree, Loader2 } from "lucide-react";

export interface ForumOption {
  id: string;
  name: string;
  level: number;
}

interface SearchFormProps {
  initialQuery?: string;
  initialForumId?: string;
  initialAuthor?: string;
  initialDate?: string;
  initialSortBy?: string;
  forums: ForumOption[];
}

export default function SearchForm({
  initialQuery = "",
  initialForumId = "",
  initialAuthor = "",
  initialDate = "all",
  initialSortBy = "desc",
  forums
}: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(initialQuery);
  const [forumId, setForumId] = useState(initialForumId);
  const [author, setAuthor] = useState(initialAuthor);
  const [date, setDate] = useState(initialDate);
  const [sortBy, setSortBy] = useState(initialSortBy);

  // Synchronize state when URL changes (e.g. Back button or external links)
  useEffect(() => {
    setQ(initialQuery);
    setForumId(initialForumId);
    setAuthor(initialAuthor);
    setDate(initialDate);
    setSortBy(initialSortBy);
  }, [initialQuery, initialForumId, initialAuthor, initialDate, initialSortBy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (forumId) params.set("forumId", forumId);
    if (author.trim()) params.set("author", author.trim());
    if (date !== "all") params.set("date", date);
    if (sortBy !== "desc") params.set("sortBy", sortBy);

    startTransition(() => {
      router.push(`/forum/search?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="forum-board" style={{
      maxWidth: "1000px",
      margin: "0 auto 2rem auto",
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.2rem",
      background: "var(--glass-bg)",
      border: "1px solid var(--glass-border)",
      borderRadius: "12px",
    }}>
      {/* Ligne 1 : Mots-clés */}
      <div style={{ position: "relative" }}>
        <input 
          type="text" 
          placeholder="Mots-clés à rechercher..." 
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ 
            width: "100%", 
            padding: "0.8rem 1rem 0.8rem 2.5rem", 
            fontSize: "1.1rem",
            background: "rgba(255,255,255,0.03)", 
            border: "1px solid rgba(255,255,255,0.1)", 
            color: "#eee", 
            borderRadius: "8px" 
          }}
          autoFocus
        />
        <Search size={20} style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
      </div>

      {/* Ligne 2 : Filtres avancés */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        
        {/* Auteur */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontSize: "0.85rem", color: "#aaa", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <User size={14} /> Auteur
          </label>
          <input 
            type="text" 
            placeholder="Pseudo ex: Admin..." 
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            style={{ 
              width: "100%",
              padding: "0.6rem 1rem",
              background: "rgba(255,255,255,0.03)", 
              border: "1px solid rgba(255,255,255,0.1)", 
              color: "#eee", 
              borderRadius: "8px" 
            }}
          />
        </div>

        {/* Forum cible */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontSize: "0.85rem", color: "#aaa", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <FolderTree size={14} /> Rechercher dans
          </label>
          <select 
            value={forumId} 
            onChange={(e) => setForumId(e.target.value)}
            style={{ 
              width: "100%",
              padding: "0.6rem 1rem",
              background: "rgba(255,255,255,0.03)", 
              border: "1px solid rgba(255,255,255,0.1)", 
              color: "#eee", 
              borderRadius: "8px" 
            }}
          >
            <option value="">Tous les forums</option>
            {forums.map(f => (
              <option key={f.id} value={f.id}>
                {"\u00A0".repeat(f.level * 4)}{f.level > 0 ? "↳ " : ""}{f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontSize: "0.85rem", color: "#aaa", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Calendar size={14} /> Date
          </label>
          <select 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            style={{ 
              width: "100%",
              padding: "0.6rem 1rem",
              background: "rgba(255,255,255,0.03)", 
              border: "1px solid rgba(255,255,255,0.1)", 
              color: "#eee", 
              borderRadius: "8px" 
            }}
          >
            <option value="all">Toutes les dates</option>
            <option value="7d">Depuis 7 jours</option>
            <option value="30d">Depuis 1 mois</option>
            <option value="1y">Depuis 1 an</option>
          </select>
        </div>
        
        {/* Trier par */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontSize: "0.85rem", color: "#aaa", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Filter size={14} /> Trier par
          </label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ 
              width: "100%",
              padding: "0.6rem 1rem",
              background: "rgba(255,255,255,0.03)", 
              border: "1px solid rgba(255,255,255,0.1)", 
              color: "#eee", 
              borderRadius: "8px" 
            }}
          >
            <option value="desc">Plus récents d'abord</option>
            <option value="asc">Plus anciens d'abord</option>
          </select>
        </div>

      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
        <button type="submit" disabled={isPending} className="widget-button" style={{ 
          background: "var(--primary)",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          gap: "0.5rem", 
          padding: "0.8rem 2.5rem", 
          fontSize: "1.05rem",
          opacity: isPending ? 0.7 : 1,
          width: "auto",
          minWidth: "300px"
        }}>
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          {isPending ? "Recherche en cours..." : "Lancer la recherche"}
        </button>
      </div>

    </form>
  );
}
