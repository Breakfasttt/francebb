"use client";

/**
 * Réglages de la liste des tournois `/tournois` (refonte, carte 089, ADR 0006).
 * - `TournamentFilterFields` : les filtres (région, département, mode, plateforme, version, structure, circuits,
 *   logistique, prix, places, historique). Ils sont affichés dans la colonne de gauche sur ordinateur et dans le
 *   panneau « Filtrer les tournois » sur téléphone.
 * - `TournamentListControls` : la barre au-dessus des résultats (recherche par nom, bouton « Filtres » du téléphone,
 *   tri, affichage en grille ou en liste) et les pastilles des filtres actifs, chacune avec une croix qui retire ce
 *   filtre.
 * Chaque réglage change l'adresse de la page (`?region=…&isNAF=true…`), que la page serveur relit : les paramètres
 * de l'adresse sont les mêmes qu'avant la refonte. Changer un filtre ramène à la première page des résultats.
 */
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Clock, Euro, Home, LayoutGrid, LayoutList, MapPin, Search, SlidersHorizontal, Sparkles, Trophy, X } from "lucide-react";
import { Button, CountBadge, Field, Input, Select, Sheet, SheetContent, cn } from "@bbfrance/ui";
import { useDebounce } from "@/common/hooks/useDebounce";
import { REGION_BY_DEPARTMENT } from "@/lib/france";

/**
 * Régions et départements proposés par les filtres. La page les lit dans la liste de référence (`REGION_FRANCE`,
 * `DEPARTEMENT_FRANCE`), la même que celle du formulaire de tournoi : les noms comparés sont donc identiques
 * (« Île-de-France » avec son accent, carte 129).
 */
export type PlaceOptions = {
  regions: { key: string; label: string }[];
  departments: { key: string; label: string }[];
};

type FilterDef =
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[] }
  | { name: string; label: string; type: "checkbox" }
  | { name: string; label: string; type: "number" };

/** Libellé de la pastille de chaque paramètre de l'adresse (le nom du filtre tel que le coach le lit). */
const CHIP_LABELS: Record<string, string> = {
  ligueId: "Ligue",
  region: "Région",
  dept: "Département",
  edition: "Version",
  ruleset: "Règles",
  structure: "Structure",
  days: "Durée",
  minPlaces: "Places min.",
  lodging: "Logement sur place",
  meals: "Repas compris",
  friday: "Arrivée vendredi",
  maxPrice: "Prix max",
  isTeam: "Mode",
  platform: "Plateforme",
  isNAF: "Circuit NAF",
  isCDF: "Circuit CDF",
  isCGO: "Circuit CGO",
  isTGE: "Circuit TGE",
  isTSC: "Circuit TSC",
  history: "Avec les tournois passés",
};

const SORT_OPTIONS = [
  { value: "date_asc", label: "Date (plus proche)" },
  { value: "date_desc", label: "Date (plus lointain)" },
  { value: "price_asc", label: "Prix (croissant)" },
  { value: "price_desc", label: "Prix (décroissant)" },
  { value: "participants_asc", label: "Places (croissant)" },
  { value: "participants_desc", label: "Places (décroissant)" },
];

/** Paramètres de l'adresse qui ne sont pas des filtres (pas de pastille, ne comptent pas dans le bouton « Filtres »). */
const NOT_FILTERS = new Set(["sort", "query", "view", "page"]);

/** Texte de la pastille d'un filtre actif. */
function chipText(key: string, value: string, places: PlaceOptions): string {
  const label = CHIP_LABELS[key] ?? key;
  if (value === "true") return key === "isTeam" ? "Mode : par équipe" : label;
  if (value === "false") return key === "isTeam" ? "Mode : individuel" : `${label} : non`;
  // L'identifiant de la ligue n'a aucun sens pour le membre : on affiche un texte lisible.
  if (key === "ligueId") return "Ligue choisie";
  if (key === "platform") {
    if (value === "Tabletop") return `${label} : plateau (IRL)`;
    if (value === "VideoGame") return `${label} : jeu vidéo`;
  }
  if (key === "edition") {
    if (value === "BB25") return `${label} : BB 2025`;
    if (value === "BB20") return `${label} : BB 2020`;
  }
  if (key === "maxPrice") return `${label} : ${value} €`;
  if (key === "dept") {
    const department = places.departments.find((item) => item.key === value);
    return `${label} : ${department?.label ?? value}`;
  }
  return `${label} : ${value}`;
}

/** Changement d'un paramètre de l'adresse : renvoie l'adresse complète, revenue à la première page. */
function useParamUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
  return { searchParams, hrefWith, update };
}

/** Les filtres, regroupés par thème. `prefix` rend les identifiants des champs uniques (colonne ou panneau). */
export function TournamentFilterFields({ prefix, places }: { prefix: string; places: PlaceOptions }) {
  const { searchParams, update } = useParamUpdater();
  const selectedRegion = searchParams.get("region") || "";

  // Départements proposés : ceux de la région choisie, sinon tous
  const deptsList = selectedRegion
    ? places.departments.filter((dept) => REGION_BY_DEPARTMENT[dept.key] === selectedRegion)
    : places.departments;

  const sections: { title: string; icon: ReactNode; filters: FilterDef[] }[] = [
    {
      title: "Localisation",
      icon: <MapPin size={16} aria-hidden="true" />,
      filters: [
        { name: "region", label: "Région", type: "select", options: places.regions.map((region) => ({ value: region.key, label: region.label })) },
        { name: "dept", label: "Département", type: "select", options: deptsList.map((dept) => ({ value: dept.key, label: dept.label })) },
      ],
    },
    {
      title: "Format et jeu",
      icon: <Trophy size={16} aria-hidden="true" />,
      filters: [
        { name: "isTeam", label: "Mode de jeu", type: "select", options: [{ value: "false", label: "Individuel" }, { value: "true", label: "Par équipe" }] },
        {
          name: "platform", label: "Plateforme", type: "select",
          options: [{ value: "Tabletop", label: "Plateau (IRL)" }, { value: "Fumbbl", label: "Fumbbl" }, { value: "VideoGame", label: "Jeu Vidéo (BB3/BB2)" }],
        },
        {
          name: "edition", label: "Version du jeu", type: "select",
          options: [
            { value: "BB25", label: "Blood Bowl 2025" }, { value: "BB20", label: "Blood Bowl 2020" }, { value: "BB3", label: "Blood Bowl 3" },
            { value: "BB7", label: "Blood Bowl 7's" }, { value: "GutterBowl", label: "Gutter Bowl" }, { value: "Classic", label: "LRB6 / Classic" },
          ],
        },
        { name: "structure", label: "Structure", type: "select", options: [{ value: "Resurrection", label: "Résurrection" }, { value: "Evolutif", label: "Évolutif" }] },
      ],
    },
    {
      title: "Circuits et labels",
      icon: <Sparkles size={16} aria-hidden="true" />,
      filters: [
        { name: "isNAF", label: "Homologué NAF", type: "checkbox" },
        { name: "isCDF", label: "Coupe de France (CDF)", type: "checkbox" },
        { name: "isCGO", label: "Circuit du Grand Ouest", type: "checkbox" },
        { name: "isTGE", label: "Tournoi du Grand Est", type: "checkbox" },
        { name: "isTSC", label: "Tournoi du Sud-Centre", type: "checkbox" },
      ],
    },
    {
      title: "Logistique",
      icon: <Home size={16} aria-hidden="true" />,
      filters: [
        { name: "lodging", label: "Logement sur place", type: "checkbox" },
        { name: "meals", label: "Repas compris", type: "checkbox" },
        { name: "friday", label: "Arrivée vendredi", type: "checkbox" },
      ],
    },
    {
      title: "Budget et places",
      icon: <Euro size={16} aria-hidden="true" />,
      filters: [
        { name: "maxPrice", label: "Prix max (€)", type: "number" },
        { name: "minPlaces", label: "Places restantes min.", type: "number" },
      ],
    },
    {
      title: "Visibilité",
      icon: <Clock size={16} aria-hidden="true" />,
      filters: [{ name: "history", label: "Voir tournois passés / annulés", type: "checkbox" }],
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {sections.map((section) => (
        <fieldset key={section.title} className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
          <legend className="mb-2 flex items-center gap-2 p-0 text-xs font-bold tracking-wide text-bb-text-muted uppercase">
            {section.icon}
            {section.title}
          </legend>
          {section.filters.map((filter) => {
            const id = `${prefix}-${filter.name}`;
            if (filter.type === "select") {
              const allLabel = filter.name === "isTeam" ? "Tous" : "Toutes";
              return (
                <Field key={filter.name} label={filter.label} htmlFor={id}>
                  <Select
                    id={id}
                    value={searchParams.get(filter.name) || ""}
                    onChange={(event) => update(filter.name === "region" ? { region: event.target.value, dept: "" } : { [filter.name]: event.target.value })}
                  >
                    <option value="">{allLabel}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </Field>
              );
            }
            if (filter.type === "checkbox") {
              return (
                <label key={filter.name} htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3 text-[0.95rem] text-bb-text">
                  <input
                    id={id}
                    type="checkbox"
                    className="size-5 shrink-0 cursor-pointer accent-[var(--bb-accent)]"
                    checked={searchParams.get(filter.name) === "true"}
                    onChange={(event) => update({ [filter.name]: event.target.checked ? "true" : "" })}
                  />
                  <span>{filter.label}</span>
                </label>
              );
            }
            return (
              <Field key={filter.name} label={filter.label} htmlFor={id}>
                <Input
                  id={id}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="illimité"
                  value={searchParams.get(filter.name) || ""}
                  onChange={(event) => update({ [filter.name]: event.target.value })}
                />
              </Field>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}

/** Colonne des filtres de l'ordinateur (masquée sur téléphone, où le panneau « Filtrer les tournois » la remplace). */
export function TournamentFilterAside({ places }: { places: PlaceOptions }) {
  const { hrefWith } = useParamUpdater();
  return (
    <aside aria-label="Filtres des tournois" className="hidden lg:block">
      <div className="sticky top-20 flex max-h-[calc(100dvh-8rem)] flex-col gap-4 overflow-y-auto rounded-bb-lg border border-bb-border bg-bb-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="m-0 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">Filtres</h2>
          <Button asChild variant="quiet" size="tap" className="px-2 text-sm">
            <Link href={resetHref(hrefWith)}>Réinitialiser</Link>
          </Button>
        </div>
        <TournamentFilterFields prefix="aside" places={places} />
      </div>
    </aside>
  );
}

/** Adresse sans aucun filtre (on garde la recherche, le tri et l'affichage). */
function resetHref(hrefWith: (changes: Record<string, string>) => string): string {
  const cleared: Record<string, string> = {};
  for (const key of Object.keys(CHIP_LABELS)) cleared[key] = "";
  return hrefWith(cleared);
}

export function TournamentListControls({ total, places }: { total: number; places: PlaceOptions }) {
  const { searchParams, hrefWith, update } = useParamUpdater();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const currentSort = searchParams.get("sort") || "date_asc";
  const currentView = searchParams.get("view") || "grid";

  // Recherche par nom : l'adresse change 400 ms après la dernière touche (avant, à chaque touche)
  const urlQuery = searchParams.get("query") || "";
  const [query, setQuery] = useState(urlQuery);
  const debouncedQuery = useDebounce(query, 400);
  useEffect(() => {
    if (debouncedQuery.trim() !== urlQuery) update({ query: debouncedQuery.trim() });
    // `update` change à chaque rendu ; seule la saisie déclenche la recherche
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const chips = Array.from(searchParams.entries())
    .filter(([key, value]) => !NOT_FILTERS.has(key) && value)
    .map(([key, value]) => ({ key, text: chipText(key, value, places) }));

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
            aria-label="Rechercher un tournoi par nom"
            placeholder="Rechercher un tournoi par nom…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            enterKeyHint="search"
            className="pl-10"
          />
        </div>
        <div className="flex min-w-0 items-center gap-2">
          {/* Téléphone : les filtres sont dans un panneau */}
          <Button type="button" variant="secondary" size="tap" className="shrink-0 px-3 lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={18} aria-hidden="true" />
            Filtres
            <CountBadge count={chips.length} aria-label={`${chips.length} actif${chips.length > 1 ? "s" : ""}`} />
          </Button>
          <Select
            aria-label="Trier par"
            value={currentSort}
            onChange={(event) => update({ sort: event.target.value })}
            className="min-w-0 flex-1 lg:w-56 lg:flex-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
          <div role="group" aria-label="Affichage" className="flex shrink-0 rounded-bb-md border border-bb-border bg-bb-surface p-0.5">
            {viewButton("grid", "Affichage en grille", <LayoutGrid size={18} aria-hidden="true" />)}
            {viewButton("list", "Affichage en liste", <LayoutList size={18} aria-hidden="true" />)}
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <ul aria-label="Filtres actifs" className="m-0 flex list-none flex-wrap gap-2 p-0">
          {chips.map((chip) => (
            <li key={chip.key} className="min-w-0 max-w-full">
              <Link
                href={hrefWith({ [chip.key]: "" })}
                scroll={false}
                aria-label={`Retirer le filtre ${chip.text}`}
                className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full border border-bb-border bg-bb-surface-2 py-1 pr-2 pl-3 text-sm font-semibold text-bb-text no-underline hover:border-bb-text-muted focus-visible:outline-2 focus-visible:outline-bb-focus lg:min-h-9"
              >
                <span className="min-w-0 truncate">{chip.text}</span>
                <X size={16} aria-hidden="true" className="shrink-0 text-bb-text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent title="Filtrer les tournois">
          <div className="flex flex-col gap-4 pt-2">
            <TournamentFilterFields prefix="sheet" places={places} />
            {/* Boutons collés en bas du panneau pendant le défilement */}
            <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-bb-border bg-bb-surface px-4 pt-3 pb-1">
              <Button asChild variant="secondary" size="tap">
                <Link href={resetHref(hrefWith)} scroll={false}>Réinitialiser</Link>
              </Button>
              <Button type="button" variant="primary" size="tap" className="flex-1" onClick={() => setFiltersOpen(false)}>
                Voir {total} tournoi{total > 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
