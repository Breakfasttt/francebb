"use client";

/**
 * Réglages de la liste des ligues `/ligues` (refonte, carte 094, ADR 0006), sur le modèle de `/tournois` (carte 089) :
 * - la recherche par nom ou acronyme, toujours visible ;
 * - le filtre par zone : liste visible sur ordinateur ; sur téléphone, dans le panneau « Filtrer les ligues », ouvert
 *   par le bouton « Filtres » qui indique si un filtre est actif ;
 * - le choix de l'affichage en grille ou en liste ;
 * - la pastille du filtre actif, avec une croix qui le retire.
 * Chaque réglage change l'adresse de la page (`?view&query&region`), que la page serveur relit : les paramètres sont
 * les mêmes qu'avant la refonte. Changer la recherche ou la zone ramène à la première page des résultats.
 */
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, LayoutList, Search, SlidersHorizontal, X } from "lucide-react";
import { Button, CountBadge, Field, Input, Select, Sheet, SheetContent, cn } from "@bbfrance/ui";
import { useDebounce } from "@/common/hooks/useDebounce";

interface LigueFiltersProps {
  /** Zones géographiques (données de référence COACH_REGION). */
  zones: { key: string; label: string }[];
  /** Nombre de ligues trouvées, affiché sur le bouton qui ferme le panneau du téléphone. */
  total: number;
}

export default function LigueFilters({ zones, total }: LigueFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  /** Adresse de la page avec les changements demandés ; revient à la première page sauf demande contraire. */
  const hrefWith = (changes: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [name, value] of Object.entries(changes)) {
      if (value) params.set(name, value);
      else params.delete(name);
    }
    if (!("page" in changes)) params.delete("page");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };
  const update = (changes: Record<string, string>) => router.push(hrefWith(changes), { scroll: false });

  const region = searchParams.get("region") || "";
  const currentView = searchParams.get("view") || "grid";
  const zoneLabel = zones.find((zone) => zone.key === region)?.label ?? region;

  // Recherche : l'adresse change 400 ms après la dernière touche, comme avant la refonte
  const urlQuery = searchParams.get("query") || "";
  const [query, setQuery] = useState(urlQuery);
  const debouncedQuery = useDebounce(query, 400);
  useEffect(() => {
    if (debouncedQuery.trim() !== urlQuery) update({ query: debouncedQuery.trim() });
    // `update` change à chaque rendu ; seule la saisie déclenche la recherche
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const zoneOptions = (
    <>
      <option value="">Toutes les zones</option>
      {zones.map((zone) => (
        <option key={zone.key} value={zone.key}>{zone.label}</option>
      ))}
    </>
  );

  const viewButton = (view: "grid" | "list", label: string, icon: ReactNode) => (
    <Button
      type="button"
      variant="quiet"
      size="tap-icon"
      aria-label={label}
      aria-pressed={currentView === view}
      title={label}
      onClick={() => update({ view, page: searchParams.get("page") || "" })}
      className={cn("rounded-[10px]", currentView === view && "bg-bb-surface-2 text-bb-text")}
    >
      {icon}
    </Button>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bb-text-muted" />
          <Input
            type="text"
            aria-label="Rechercher une ligue par nom ou acronyme"
            placeholder="Rechercher par nom ou acronyme…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            enterKeyHint="search"
            className="pl-10"
          />
        </div>
        <div className="flex min-w-0 items-center gap-2">
          {/* Téléphone : le filtre de zone est dans un panneau */}
          <Button type="button" variant="secondary" size="tap" className="shrink-0 px-3 lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={18} aria-hidden="true" />
            Filtres
            <CountBadge count={region ? 1 : 0} aria-label="1 actif" />
          </Button>
          {/* Ordinateur : le filtre de zone reste visible */}
          <div className="hidden lg:block lg:w-60">
            <Select aria-label="Zone" value={region} onChange={(event) => update({ region: event.target.value })}>
              {zoneOptions}
            </Select>
          </div>
          <div className="flex-1 lg:hidden" />
          <div role="group" aria-label="Affichage" className="flex shrink-0 rounded-bb-md border border-bb-border bg-bb-surface p-0.5">
            {viewButton("grid", "Affichage en grille", <LayoutGrid size={18} aria-hidden="true" />)}
            {viewButton("list", "Affichage en liste", <LayoutList size={18} aria-hidden="true" />)}
          </div>
        </div>
      </div>

      {region && (
        <ul aria-label="Filtres actifs" className="m-0 flex list-none flex-wrap gap-2 p-0">
          <li className="min-w-0 max-w-full">
            <Link
              href={hrefWith({ region: "" })}
              scroll={false}
              aria-label={`Retirer le filtre Zone : ${zoneLabel}`}
              className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full border border-bb-border bg-bb-surface-2 py-1 pr-2 pl-3 text-sm font-semibold text-bb-text no-underline hover:border-bb-text-muted focus-visible:outline-2 focus-visible:outline-bb-focus lg:min-h-9"
            >
              <span className="min-w-0 truncate">Zone : {zoneLabel}</span>
              <X size={16} aria-hidden="true" className="shrink-0 text-bb-text-muted" />
            </Link>
          </li>
        </ul>
      )}

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent title="Filtrer les ligues">
          <div className="flex flex-col gap-4 pt-2">
            <Field label="Zone" htmlFor="sheet-zone">
              <Select id="sheet-zone" value={region} onChange={(event) => update({ region: event.target.value })}>
                {zoneOptions}
              </Select>
            </Field>
            <div className="flex gap-2 border-t border-bb-border pt-3 pb-1">
              <Button asChild variant="secondary" size="tap">
                <Link href={hrefWith({ region: "" })} scroll={false}>Réinitialiser</Link>
              </Button>
              <Button type="button" variant="primary" size="tap" className="flex-1" onClick={() => setFiltersOpen(false)}>
                Voir {total} ligue{total > 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
