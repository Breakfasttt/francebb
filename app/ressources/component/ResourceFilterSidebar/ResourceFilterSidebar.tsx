"use client";

import CTAButton from "@/common/components/Button/CTAButton";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import TagSelector from "@/common/components/TagSelector/TagSelector";
import { Grid, List, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { getResourceTags } from "../../actions";
import "./ResourceFilterSidebar-mobile.css";
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

import GlobalPortal from "@/common/components/GlobalPortal/GlobalPortal";

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

  const sidebarContent = (
    <>
      <div className="sidebar-action-wrapper" style={{ marginBottom: '1.5rem' }}>
        <CTAButton href="/ressources/submit" fullWidth icon={Plus}>
          Soumettre une ressource
        </CTAButton>
      </div>

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
    </>
  );

  return (
    <>
      <aside className="resource-filter-sidebar desktop-only">
        {sidebarContent}
      </aside>

      <GlobalPortal target="#mobile-page-sidebar-slot">
        <div className="mobile-resource-filters" style={{ padding: '1rem' }}>
          {sidebarContent}
        </div>
      </GlobalPortal>
    </>
  );
}
