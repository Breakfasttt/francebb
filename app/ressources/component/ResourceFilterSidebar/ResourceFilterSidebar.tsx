"use client";

import { useState, useEffect } from "react";
import { Search, Tag as TagIcon, Grid, List } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import TagSelector from "@/common/components/TagSelector/TagSelector";
import { getResourceTags } from "../../actions";
import "./ResourceFilterSidebar.css";

interface ResourceFilterSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: { id: string; name: string }[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export default function ResourceFilterSidebar({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagsChange,
  availableTags, 
  viewMode,
  onViewModeChange
}: ResourceFilterSidebarProps) {
  const [allExistingTags, setAllExistingTags] = useState<string[]>([]);

  useEffect(() => {
    async function loadTags() {
      const tags = await getResourceTags();
      setAllExistingTags(tags);
    }
    loadTags();
  }, []);

  return (
    <aside className="resource-filter-sidebar">
      <PremiumCard className="filter-card">
        <div className="filter-section">
          <div className="filter-header-row">
            <h4 className="filter-title">Recherche</h4>
            <div className="view-toggle-mini">
              <button
                className={`mini-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => onViewModeChange('grid')}
                title="Vue Grille"
              >
                <Grid size={16} />
              </button>
              <button
                className={`mini-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => onViewModeChange('list')}
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
              placeholder="Nom, description..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-section">
          <h4 className="filter-title">Rechercher par tag</h4>
          <TagSelector 
            value={selectedTags}
            onChange={onTagsChange}
            suggestions={allExistingTags}
            placeholder="Ex: Outil, Guide..."
          />
        </div>
      </PremiumCard>
    </aside>
  );
}
