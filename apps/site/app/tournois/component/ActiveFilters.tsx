"use client";

import { X, Clock, LayoutGrid, LayoutList } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ClassicSelect from "@/common/components/Form/ClassicSelect";
import MobilePortal from "@/common/components/MobilePortal/MobilePortal";

interface ActiveFiltersProps {
  currentSort: string;
}

export default function ActiveFilters({ currentSort }: ActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "grid";

  const removeFilter = (name: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(name);
    router.push(`?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`?${params.toString()}`);
  };

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`?${params.toString()}`);
  };

  const activeFilters = Array.from(searchParams.entries())
    .filter(([key]) => key !== "sort" && key !== "query" && key !== "view")
    .map(([key, value]) => ({ key, value }));

  const filterLabels: Record<string, string> = {
    region: "Région",
    dept: "Département",
    edition: "Édition",
    ruleset: "Règles",
    structure: "Structure",
    days: "Durée",
    minPlaces: "Places rest.",
    lodging: "Logement",
    meals: "Repas",
    friday: "Vendredi",
    maxPrice: "Prix max",
    isTeam: "Mode",
    platform: "Plateforme",
    isNAF: "Circuit NAF",
    isCDF: "Circuit CDF",
    isCGO: "Circuit CGO",
    isTGE: "Circuit TGE",
    isTSC: "Circuit TSC"
  };

  const renderValue = (key: string, value: string) => {
    if (value === "true") return "Oui";
    if (value === "false") {
      if (key === "isTeam") return "Individuel";
      return "Non";
    }
    if (key === "isTeam" && value === "true") return "Par équipe";
    if (key === "platform") {
      if (value === "Tabletop") return "Plateau (IRL)";
      if (value === "VideoGame") return "Jeu Vidéo";
      return value;
    }
    if (key === "edition") {
      if (value === "BB25") return "BB 2025";
      if (value === "BB20") return "BB 2020";
      return value;
    }
    return value;
  };

  return (
    <div className="active-filters-content" style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="applied-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center' }}>
        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>FILTRES :</span>
        {activeFilters.length > 0 ? (
          activeFilters.map((f) => (
            <div key={f.key} className="filter-tag">
              <span>{filterLabels[f.key] || f.key}: {renderValue(f.key, f.value)}</span>
              <button 
                onClick={() => removeFilter(f.key)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0 0 0 5px', display: 'flex', alignItems: 'center' }}
              >
                <X size={14} />
              </button>
            </div>
          ))
        ) : (
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic", opacity: 0.6 }}>Aucun filtre actif</span>
        )}
      </div>

      <div className="desktop-only active-filters-actions">
        <div className="view-toggle-group">
          <button 
            onClick={() => handleViewChange("grid")}
            className={currentView === "grid" ? "active" : ""}
            title="Vue par cartes"
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => handleViewChange("list")}
            className={currentView === "list" ? "active" : ""}
            title="Vue par liste"
          >
            <LayoutList size={18} />
          </button>
        </div>

        <div className="sort-box-compact">
          <ClassicSelect
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            icon={Clock}
            containerStyle={{ gap: 0 }}
          >
            <option value="date_asc">Date (plus proche)</option>
            <option value="date_desc">Date (plus lointain)</option>
            <option value="price_asc">Prix (croissant)</option>
            <option value="price_desc">Prix (décroissant)</option>
            <option value="participants_asc">Places (croissant)</option>
            <option value="participants_desc">Places (décroissant)</option>
          </ClassicSelect>
        </div>
      </div>

      <MobilePortal>
        <div className="tournois-mobile-actions-portal mobile-only">
            <div className="sidebar-divider" />
            <h3 className="sidebar-section-title">Affichage & Tri</h3>
            
            <div className="view-toggle-mobile">
                <button 
                    onClick={() => handleViewChange("grid")} 
                    className={currentView === "grid" ? "active" : ""}
                >
                    <LayoutGrid size={18} /> Mode Grille
                </button>
                <button 
                    onClick={() => handleViewChange("list")} 
                    className={currentView === "list" ? "active" : ""}
                >
                    <LayoutList size={18} /> Mode Liste
                </button>
            </div>

            <div className="sort-box-mobile">
                <ClassicSelect
                    label="Trier par"
                    value={currentSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    icon={Clock}
                >
                    <option value="date_asc">Date (plus proche)</option>
                    <option value="date_desc">Date (plus lointain)</option>
                    <option value="price_asc">Prix (croissant)</option>
                    <option value="price_desc">Prix (décroissant)</option>
                    <option value="participants_asc">Places (croissant)</option>
                    <option value="participants_desc">Places (décroissant)</option>
                </ClassicSelect>
            </div>
        </div>
      </MobilePortal>
    </div>
  );
}
