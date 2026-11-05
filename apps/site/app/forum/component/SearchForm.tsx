"use client";

/**
 * Formulaire de la recherche avancée du forum (refonte, carte 088).
 * - Le champ des mots-clés et le bouton « Lancer la recherche » sont toujours visibles.
 * - Sur ordinateur, les quatre filtres (auteur, forum, période, tri) sont affichés sous le champ, sur une ligne.
 * - Sur téléphone, ils sont rangés dans un panneau qui monte du bas, ouvert par le bouton « Filtres » ; ce bouton
 *   indique combien de filtres sont actifs.
 * - Sous le formulaire, une pastille par filtre actif rappelle ce qui restreint les résultats ; un appui sur la
 *   pastille retire ce filtre.
 * L'adresse de la page reste celle d'avant (`?q=`, `author`, `forumId`, `date`, `sortBy`) : la recherche est lancée en
 * changeant l'adresse, et la page serveur relit ces paramètres.
 */
import { useEffect, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button, Card, CountBadge, DESKTOP_QUERY, Field, Input, Select, Sheet, SheetContent, useMediaQuery } from "@bbfrance/ui";

export interface ForumOption {
  id: string;
  name: string;
  level: number;
}

interface SearchFormProps {
  initialQuery?: string;
  initialForumId?: string;
  initialAuthor?: string;
  initialDate?: string;
  initialSortBy?: string;
  forums: ForumOption[];
}

/** Périodes proposées : valeur du paramètre `date` de l'adresse, libellé de la liste et libellé court de la pastille. */
const PERIODS = [
  { value: "all", label: "Toutes les dates", chip: "" },
  { value: "7d", label: "Depuis 7 jours", chip: "7 derniers jours" },
  { value: "30d", label: "Depuis 1 mois", chip: "30 derniers jours" },
  { value: "1y", label: "Depuis 1 an", chip: "Dernière année" },
];

interface SearchValues {
  q: string;
  author: string;
  forumId: string;
  date: string;
  sortBy: string;
}

/** Adresse de la recherche pour ces valeurs : seuls les paramètres utiles sont écrits (comme avant la refonte). */
function searchHref(values: SearchValues): string {
  const params = new URLSearchParams();
  if (values.q.trim()) params.set("q", values.q.trim());
  if (values.forumId) params.set("forumId", values.forumId);
  if (values.author.trim()) params.set("author", values.author.trim());
  if (values.date !== "all") params.set("date", values.date);
  if (values.sortBy !== "relevance") params.set("sortBy", values.sortBy);
  return `/forum/search?${params.toString()}`;
}

export default function SearchForm({
  initialQuery = "",
  initialForumId = "",
  initialAuthor = "",
  initialDate = "all",
  initialSortBy = "relevance",
  forums,
}: SearchFormProps) {
  const router = useRouter();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [isPending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [q, setQ] = useState(initialQuery);
  const [forumId, setForumId] = useState(initialForumId);
  const [author, setAuthor] = useState(initialAuthor);
  const [date, setDate] = useState(initialDate);
  const [sortBy, setSortBy] = useState(initialSortBy);
  // Quand l'adresse change (bouton retour du navigateur, pastille retirée), la page recrée ce formulaire (attribut
  // `key`) : il repart alors des valeurs de la nouvelle adresse.

  // Sur ordinateur, avant toute recherche, le curseur est placé dans le champ des mots-clés. Pas sur téléphone :
  // le clavier s'ouvrirait tout seul et cacherait la page.
  useEffect(() => {
    if (isDesktop && !initialQuery) document.getElementById("search-q")?.focus();
  }, [isDesktop, initialQuery]);

  const submit = () => {
    setFiltersOpen(false);
    startTransition(() => {
      router.push(searchHref({ q, author, forumId, date, sortBy }));
    });
  };

  // Pastilles des filtres actifs, lues dans l'adresse (ce qui a vraiment servi à la recherche affichée)
  const current: SearchValues = { q: initialQuery, author: initialAuthor, forumId: initialForumId, date: initialDate, sortBy: initialSortBy };
  const forumName = forums.find((forum) => forum.id === initialForumId)?.name;
  const chips: { label: string; href: string }[] = [];
  if (initialAuthor) chips.push({ label: `Auteur : ${initialAuthor}`, href: searchHref({ ...current, author: "" }) });
  if (initialForumId) chips.push({ label: `Forum : ${forumName ?? "forum choisi"}`, href: searchHref({ ...current, forumId: "" }) });
  const period = PERIODS.find((item) => item.value === initialDate);
  if (period?.chip) chips.push({ label: period.chip, href: searchHref({ ...current, date: "all" }) });
  // Le tri par défaut est la pertinence (carte 191) : un tri par date est un choix, retiré par sa pastille
  if (initialSortBy === "desc") chips.push({ label: "Plus récents d'abord", href: searchHref({ ...current, sortBy: "relevance" }) });
  if (initialSortBy === "asc") chips.push({ label: "Plus anciens d'abord", href: searchHref({ ...current, sortBy: "relevance" }) });

  /** Les quatre filtres ; `prefix` distingue les champs du panneau de ceux de la page (identifiants uniques). */
  const filterFields = (prefix: string): ReactNode => (
    <>
      <Field label="Auteur" htmlFor={`${prefix}-author`}>
        <Input
          id={`${prefix}-author`}
          type="text"
          placeholder="Ex : Admin, Nuffle…"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          autoComplete="off"
        />
      </Field>
      <Field label="Forum" htmlFor={`${prefix}-forum`}>
        <Select id={`${prefix}-forum`} value={forumId} onChange={(event) => setForumId(event.target.value)}>
          <option value="">Tous les forums</option>
          {forums.map((forum) => (
            <option key={forum.id} value={forum.id}>
              {" ".repeat(forum.level * 4)}
              {forum.level > 0 ? "↳ " : ""}
              {forum.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Période" htmlFor={`${prefix}-date`}>
        <Select id={`${prefix}-date`} value={date} onChange={(event) => setDate(event.target.value)}>
          {PERIODS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Trier par" htmlFor={`${prefix}-sort`}>
        <Select id={`${prefix}-sort`} value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="relevance">Pertinence</option>
          <option value="desc">Plus récents d&apos;abord</option>
          <option value="asc">Plus anciens d&apos;abord</option>
        </Select>
      </Field>
    </>
  );

  return (
    <div className="flex flex-col gap-3">
      <Card className="p-3 lg:p-4">
        <form
          role="search"
          aria-label="Rechercher dans le forum"
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="flex items-end gap-2">
            <div className="relative min-w-0 flex-1">
              <Search size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bb-text-muted" />
              <Input
                id="search-q"
                type="text"
                aria-label="Mots-clés"
                placeholder="Rechercher…"
                value={q}
                onChange={(event) => setQ(event.target.value)}
                enterKeyHint="search"
                className="pl-10"
              />
            </div>
            {/* Sur téléphone, seule la loupe est affichée ; le nom du bouton reste lu par les lecteurs d'écran */}
            <Button type="submit" variant="primary" size="tap" disabled={isPending} className="shrink-0 max-lg:w-11 max-lg:px-0">
              <Search size={18} aria-hidden="true" />
              <span className="max-lg:sr-only">{isPending ? "Recherche en cours…" : "Lancer la recherche"}</span>
            </Button>
          </div>

          {/* Ordinateur : les filtres sur une ligne */}
          <div className="hidden gap-3 lg:grid lg:grid-cols-4">{filterFields("search")}</div>

          {/* Téléphone : bouton du panneau des filtres */}
          <Button type="button" variant="secondary" size="tap" className="w-full lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={18} aria-hidden="true" />
            Filtres
            <CountBadge count={chips.length} aria-label={`${chips.length} actif${chips.length > 1 ? "s" : ""}`} />
          </Button>
        </form>
      </Card>

      {chips.length > 0 && (
        <ul aria-label="Filtres actifs" className="m-0 flex list-none flex-wrap gap-2 p-0">
          {chips.map((chip) => (
            <li key={chip.label}>
              <Link
                href={chip.href}
                aria-label={`Retirer le filtre ${chip.label}`}
                className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full border border-bb-border bg-bb-surface-2 py-1 pr-2 pl-3 text-sm font-semibold text-bb-text no-underline hover:border-bb-text-muted focus-visible:outline-2 focus-visible:outline-bb-focus lg:min-h-9"
              >
                <span className="min-w-0 truncate">{chip.label}</span>
                <X size={16} aria-hidden="true" className="shrink-0 text-bb-text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent title="Filtres de recherche">
          <div className="flex flex-col gap-4 pt-2 pb-2">
            {filterFields("sheet")}
            <Button type="button" variant="primary" size="tap" className="w-full" onClick={submit}>
              <Search size={18} aria-hidden="true" /> Lancer la recherche
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
