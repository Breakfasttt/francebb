"use client";

import LigueSearch from "@/common/components/LigueSearch/LigueSearch";
import { useRouter, useSearchParams } from "next/navigation";

export default function LigueSearchWrapper({ initialLigue }: { initialLigue: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLigueChange = (ligueId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (ligueId) {
      params.set("ligueId", ligueId);
    } else {
      params.delete("ligueId");
    }
    // Reset page to 1 when changing filter
    params.delete("page");
    
    router.push(`/saisons?${params.toString()}`);
  };

  return (
    <LigueSearch 
      placeholder="Filtrer par ligue..."
      initialLigue={initialLigue}
      onChange={handleLigueChange}
    />
  );
}
