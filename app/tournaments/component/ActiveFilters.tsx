"use client";

import { X, Clock, LayoutGrid, LayoutList } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

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
    minPlaces: "Places min",
    lodging: "Logement",
    meals: "Repas",
    friday: "Vendredi",
    maxPrice: "Prix max"
  };

  return (
    <div className="active-filters-content" style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="applied-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center' }}>
        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>FILTRES :</span>
        {activeFilters.length > 0 ? (
          activeFilters.map((f) => (
            <div key={f.key} className="filter-tag">
              <span>{filterLabels[f.key] || f.key}: {f.value === "true" ? "Oui" : f.value}</span>
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        {/* Toggle View */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(255,255,255,0.05)', 
          padding: '0.2rem', 
          borderRadius: '8px', 
          border: '1px solid var(--glass-border)' 
        }}>
          <button 
            onClick={() => handleViewChange("grid")}
            style={{ 
              background: currentView === "grid" ? 'var(--primary)' : 'transparent',
              border: 'none',
              padding: '0.4rem',
              borderRadius: '6px',
              color: currentView === "grid" ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex'
            }}
            title="Vue par cartes"
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => handleViewChange("list")}
            style={{ 
              background: currentView === "list" ? 'var(--primary)' : 'transparent',
              border: 'none',
              padding: '0.4rem',
              borderRadius: '6px',
              color: currentView === "list" ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex'
            }}
            title="Vue par liste"
          >
            <LayoutList size={18} />
          </button>
        </div>

        <div className="sort-box-compact" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', minWidth: '220px' }}>
          <Clock size={16} color="var(--accent)" />
          <select 
            value={currentSort} 
            onChange={(e) => handleSortChange(e.target.value)}
            style={{ 
              flex: 1, 
              background: 'var(--glass-bg)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: '6px', 
              padding: '0.4rem', 
              color: 'var(--foreground)',
              fontSize: '0.85rem'
            }}
          >
            <option value="date_asc">Date (plus proche)</option>
            <option value="date_desc">Date (plus lointain)</option>
            <option value="price_asc">Prix (croissant)</option>
            <option value="price_desc">Prix (décroissant)</option>
            <option value="participants_asc">Places (croissant)</option>
            <option value="participants_desc">Places (décroissant)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
