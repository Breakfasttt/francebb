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

const DEPT_NAMES: Record<string, string> = {
  "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence", "05": "Hautes-Alpes", "06": "Alpes-Maritimes", "07": "Ardeche", "08": "Ardennes", "09": "Ariege", "10": "Aube", "11": "Aude", "12": "Aveyron", "13": "Bouches-du-Rhone", "14": "Calvados", "15": "Cantal", "16": "Charente", "17": "Charente-Maritime", "18": "Cher", "19": "Correze", "2A": "Corse-du-Sud", "2B": "Haute-Corse", "21": "Cote-d'Or", "22": "Cotes-d'Armor", "23": "Creuse", "24": "Dordogne", "25": "Doubs", "26": "Drome", "27": "Eure", "28": "Eure-et-Loir", "29": "Finistere", "30": "Gard", "31": "Haute-Garonne", "32": "Gers", "33": "Gironde", "34": "Herault", "35": "Ille-et-Vilaine", "36": "Indre", "37": "Indre-et-Loire", "38": "Isere", "39": "Jura", "40": "Landes", "41": "Loir-et-Cher", "42": "Loire", "43": "Haute-Loire", "44": "Loire-Atlantique", "45": "Loiret", "46": "Lot", "47": "Lot-et-Garonne", "48": "Lozere", "49": "Maine-et-Loire", "50": "Manche", "51": "Marne", "52": "Haute-Marne", "53": "Mayenne", "54": "Meurthe-et-Moselle", "55": "Meuse", "56": "Morbihan", "57": "Moselle", "58": "Nievre", "59": "Nord", "60": "Oise", "61": "Orne", "62": "Pas-de-Calais", "63": "Puy-de-Dome", "64": "Pyrenees-Atlantiques", "65": "Hautes-Pyrenees", "66": "Pyrenees-Orientales", "67": "Bas-Rhin", "68": "Haut-Rhin", "69": "Rhone", "70": "Haute-Saone", "71": "Saone-et-Loire", "72": "Sarthe", "73": "Savoie", "74": "Haute-Savoie", "75": "Paris", "76": "Seine-Maritime", "77": "Seine-et-Marne", "78": "Yvelines", "79": "Deux-Sevres", "80": "Somme", "81": "Tarn", "82": "Tarn-et-Garonne", "83": "Var", "84": "Vaucluse", "85": "Vendee", "86": "Vienne", "87": "Haute-Vienne", "88": "Vosges", "89": "Yonne", "90": "Territoire de Belfort", "91": "Essonne", "92": "Hauts-de-Seine", "93": "Seine-Saint-Denis", "94": "Val-de-Marne", "95": "Val-d'Oise"
};

const REGIONS_DEPTS: Record<string, string[]> = {
  "Auvergne-Rhone-Alpes": ["01", "03", "07", "15", "26", "38", "42", "43", "63", "69", "73", "74"],
  "Bourgogne-Franche-Comte": ["21", "25", "39", "58", "70", "71", "89", "90"],
  "Bretagne": ["22", "29", "35", "56"],
  "Centre-Val de Loire": ["18", "28", "36", "37", "41", "45"],
  "Corse": ["2A", "2B"],
  "Grand Est": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"],
  "Hauts-de-France": ["02", "59", "60", "62", "80"],
  "Ile-de-France": ["75", "77", "78", "91", "92", "93", "94", "95"],
  "Normandie": ["14", "27", "50", "61", "76"],
  "Nouvelle-Aquitaine": ["16", "17", "19", "23", "24", "33", "40", "47", "64", "79", "86", "87"],
  "Occitanie": ["09", "11", "12", "30", "31", "32", "34", "46", "48", "65", "66", "81", "82"],
  "Pays de la Loire": ["44", "49", "53", "72", "85"],
  "Provence-Alpes-Cote d'Azur": ["04", "05", "06", "13", "83", "84"]
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
function chipText(key: string, value: string): string {
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
  if (key === "dept") return `${label} : ${value} - ${DEPT_NAMES[value] ?? ""}`.trim();
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
export function TournamentFilterFields({ prefix }: { prefix: string }) {
  const { searchParams, update } = useParamUpdater();
  const selectedRegion = searchParams.get("region") || "";

  // Départements proposés : ceux de la région choisie, sinon tous
  const deptsList = selectedRegion && REGIONS_DEPTS[selectedRegion]
    ? REGIONS_DEPTS[selectedRegion]
    : Object.values(REGIONS_DEPTS).flat().sort();

  const sections: { title: string; icon: ReactNode; filters: FilterDef[] }[] = [
    {
      title: "Localisation",
      icon: <MapPin size={16} aria-hidden="true" />,
      filters: [
        { name: "region", label: "Région", type: "select", options: Object.keys(REGIONS_DEPTS).sort().map((region) => ({ value: region, label: region })) },
        { name: "dept", label: "Département", type: "select", options: deptsList.map((dept) => ({ value: dept, label: `${dept} - ${DEPT_NAMES[dept] || ""}` })) },
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
export function TournamentFilterAside() {
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
        <TournamentFilterFields prefix="aside" />
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

export function TournamentListControls({ total }: { total: number }) {
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
    .map(([key, value]) => ({ key, text: chipText(key, value) }));

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
            <TournamentFilterFields prefix="sheet" />
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
