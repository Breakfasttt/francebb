"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Tag as TagIcon, User, ArrowDownAz, Grid, List, RotateCcw, Plus } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import TagSelector from "@/common/components/TagSelector/TagSelector";
import CTAButton from "@/common/components/Button/CTAButton";
import "./ArticleFilterSidebar.css";
import "./ArticleFilterSidebar-mobile.css";


interface ArticleFilterSidebarProps {
  availableTags: string[];
  isAuthenticated?: boolean;
}

export default function ArticleFilterSidebar({ availableTags, isAuthenticated }: ArticleFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // On utilise des états locaux pour gérer le "debounce" ou les changements fluides
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [author, setAuthor] = useState(searchParams.get("author") || "");
  
  // Les tags sélectionnés (peuvent être multiples dans l'URL si on le souhaite, mais ici on gère un seul tag actif pour l'instant pour rester cohérent avec le backend, 
  // BIEN QUE TagSelector en supporte plusieurs. Pour uniforme avec Ressourcen, on va supporter plusieurs tags séparés par virgules dans l'URL)
  const currentTags = searchParams.get("tag") ? searchParams.get("tag")!.split(",") : [];

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([name, value]) => {
        if (value !== null) {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      });
      params.delete("page"); // Reset page on filter change
      return params.toString();
    },
    [searchParams]
  );

  const handleApplyFilter = (name: string, value: string | null) => {
    router.push(`?${createQueryString({ [name]: value })}`);
  };

  const handleTagsChange = (tags: string[]) => {
    handleApplyFilter("tag", tags.length > 0 ? tags.join(",") : null);
  };

  const handleReset = () => {
    router.push("/articles");
  };

  const viewMode = searchParams.get("view") === "list" ? "list" : "grid";

  return (
    <aside className="article-filter-sidebar">
      {isAuthenticated && (
        <div className="sidebar-action-wrapper" style={{ marginBottom: '1.5rem' }}>
          <CTAButton href="/articles/create" as="link" fullWidth icon={<Plus size={18} />}>
            Créer un article
          </CTAButton>
        </div>
      )}

      <PremiumCard className="filter-card">
        {/* Section Recherche & Vue */}
        <div className="filter-section">
          <div className="filter-header-row">
            <h4 className="filter-title">Recherche</h4>
            <div className="view-toggle-mini">
              <button
                className={`mini-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => handleApplyFilter('view', 'grid')}
                title="Vue Grille"
              >
                <Grid size={16} />
              </button>
              <button
                className={`mini-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => handleApplyFilter('view', 'list')}
                title="Vue Liste"
              >
                <List size={16} />
              </button>
            </div>
          </div>
          
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Titre, contenu..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => handleApplyFilter("query", query)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter("query", query)}
              className="search-input"
            />
          </div>
        </div>

        {/* Section Tags */}
        <div className="filter-section">
          <h4 className="filter-title">Tags</h4>
          <TagSelector 
            value={currentTags}
            onChange={handleTagsChange}
            suggestions={availableTags}
            placeholder="Chercher un tag..."
          />
        </div>

        {/* Section Auteur */}
        <div className="filter-section">
          <h4 className="filter-title">Auteur</h4>
          <div className="search-input-wrapper">
            <User className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Nom de l'auteur..."
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              onBlur={() => handleApplyFilter("author", author)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter("author", author)}
              className="search-input"
            />
          </div>
        </div>

        {/* Section Tri */}
        <div className="filter-section">
          <h4 className="filter-title">Trier par</h4>
          <div className="search-input-wrapper">
            <ArrowDownAz className="search-icon" size={18} />
            <select 
              className="search-input select-input"
              value={searchParams.get("sort") || "date_desc"}
              onChange={(e) => handleApplyFilter("sort", e.target.value)}
            >
              <option value="date_desc">Plus récents</option>
              <option value="date_asc">Plus anciens</option>
              <option value="title_asc">Titre (A-Z)</option>
              <option value="reactions_desc">Plus populaires</option>
            </select>
          </div>
        </div>

        <button className="reset-filter-btn" onClick={handleReset}>
          <RotateCcw size={14} /> Réinitialiser
        </button>
      </PremiumCard>
    </aside>
  );
}
