"use client";

/**
 * Classement du Championnat de France (CDF) `/classement` (refonte, carte 097, ADR 0006).
 * En-tête compact « Championnat de France » avec le bouton d'aide « Comment sont calculés les points ? » et, pour la
 * modération, le menu « Gestion du classement ». Puis cinq onglets : l'année en cours (calcul direct), le classement
 * glissant sur 12 mois, le meilleur coach par roster, le Hall of Fame (podium de chaque année) et les archives
 * (classements figés). Une liste déroulante permet de choisir une autre année calculée ou une autre archive.
 * Les lignes du classement se déplient (`RankingList`) pour montrer les meilleurs tournois retenus.
 *
 * Actions de la modération (menu « Gestion du classement », panneau du bas sur téléphone) :
 * - sur une année calculée : « Archiver l'année », après confirmation ;
 * - sur une archive : « Modifier l'archive » et, pour un administrateur, « Supprimer l'archive » (deux confirmations) ;
 * - sur l'onglet Archives : « Importer des archives » depuis l'ancien site (teamfrancebb.fr) et « Créer une archive ».
 * Les données, les droits et les actions serveur (`app/classement/actions.ts`) sont ceux d'avant la refonte.
 *
 * L'onglet « Par roster » porte sur une année : par défaut celle choisie dans l'onglet « Année », et une liste
 * déroulante permet d'en choisir une autre (carte 142). L'import d'archives ouvre directement l'éditeur, qui interroge
 * l'ancien site une seule fois et affiche lui-même l'erreur éventuelle.
 */
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Download, HelpCircle, History, Medal, Pencil, Plus, Settings2, Shield, Trash2 } from "lucide-react";
import {
  ActionMenu,
  Button,
  ConfirmDialog,
  DESKTOP_QUERY,
  EmptyState,
  Field,
  Input,
  Label,
  Select,
  Sheet,
  SheetContent,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  toast,
  useMediaQuery,
  cn,
} from "@bbfrance/ui";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import { PanelTitle, panelItemClass } from "@/common/components/SiteLayout/SiteLayout";
import { useSyncUrlFilters } from "@/common/hooks/useUrlFilters";
import { isAdmin, isModerator } from "@/lib/roles";
import {
  archiveYear,
  deleteArchive,
  getHallOfFame,
  getRanking,
  getRankingYears,
  type RankingFilter,
} from "./actions";
import { HallOfFame, RankingList, RosterList, type HallOfFameYear, type RankingEntry } from "./component/RankingViews";

type RankingYear = { year: number; isArchived: boolean };
type TabValue = "year" | "rolling" | "roster" | "hof" | "archives";

/** Les vues du classement, dans l'ordre (le libellé « Année » reçoit l'année en cours à l'affichage). */
const RANKING_TABS: { value: TabValue; label: string }[] = [
  { value: "year", label: "Année" },
  { value: "rolling", label: "Glissant" },
  { value: "roster", label: "Par roster" },
  { value: "hof", label: "Palmarès" },
  { value: "archives", label: "Archives" },
];

/** Vue du classement lue dans l'adresse (`?vue=CDF_2026`, `ROLLING`, `ROSTER_2025`, `HOF`, `ARCHIVES`), ou rien. */
function readRankingFilter(value: string | null): RankingFilter | null {
  return value && /^(ROLLING|HOF|ARCHIVES|CDF_\d{4}|ROSTER_\d{4})$/.test(value) ? value : null;
}

// useSearchParams demande une limite Suspense (exigence de Next.js)
export default function ClassementPage() {
  return (
    <Suspense fallback={null}>
      <Classement />
    </Suspense>
  );
}

function Classement() {
  const { data: session } = useSession();
  const router = useRouter();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  // La vue affichée est gardée dans l'adresse : un lien partagé ou un retour arrière la retrouve (carte 196)
  const searchParams = useSearchParams();
  const [filterFromUrl] = useState(() => readRankingFilter(searchParams.get("vue")));
  const [filter, setFilter] = useState<RankingFilter>(filterFromUrl ?? "ROLLING");
  useSyncUrlFilters({ vue: filter });
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [hof, setHof] = useState<HallOfFameYear[]>([]);
  const [availableYears, setAvailableYears] = useState<RankingYear[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteConfirmLevel2Open, setIsDeleteConfirmLevel2Open] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isOverwriteConfirmOpen, setIsOverwriteConfirmOpen] = useState(false);
  const [importYear, setImportYear] = useState(new Date().getFullYear() - 1);
  // Erreur affichée sous le champ de l'année (carte 194)
  const [importYearError, setImportYearError] = useState<string>();
  const [isImportLoading, setIsImportLoading] = useState(false);
  // Dernière année choisie dans l'onglet « Année » : l'onglet « Par roster » la reprend
  const [chosenYear, setChosenYear] = useState<number | null>(null);
  const [pending, setPending] = useState(false);

  const user = session?.user as { role?: string } | undefined;
  const isMod = isModerator(user?.role);
  const isAdminUser = isAdmin(user?.role);

  const currentYearData = availableYears.find((y) => `CDF_${y.year}` === filter);
  const isSelectedYearArchived = currentYearData?.isArchived || false;
  const isYearView = filter.startsWith("CDF_") && !isSelectedYearArchived;
  const isArchiveView = filter === "ARCHIVES" || (filter.startsWith("CDF_") && isSelectedYearArchived);
  const liveYears = availableYears.filter((y) => !y.isArchived);
  const archivedYears = availableYears.filter((y) => y.isArchived);
  const latestLiveYear = liveYears[0]?.year || new Date().getFullYear();
  const isRosterView = filter === "ROSTER" || filter.startsWith("ROSTER_");
  const rosterYear = filter.startsWith("ROSTER_") ? parseInt(filter.split("_")[1]) : new Date().getFullYear();
  // Années proposées dans l'onglet « Par roster » : celles qui ont des résultats, et toujours celle affichée
  const rosterYears = Array.from(new Set([rosterYear, ...availableYears.map((y) => y.year)])).sort((a, b) => b - a);

  useEffect(() => {
    async function loadYears() {
      const years = await getRankingYears();
      setAvailableYears(years);
      // Au premier chargement, la plus récente des années disponibles est affichée, sauf si l'adresse en choisit une
      if (years.length > 0 && filter === "ROLLING" && !filterFromUrl) {
        setFilter(`CDF_${years[0].year}`);
      }
    }
    loadYears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (filter === "HOF") {
          setHof(await getHallOfFame());
        } else {
          setRanking(await getRanking(filter));
        }
      } catch (error) {
        console.error("Error fetching ranking:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filter]);

  const activeTab: TabValue = isYearView ? "year" : isArchiveView ? "archives" : isRosterView ? "roster" : filter === "HOF" ? "hof" : "rolling";

  const changeTab = (value: string) => {
    if (value === "year") {
      const latest = availableYears.find((y) => !y.isArchived);
      setFilter(`CDF_${latest ? latest.year : new Date().getFullYear()}`);
      setChosenYear(null);
    } else if (value === "archives") {
      const firstArchive = availableYears.find((y) => y.isArchived);
      setFilter(firstArchive ? `CDF_${firstArchive.year}` : "ARCHIVES");
    } else if (value === "roster") {
      setFilter(`ROSTER_${chosenYear ?? latestLiveYear}`);
    } else {
      setFilter(value === "rolling" ? "ROLLING" : "HOF");
    }
  };

  async function reloadYears() {
    setAvailableYears(await getRankingYears());
  }

  // L'ancien site est interrogé une seule fois, par l'éditeur d'archives (`edit-archive/page.tsx`), qui affiche
  // lui-même l'erreur si l'import échoue.
  function handleImport() {
    if (Number.isNaN(importYear)) {
      setImportYearError("Indique l'année à importer.");
      document.getElementById("import-year")?.focus();
      return;
    }
    if (availableYears.some((y) => y.year === importYear)) {
      // Année déjà présente : on demande avant d'ouvrir l'éditeur avec les données importées
      setIsImportOpen(false);
      setIsOverwriteConfirmOpen(true);
    } else {
      // La fenêtre reste ouverte (« Importation… ») pendant que l'éditeur interroge l'ancien site
      setIsImportLoading(true);
      router.push(`/classement/edit-archive?importYear=${importYear}`);
    }
  }

  async function handleArchive() {
    if (!currentYearData) return;
    setPending(true);
    const res = await archiveYear(currentYearData.year);
    setPending(false);
    setIsArchiveConfirmOpen(false);
    if (res.success) {
      toast.success("Classement archivé avec succès !");
      await reloadYears();
    } else {
      toast.error(res.error || "Une erreur est survenue");
    }
  }

  async function handleDeleteArchive() {
    if (!currentYearData) return;
    setPending(true);
    const res = await deleteArchive(currentYearData.year);
    setPending(false);
    setIsDeleteConfirmLevel2Open(false);
    if (res.success) {
      toast.success("Archive supprimée.");
      await reloadYears();
    } else {
      toast.error(res.error || "Une erreur est survenue");
    }
  }

  const managementMenu = isMod && (
    <ActionMenu
      label="Gestion du classement"
      title="Gestion du classement"
      linkComponent={Link}
      trigger={
        <span className="inline-flex items-center gap-2 px-3 text-[0.95rem] font-semibold">
          <Settings2 size={18} aria-hidden="true" /> Gestion
        </span>
      }
      triggerClassName="border border-solid border-bb-border bg-bb-surface-2 text-bb-text"
      items={[
        {
          label: `Archiver l'année ${currentYearData?.year ?? ""}`.trim(),
          icon: <Shield size={18} aria-hidden="true" />,
          onSelect: () => setIsArchiveConfirmOpen(true),
          hidden: !isYearView || !currentYearData,
        },
        {
          label: "Modifier l'archive",
          icon: <Pencil size={18} aria-hidden="true" />,
          href: `/classement/edit-archive?year=${currentYearData?.year}`,
          hidden: !(filter.startsWith("CDF_") && isSelectedYearArchived),
        },
        {
          label: "Supprimer l'archive",
          icon: <Trash2 size={18} aria-hidden="true" />,
          onSelect: () => setIsDeleteConfirmOpen(true),
          danger: true,
          hidden: !(filter.startsWith("CDF_") && isSelectedYearArchived && isAdminUser),
        },
        {
          label: "Importer des archives",
          icon: <Download size={18} aria-hidden="true" />,
          onSelect: () => setIsImportOpen(true),
          hidden: !isArchiveView,
        },
        {
          label: "Créer une archive",
          icon: <Plus size={18} aria-hidden="true" />,
          href: "/classement/edit-archive",
          hidden: !isArchiveView,
        },
      ]}
    />
  );

  // Phrase au-dessus du classement : ce que montre la liste affichée
  const periodNote =
    filter === "ROLLING"
      ? "Les 4 meilleurs résultats de chaque coach sur les 12 derniers mois."
      : isRosterView
        ? `Le meilleur coach de chaque roster en ${rosterYear} (ses 2 meilleurs résultats avec ce roster).`
        : filter === "HOF"
          ? "Le podium de chaque année du Championnat de France."
          : isArchiveView
            ? "Classement figé par la modération à la fin de la saison."
            : "Les 4 meilleurs résultats de chaque coach sur l'année, calculés en direct.";

  return (
    <div className="mx-auto w-full max-w-[1760px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6 xl:px-8">
      <ForumListHeader
        title="Championnat de France"
        subtitle="Le classement des coachs de la communauté Blood Bowl France"
        backHref="/"
        backTitle="Retour"
        backPreferHistory
      >
        <div className="flex w-full items-center gap-2 lg:w-auto">
          {/* Sur un petit téléphone, le libellé passe sur deux lignes plutôt que de pousser « Gestion » hors de l'écran */}
          <Button type="button" variant="secondary" size="tap" className="min-w-0 py-1.5 text-left whitespace-normal max-lg:flex-1 lg:hidden" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle size={18} aria-hidden="true" /> Comment sont calculés les points ?
          </Button>
          {managementMenu}
        </div>
      </ForumListHeader>

      {/* Ordinateur : les vues dans le panneau gauche (DESIGN.md) ; téléphone : rangée d'onglets */}
      <div className="flex flex-col lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-6 xl:gap-8">
        <aside aria-label="Vues du classement" className="hidden lg:sticky lg:top-20 lg:flex lg:flex-col lg:gap-5">
          <nav aria-labelledby="ranking-views-title" className="flex flex-col">
            <PanelTitle id="ranking-views-title">Vues</PanelTitle>
            {RANKING_TABS.map((tab) => (
              <Button
                key={tab.value}
                type="button"
                variant="quiet"
                aria-current={activeTab === tab.value ? "page" : undefined}
                onClick={() => changeTab(tab.value)}
                className={cn(panelItemClass(activeTab === tab.value), "h-auto justify-start rounded-none font-normal hover:bg-transparent")}
              >
                {tab.value === "year" ? `Année ${latestLiveYear}` : tab.label}
              </Button>
            ))}
          </nav>
          <Button type="button" variant="secondary" size="tap" className="w-full justify-start whitespace-normal text-left" onClick={() => setIsHelpOpen(true)}>
            Comment sont calculés les points ?
          </Button>
        </aside>
        <div className="flex min-w-0 flex-col">
      <Tabs value={activeTab} onValueChange={changeTab} className="lg:hidden">
        <TabsList aria-label="Vues du classement" className="max-lg:-mx-3 max-lg:px-3">
          <TabsTrigger value="year">
            Année {latestLiveYear}
          </TabsTrigger>
          <TabsTrigger value="rolling">
            Glissant
          </TabsTrigger>
          <TabsTrigger value="roster">
            Par roster
          </TabsTrigger>
          <TabsTrigger value="hof">
            Palmarès
          </TabsTrigger>
          <TabsTrigger value="archives">
            Archives
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-end lg:justify-between">
        <p className="m-0 flex items-start gap-1.5 text-sm text-bb-text-muted">
          {periodNote}
        </p>
        {isYearView && liveYears.length > 1 && (
          <div className="flex flex-col gap-1.5 lg:w-64">
            <Label htmlFor="cdf-year">Année</Label>
            <Select
              id="cdf-year"
              aria-label="Choisir l'année"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as RankingFilter);
                setChosenYear(parseInt(e.target.value.split("_")[1]));
              }}
            >
              {liveYears.map((y) => (
                <option key={y.year} value={`CDF_${y.year}`}>
                  Année {y.year} (calcul direct)
                </option>
              ))}
            </Select>
          </div>
        )}
        {isRosterView && (
          <div className="flex flex-col gap-1.5 lg:w-64">
            <Label htmlFor="cdf-roster-year">Année</Label>
            <Select id="cdf-roster-year" aria-label="Choisir l'année du classement par roster" value={`ROSTER_${rosterYear}`} onChange={(e) => setFilter(e.target.value as RankingFilter)}>
              {rosterYears.map((year) => (
                <option key={year} value={`ROSTER_${year}`}>
                  Année {year}
                </option>
              ))}
            </Select>
          </div>
        )}
        {isArchiveView && archivedYears.length > 0 && (
          <div className="flex flex-col gap-1.5 lg:w-64">
            <Label htmlFor="cdf-archive">Archive</Label>
            <Select id="cdf-archive" aria-label="Choisir une archive" value={filter.startsWith("CDF_") ? filter : ""} onChange={(e) => setFilter(e.target.value as RankingFilter)}>
              <option value="" disabled>Choisir une année…</option>
              {archivedYears.map((y) => (
                <option key={y.year} value={`CDF_${y.year}`}>
                  Archive {y.year}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Chargement du classement">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : filter === "HOF" ? (
        hof.length > 0 ? <HallOfFame years={hof} /> : <EmptyState icon={<Medal size={40} />} title="Aucune année terminée pour l'instant." />
      ) : filter === "ARCHIVES" ? (
        <EmptyState icon={<History size={40} />} title="Aucune archive pour l'instant.">
          Les classements figés par la modération à la fin de chaque saison apparaîtront ici.
        </EmptyState>
      ) : ranking.length === 0 ? (
        <EmptyState icon={<History size={40} />} title="Aucun résultat enregistré pour cette période.">
          Les tournois terminés et validés par les commissaires apparaîtront ici.
        </EmptyState>
      ) : isRosterView ? (
        <RosterList entries={ranking} />
      ) : (
        <RankingList entries={ranking} />
      )}

      <p className="mt-8 text-sm text-bb-text-muted">
        Le Championnat de France est régi par les règles de la Team France Blood Bowl.
      </p>
        </div>
      </div>

      <Sheet open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <SheetContent title="Calcul des points CDF" side={isDesktop ? "center" : "bottom"}>
          <div className="flex flex-col gap-3 pb-2 text-[0.95rem] text-bb-text">
            <p className="m-0">
              Le <strong>Championnat de France</strong> utilise une formule pondérée pour valoriser la performance et
              l&apos;ampleur des tournois :
            </p>
            <ul className="m-0 flex flex-col gap-2 pl-5">
              <li>
                <strong>Sélection des scores :</strong> seuls tes 4 meilleurs résultats sur la période (12 mois glissants
                ou année civile) sont cumulés pour ton score total.
              </li>
              <li>
                <strong>La formule :</strong> <code className="rounded-bb-sm bg-bb-surface-2 px-1">Score = R × (Nc − Pl) / (Nc + Pl − 2)</code>
                <br />
                <span className="text-sm text-bb-text-muted">Nc = nombre de participants, Pl = ta place, R = valeur de référence du tournoi.</span>
              </li>
              <li>
                <strong>Poids du tournoi (R) :</strong> le score maximum (R) dépend du type de tournoi (100 en individuel),
                augmenté selon le nombre de rondes et de participants.
              </li>
              <li>
                <strong>Équité :</strong> le vainqueur d&apos;un tournoi reçoit toujours le score R maximum calculé pour cet
                événement.
              </li>
            </ul>
            <p className="m-0 flex items-start gap-1.5 text-sm text-bb-text-muted">
                  Pour le classement par roster, seuls les 2 meilleurs scores avec la même race sont retenus.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isImportOpen} onOpenChange={setIsImportOpen}>
        <SheetContent title="Importer des archives" side={isDesktop ? "center" : "bottom"}>
          <div className="flex flex-col gap-4 pb-2">
            <p className="m-0 text-[0.95rem] text-bb-text">Indique l&apos;année à récupérer depuis l&apos;ancien site (teamfrancebb.fr).</p>
            <Field label="Année cible" htmlFor="import-year" hint="L'import récupère les noms, les numéros NAF et les points totaux, puis ouvre l'éditeur d'archives." error={importYearError}>
              <Input
                id="import-year"
                type="number"
                inputMode="numeric"
                value={Number.isNaN(importYear) ? "" : importYear}
                onChange={(e) => {
                  setImportYear(parseInt(e.target.value));
                  setImportYearError(undefined);
                }}
                min={2000}
                max={new Date().getFullYear()}
              />
            </Field>
            <div className="flex flex-col gap-2 lg:flex-row-reverse">
              <Button type="button" variant="primary" size="tap" className="w-full lg:w-auto" disabled={isImportLoading} onClick={handleImport}>
                <Download size={18} aria-hidden="true" /> {isImportLoading ? "Importation…" : "Lancer l'import"}
              </Button>
              <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" onClick={() => setIsImportOpen(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={isArchiveConfirmOpen}
        onOpenChange={setIsArchiveConfirmOpen}
        title="Confirmer l'archivage"
        message={`Tu veux figer le classement de l'année ${currentYearData?.year ?? ""} ? Un instantané sera pris et affiché à la place du calcul en direct.`}
        confirmLabel="Archiver"
        pending={pending}
        onConfirm={handleArchive}
      />

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Supprimer l'archive (1/2)"
        message="Tu veux vraiment supprimer cette archive ? Le classement de cette année sera de nouveau calculé en direct."
        confirmLabel="Continuer"
        danger
        onConfirm={() => {
          setIsDeleteConfirmOpen(false);
          setIsDeleteConfirmLevel2Open(true);
        }}
      />

      <ConfirmDialog
        open={isDeleteConfirmLevel2Open}
        onOpenChange={setIsDeleteConfirmLevel2Open}
        title="Confirmation finale (2/2)"
        message="Cette action est irréversible. Tu confirmes la suppression définitive de l'archive ?"
        confirmLabel="Supprimer définitivement"
        danger
        pending={pending}
        onConfirm={handleDeleteArchive}
      />

      <ConfirmDialog
        open={isOverwriteConfirmOpen}
        onOpenChange={setIsOverwriteConfirmOpen}
        title={`L'année ${importYear} existe déjà`}
        message={`L'année ${importYear} est déjà présente. L'importer écrasera les données actuelles dans l'éditeur. Continuer ?`}
        confirmLabel="Continuer"
        onConfirm={() => {
          setIsOverwriteConfirmOpen(false);
          setIsImportLoading(true);
          router.push(`/classement/edit-archive?importYear=${importYear}`);
        }}
      />
    </div>
  );
}
