"use client";

import React from "react";
import { Search, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ClassicSelect from "@/common/components/Form/ClassicSelect";

interface LigueFiltersProps {
  initialQuery?: string;
  initialRegion?: string;
  coachRegions: { key: string; label: string }[];
}

export default function LigueFilters({ initialQuery = "", initialRegion = "", coachRegions }: LigueFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = e.target.value;
    if (val) {
      params.set("region", val);
    } else {
      params.delete("region");
    }
    params.set("page", "1"); // reset to page 1
    router.push(`/ligues?${params.toString()}`);
  };

  // État local pour l'input pour un rendu fluide
  const [query, setQuery] = React.useState(initialQuery);

  // Debounce de la recherche
  React.useEffect(() => {
    // Évite la boucle infinie : on ne push que si la valeur a changée par rapport à l'URL
    const currentQuery = searchParams.get("query") || "";
    if (query === currentQuery) return;

    const timer = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
          params.set("query", query);
        } else {
          params.delete("query");
        }
        params.set("page", "1");
        router.push(`/ligues?${params.toString()}`, { scroll: false });
    }, 400); // 400ms pour être plus safe sur les mobiles

    return () => clearTimeout(timer);
  }, [query, router, searchParams]);

  return (
    <div className="search-filters">
        <div className="search-wrapper">
            <Search size={18} />
            <input 
                type="text" 
                name="query" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nom ou acronyme..." 
            />
        </div>
        
        <ClassicSelect 
          name="region" 
          onChange={handleRegionChange} 
          defaultValue={initialRegion}
          icon={MapPin}
          className="filter-select"
        >
            <option value="">Toutes les zones</option>
            {coachRegions.map(r => (
                <option key={r.key} value={r.key}>{r.label}</option>
            ))}
        </ClassicSelect>
    </div>
  );
}
