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
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Download, HelpCircle, History, Info, Medal, Pencil, Plus, Settings2, Shield, Trash2, Trophy, Users } from "lucide-react";
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
} from "@bbfrance/ui";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import { isAdmin, isModerator } from "@/lib/roles";
import {
  archiveYear,
  deleteArchive,
  fetchLegacyRanking,
  getHallOfFame,
  getRanking,
  getRankingYears,
  type RankingFilter,
} from "./actions";
import { HallOfFame, RankingList, RosterList, type HallOfFameYear, type RankingEntry } from "./component/RankingViews";

type RankingYear = { year: number; isArchived: boolean };
type TabValue = "year" | "rolling" | "roster" | "hof" | "archives";

export default function ClassementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [filter, setFilter] = useState<RankingFilter>("ROLLING");
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
  const [isImportLoading, setIsImportLoading] = useState(false);
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

  useEffect(() => {
    async function loadYears() {
      const years = await getRankingYears();
      setAvailableYears(years);
      // Au premier chargement, la plus récente des années disponibles est affichée
      if (years.length > 0 && filter === "ROLLING") {
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

  const activeTab: TabValue = isYearView ? "year" : isArchiveView ? "archives" : filter === "ROSTER" ? "roster" : filter === "HOF" ? "hof" : "rolling";

  const changeTab = (value: string) => {
    if (value === "year") {
      const latest = availableYears.find((y) => !y.isArchived);
      setFilter(`CDF_${latest ? latest.year : new Date().getFullYear()}`);
    } else if (value === "archives") {
      const firstArchive = availableYears.find((y) => y.isArchived);
      setFilter(firstArchive ? `CDF_${firstArchive.year}` : "ARCHIVES");
    } else {
      setFilter(value === "rolling" ? "ROLLING" : value === "roster" ? "ROSTER" : "HOF");
    }
  };

  async function reloadYears() {
    setAvailableYears(await getRankingYears());
  }

  async function handleImport() {
    setIsImportLoading(true);
    try {
      const res = await fetchLegacyRanking(importYear);
      if (res.error) {
        toast.error(res.error);
      } else if (availableYears.some((y) => y.year === importYear)) {
        // Année déjà présente : on demande avant d'ouvrir l'éditeur avec les données importées
        setIsOverwriteConfirmOpen(true);
      } else {
        router.push(`/classement/edit-archive?importYear=${importYear}`);
      }
    } catch {
      toast.error("Erreur lors de l'import");
    } finally {
      setIsImportLoading(false);
      setIsImportOpen(false);
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
      : filter === "ROSTER"
        ? `Le meilleur coach de chaque roster en ${new Date().getFullYear()} (ses 2 meilleurs résultats avec ce roster).`
        : filter === "HOF"
          ? "Le podium de chaque année du Championnat de France."
          : isArchiveView
            ? "Classement figé par la modération à la fin de la saison."
            : "Les 4 meilleurs résultats de chaque coach sur l'année, calculés en direct.";

  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ForumListHeader
        title="Championnat de France"
        subtitle="Le classement des coachs de la communauté Blood Bowl France"
        backHref="/"
        backTitle="Retour à l'accueil"
      >
        <div className="flex w-full items-center gap-2 lg:w-auto">
          {/* Sur un petit téléphone, le libellé passe sur deux lignes plutôt que de pousser « Gestion » hors de l'écran */}
          <Button type="button" variant="secondary" size="tap" className="min-w-0 py-1.5 text-left whitespace-normal max-lg:flex-1" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle size={18} aria-hidden="true" /> Comment sont calculés les points ?
          </Button>
          {managementMenu}
        </div>
      </ForumListHeader>

      <Tabs value={activeTab} onValueChange={changeTab}>
        <TabsList aria-label="Vues du classement" className="max-lg:-mx-3 max-lg:px-3">
          <TabsTrigger value="year">
            <Trophy size={18} aria-hidden="true" /> Année {latestLiveYear}
          </TabsTrigger>
          <TabsTrigger value="rolling">
            <History size={18} aria-hidden="true" /> Glissant
          </TabsTrigger>
          <TabsTrigger value="roster">
            <Users size={18} aria-hidden="true" /> Par roster
          </TabsTrigger>
          <TabsTrigger value="hof">
            <Medal size={18} aria-hidden="true" /> Hall of Fame
          </TabsTrigger>
          <TabsTrigger value="archives">
            <History size={18} aria-hidden="true" /> Archives
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-end lg:justify-between">
        <p className="m-0 flex items-start gap-1.5 text-sm text-bb-text-muted">
          <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          {periodNote}
        </p>
        {isYearView && liveYears.length > 1 && (
          <div className="flex flex-col gap-1.5 lg:w-64">
            <Label htmlFor="cdf-year">Année</Label>
            <Select id="cdf-year" aria-label="Choisir l'année" value={filter} onChange={(e) => setFilter(e.target.value as RankingFilter)}>
              {liveYears.map((y) => (
                <option key={y.year} value={`CDF_${y.year}`}>
                  Année {y.year} (calcul direct)
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
      ) : filter === "ROSTER" ? (
        <RosterList entries={ranking} />
      ) : (
        <RankingList entries={ranking} />
      )}

      <p className="m-0 mt-8 text-center text-sm text-bb-text-muted">
        Le Championnat de France est régi par les règles de la Team France Blood Bowl.
      </p>

      <Sheet open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <SheetContent title="Calcul des points CDF" side={isDesktop ? "center" : "bottom"}>
          <div className="flex flex-col gap-3 pb-2 text-[0.95rem] text-bb-text">
            <p className="m-0">
              Le <strong>Championnat de France</strong> utilise une formule pondérée pour valoriser la performance et
              l&apos;ampleur des tournois :
            </p>
            <ul className="m-0 flex flex-col gap-2 pl-5">
              <li>
                <strong>Sélection des scores :</strong> seuls vos 4 meilleurs résultats sur la période (12 mois glissants
                ou année civile) sont cumulés pour votre score total.
              </li>
              <li>
                <strong>La formule :</strong> <code className="rounded-bb-sm bg-bb-surface-2 px-1">Score = R × (Nc − Pl) / (Nc + Pl − 2)</code>
                <br />
                <span className="text-sm text-bb-text-muted">Nc = nombre de participants, Pl = votre place, R = valeur de référence du tournoi.</span>
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
              <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
              Pour le classement par roster, seuls les 2 meilleurs scores avec la même race sont retenus.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isImportOpen} onOpenChange={setIsImportOpen}>
        <SheetContent title="Importer des archives" side={isDesktop ? "center" : "bottom"}>
          <div className="flex flex-col gap-4 pb-2">
            <p className="m-0 text-[0.95rem] text-bb-text">Indiquez l&apos;année à récupérer depuis l&apos;ancien site (teamfrancebb.fr).</p>
            <Field label="Année cible" htmlFor="import-year" hint="L'import récupère les noms, les numéros NAF et les points totaux, puis ouvre l'éditeur d'archives.">
              <Input
                id="import-year"
                type="number"
                inputMode="numeric"
                value={Number.isNaN(importYear) ? "" : importYear}
                onChange={(e) => setImportYear(parseInt(e.target.value))}
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
        message={`Voulez-vous figer le classement de l'année ${currentYearData?.year ?? ""} ? Un instantané sera pris et affiché à la place du calcul en direct.`}
        confirmLabel="Archiver"
        pending={pending}
        onConfirm={handleArchive}
      />

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Supprimer l'archive (1/2)"
        message="Êtes-vous sûr de vouloir supprimer cette archive ? Le classement de cette année sera de nouveau calculé en direct."
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
        message="Cette action est irréversible. Confirmez-vous la suppression définitive de l'archive ?"
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
          router.push(`/classement/edit-archive?importYear=${importYear}`);
        }}
      />
    </div>
  );
}
