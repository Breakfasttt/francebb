"use client";

/**
 * Réglages de la liste des articles `/articles` (refonte, carte 095, ADR 0006), sur le modèle de `/tournois`
 * (carte 089) et `/ligues` (carte 094) :
 * - `ArticleFilterAside` : la colonne « Filtres » de l'ordinateur (tags, auteur, « Réinitialiser ») ;
 * - `ArticleListControls` : la barre au-dessus des résultats (recherche dans le titre et le texte, bouton « Filtres »
 *   du téléphone, tri, affichage en grille ou en liste), les pastilles des filtres actifs, chacune avec une croix qui
 *   retire ce filtre, et le panneau « Filtrer les articles » du téléphone.
 * Chaque réglage change l'adresse de la page (`?query&tag&author&sort&view`), que la page serveur relit : les
 * paramètres sont les mêmes qu'avant la refonte (plusieurs tags sont séparés par des virgules). Changer un filtre
 * ramène à la première page des résultats. « Réinitialiser » retire les tags, l'auteur et le tri, et garde la
 * recherche et l'affichage.
 * Avant la refonte, ces réglages étaient dans une colonne `ArticleFilterSidebar`, rangée sur téléphone derrière le
 * bouton flottant de `MobileFilterWrapper`.
 */
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, LayoutList, Search, SlidersHorizontal, User, X } from "lucide-react";
import { Button, CountBadge, Input, Label, Select, Sheet, SheetContent, cn } from "@bbfrance/ui";
import TagSelector from "@/common/components/TagSelector/TagSelector";
import { useDebounce } from "@/common/hooks/useDebounce";

const SORT_OPTIONS = [
  { value: "date_desc", label: "Plus récents" },
  { value: "date_asc", label: "Plus anciens" },
  { value: "title_asc", label: "Titre (A-Z)" },
  { value: "reactions_desc", label: "Plus populaires" },
];

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
  const tags = searchParams.get("tag") ? searchParams.get("tag")!.split(",").filter(Boolean) : [];
  return { searchParams, hrefWith, update, tags };
}

/** Adresse sans filtre : on garde la recherche et l'affichage. */
const RESET = { tag: "", author: "", sort: "" };

/**
 * Champ « Auteur » : le filtre est appliqué à l'appui sur Entrée ou quand on quitte le champ, comme avant la refonte.
 * La page lui donne pour clé la valeur de l'adresse : il repart de cette valeur quand un filtre est retiré.
 */
function AuthorField({ id, initial, onApply }: { id: string; initial: string; onApply: (value: string) => void }) {
  const [author, setAuthor] = useState(initial);
  const apply = () => {
    if (author.trim() !== initial) onApply(author.trim());
  };
  return (
    <div className="relative">
      <User size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bb-text-muted" />
      <Input
        id={id}
        type="text"
        value={author}
        onChange={(event) => setAuthor(event.target.value)}
        onBlur={apply}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            apply();
          }
        }}
        placeholder="Nom de l'auteur…"
        enterKeyHint="search"
        className="pl-10"
      />
    </div>
  );
}

/** Les filtres (tags et auteur). `prefix` rend les identifiants des champs uniques (colonne ou panneau). */
function ArticleFilterFields({ prefix, availableTags }: { prefix: string; availableTags: string[] }) {
  const { searchParams, update, tags } = useParamUpdater();
  const urlAuthor = searchParams.get("author") || "";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${prefix}-tag`}>Tags</Label>
        <TagSelector
          id={`${prefix}-tag`}
          value={tags}
          onChange={(next) => update({ tag: next.join(",") })}
          suggestions={availableTags}
          placeholder="Chercher un tag…"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${prefix}-author`}>Auteur</Label>
        <AuthorField key={urlAuthor} id={`${prefix}-author`} initial={urlAuthor} onApply={(value) => update({ author: value })} />
      </div>
    </div>
  );
}

/** Colonne des filtres de l'ordinateur (masquée sur téléphone, où le panneau « Filtrer les articles » la remplace). */
export function ArticleFilterAside({ availableTags }: { availableTags: string[] }) {
  const { hrefWith } = useParamUpdater();
  return (
    <aside aria-label="Filtres des articles" className="hidden lg:block">
      <div className="sticky top-20 flex flex-col gap-4 rounded-bb-lg border border-bb-border bg-bb-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="m-0 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">Filtres</h2>
          <Button asChild variant="quiet" size="tap" className="px-2 text-sm">
            <Link href={hrefWith(RESET)} scroll={false}>Réinitialiser</Link>
          </Button>
        </div>
        <ArticleFilterFields prefix="aside" availableTags={availableTags} />
      </div>
    </aside>
  );
}

export function ArticleListControls({ total, availableTags }: { total: number; availableTags: string[] }) {
  const { searchParams, hrefWith, update, tags } = useParamUpdater();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const currentSort = searchParams.get("sort") || "date_desc";
  const currentView = searchParams.get("view") === "list" ? "list" : "grid";
  const author = searchParams.get("author") || "";

  // Recherche dans le titre et le texte : l'adresse change 400 ms après la dernière touche (avant, à l'appui sur
  // Entrée ou en quittant le champ)
  const urlQuery = searchParams.get("query") || "";
  const [query, setQuery] = useState(urlQuery);
  const debouncedQuery = useDebounce(query, 400);
  useEffect(() => {
    if (debouncedQuery.trim() !== urlQuery) update({ query: debouncedQuery.trim() });
    // `update` change à chaque rendu ; seule la saisie déclenche la recherche
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Pastilles : une par tag, plus l'auteur
  const chips = [
    ...tags.map((tag) => ({ key: `tag-${tag}`, text: `Tag : ${tag}`, href: hrefWith({ tag: tags.filter((item) => item !== tag).join(",") }) })),
    ...(author ? [{ key: "author", text: `Auteur : ${author}`, href: hrefWith({ author: "" }) }] : []),
  ];

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
            aria-label="Rechercher un article (titre ou texte)"
            placeholder="Rechercher dans les titres et les textes…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            enterKeyHint="search"
            className="pl-10"
          />
        </div>
        <div className="flex min-w-0 items-center gap-2">
          {/* Téléphone : les tags et l'auteur sont dans un panneau */}
          <Button type="button" variant="secondary" size="tap" className="shrink-0 px-3 lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={18} aria-hidden="true" />
            Filtres
            <CountBadge count={chips.length} aria-label={`${chips.length} actif${chips.length > 1 ? "s" : ""}`} />
          </Button>
          <Select
            aria-label="Trier par"
            value={currentSort}
            onChange={(event) => update({ sort: event.target.value })}
            className="min-w-0 flex-1 lg:w-52 lg:flex-none"
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
                href={chip.href}
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
        <SheetContent title="Filtrer les articles">
          <div className="flex flex-col gap-4 pt-2">
            <ArticleFilterFields prefix="sheet" availableTags={availableTags} />
            <div className="flex gap-2 border-t border-bb-border pt-3 pb-1">
              <Button asChild variant="secondary" size="tap">
                <Link href={hrefWith(RESET)} scroll={false}>Réinitialiser</Link>
              </Button>
              <Button type="button" variant="primary" size="tap" className="flex-1" onClick={() => setFiltersOpen(false)}>
                Voir {total} article{total > 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
