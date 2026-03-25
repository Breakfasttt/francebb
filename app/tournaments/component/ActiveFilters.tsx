"use client";

import { X, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface ActiveFiltersProps {
  currentSort: string;
}

export default function ActiveFilters({ currentSort }: ActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const activeFilters = Array.from(searchParams.entries())
    .filter(([key]) => key !== "sort" && key !== "query")
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
    <div className="active-filters-box">
      <div className="applied-filters">
        <span style={{ color: "#888", fontSize: "0.9rem" }}>Filtres actifs :</span>
        {activeFilters.length > 0 ? (
          activeFilters.map((f) => (
            <div key={f.key} className="filter-tag">
              <span>{filterLabels[f.key] || f.key}: {f.value === "true" ? "Oui" : f.value}</span>
              <button onClick={() => removeFilter(f.key)}><X size={14} /></button>
            </div>
          ))
        ) : (
          <span style={{ color: "#555", fontSize: "0.9rem", fontStyle: "italic" }}>Aucun filtre (hors recherche)</span>
        )}
      </div>

      <div className="sort-box-compact">
        <Clock size={16} color="#888" />
        <select value={currentSort} onChange={(e) => handleSortChange(e.target.value)}>
          <option value="date_asc">Date (plus proche)</option>
          <option value="date_desc">Date (plus lointain)</option>
          <option value="price_asc">Prix (croissant)</option>
          <option value="price_desc">Prix (décroissant)</option>
          <option value="participants_asc">Places (croissant)</option>
          <option value="participants_desc">Places (décroissant)</option>
        </select>
      </div>

      <style jsx>{`
        .sort-box-compact {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          min-width: 200px;
        }
        
        .sort-box-compact select {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
