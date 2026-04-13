"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, Calendar, User, FolderTree, Loader2 } from "lucide-react";
import CTAButton from "@/common/components/Button/CTAButton";

import ClassicSelect from "@/common/components/Form/ClassicSelect";

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
    <form onSubmit={handleSubmit} className="search-form-card">
      {/* Ligne 1 : Mots-clés */}
      <div className="search-input-group">
        <label>
          <Search size={14} /> Mots-clés
        </label>
        <div className="search-main-input-wrapper">
          <input 
            type="text" 
            placeholder="Rechercher des messages ou des sujets..." 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="search-main-input"
            autoFocus
          />
          <Search size={20} className="search-icon" />
        </div>
      </div>

      {/* Ligne 2 : Filtres avancés */}
      <div className="search-filters-grid">
        
        {/* Auteur */}
        <div className="search-input-group">
          <label>
            <User size={14} /> Auteur
          </label>
          <input 
            type="text" 
            placeholder="Ex: Admin, Nuffle..." 
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        {/* Forum cible */}
        <ClassicSelect
          label="Forum"
          icon={FolderTree}
          value={forumId}
          onChange={(e) => setForumId(e.target.value)}
        >
          <option value="">Tous les forums</option>
          {forums.map(f => (
            <option key={f.id} value={f.id}>
              {"\u00A0".repeat(f.level * 4)}{f.level > 0 ? "↳ " : ""}{f.name}
            </option>
          ))}
        </ClassicSelect>

        {/* Date */}
        <ClassicSelect
          label="Date"
          icon={Calendar}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        >
          <option value="all">Toutes les dates</option>
          <option value="7d">Depuis 7 jours</option>
          <option value="30d">Depuis 1 mois</option>
          <option value="1y">Depuis 1 an</option>
        </ClassicSelect>
        
        {/* Trier par */}
        <ClassicSelect
          label="Trier par"
          icon={Filter}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="desc">Plus récents d'abord</option>
          <option value="asc">Plus anciens d'abord</option>
        </ClassicSelect>

      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
        <CTAButton 
          type="submit" 
          isLoading={isPending}
          icon={Search}
          style={{ minWidth: "300px" }}
        >
          {isPending ? "Recherche en cours..." : "Lancer la recherche"}
        </CTAButton>
      </div>

    </form>
  );
}
