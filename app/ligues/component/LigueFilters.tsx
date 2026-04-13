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

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query") as string;
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("query", query);
    } else {
      params.delete("query");
    }
    params.set("page", "1");
    router.push(`/ligues?${params.toString()}`);
  };

  return (
    <div className="search-filters">
        <div className="search-wrapper">
            <Search size={18} />
            <form onSubmit={handleSearchSubmit}>
                <input 
                    type="text" 
                    name="query" 
                    defaultValue={initialQuery} 
                    placeholder="Nom ou acronyme..." 
                />
            </form>
        </div>
        
        <ClassicSelect 
          name="region" 
          onChange={handleRegionChange} 
          defaultValue={initialRegion}
          icon={MapPin}
          containerStyle={{ minWidth: "220px" }}
        >
            <option value="">Toutes les zones</option>
            {coachRegions.map(r => (
                <option key={r.key} value={r.key}>{r.label}</option>
            ))}
        </ClassicSelect>
    </div>
  );
}
