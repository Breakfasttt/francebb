/**
 * Liste des tournois `/tournois` (refonte, carte 089, ADR 0006).
 * - Sur ordinateur : la colonne des filtres à gauche, la barre de recherche, de tri et d'affichage au-dessus des
 *   résultats, puis les tournois en grille (10 par page) ou en liste (20 par page).
 * - Sur téléphone : une seule colonne ; les filtres sont rangés dans le panneau « Filtrer les tournois », ouvert par
 *   le bouton « Filtres » qui indique combien de filtres sont actifs.
 * Les filtres actifs sont rappelés en pastilles au-dessus des résultats. La recherche elle-même (lecture des
 * paramètres de l'adresse, conditions, tri) est la même qu'avant la refonte ; seul l'affichage change.
 */
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Card, EmptyState, PageNav } from "@bbfrance/ui";
import { prisma } from "@/lib/prisma";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import { TournamentFilterAside, TournamentListControls } from "@/app/tournois/component/TournamentFilters";
import { TournamentCard, TournamentRow } from "@/app/tournois/component/TournamentListItems";

export const dynamic = "force-dynamic";

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // La page est accessible à tous

  const params = await searchParams;

  const query = params.query as string | undefined;
  const region = params.region as string | undefined;
  const dept = params.dept as string | undefined;
  const edition = params.edition as string | undefined;
  const ruleset = params.ruleset as string | undefined;
  const days = params.days as string | undefined;
  const minPlaces = params.minPlaces ? parseInt(params.minPlaces as string) : undefined;

  const lodging = params.lodging === "true";
  const meals = params.meals === "true";
  const friday = params.friday === "true";
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice as string) : undefined;
  const structure = params.structure as string | undefined;
  const isTeam = params.isTeam === "true" ? true : params.isTeam === "false" ? false : undefined;
  const platform = params.platform as string | undefined;
  const isNAF = params.isNAF === "true";
  const isCDF = params.isCDF === "true";
  const isCGO = params.isCGO === "true";
  const isTGE = params.isTGE === "true";
  const isTSC = params.isTSC === "true";

  // Identifiant de la ligue, envoyé par le bouton « Voir tout » de la fiche d'une ligue
  const ligueId = params.ligueId as string | undefined;

  const sort = (params.sort as string) || "date_asc";
  const view = (params.view as string) || "grid";
  const showHistory = params.history === "true";

  const page = parseInt(params.page as string) || 1;
  const limit = view === "grid" ? 10 : 20;
  const skip = (page - 1) * limit;

  // Build where clause
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const where: any = {};

  if (!showHistory) {
    where.isFinished = false;
    where.isCancelled = false;
    where.date = { gte: todayStart };
  }

  if (query) where.name = { contains: query, mode: "insensitive" };
  if (ligueId) where.ligueId = ligueId;
  if (region) where.region = region;
  if (dept) where.departement = dept;
  if (edition) where.gameEdition = edition;
  if (ruleset) where.ruleset = ruleset;
  if (days) where.days = days;
  if (structure) where.structure = structure;
  if (minPlaces) where.maxParticipants = { gte: minPlaces };
  if (lodging) where.lodgingAtVenue = true;
  if (meals) where.mealsIncluded = true;
  if (friday) where.fridayArrival = true;
  if (isTeam !== undefined) where.isTeam = isTeam;
  if (platform) where.platform = platform;
  if (isNAF) where.isNAF = true;
  if (isCDF) where.isCDF = true;
  if (isCGO) where.isCGO = true;
  if (isTGE) where.isTGE = true;
  if (isTSC) where.isTSC = true;
  if (maxPrice !== undefined) where.price = { lte: maxPrice };

  // Handle Sort
  let orderBy: any = {};
  if (sort === "date_asc") orderBy = { date: "asc" };
  else if (sort === "date_desc") orderBy = { date: "desc" };
  else if (sort === "price_asc") orderBy = { price: "asc" };
  else if (sort === "price_desc") orderBy = { price: "desc" };
  else if (sort === "participants_asc") orderBy = { maxParticipants: "asc" };
  else if (sort === "participants_desc") orderBy = { maxParticipants: "desc" };

  const total = await prisma.tournament.count({ where });
  const totalPages = Math.ceil(total / limit);

  const tournaments = await prisma.tournament.findMany({
    where,
    orderBy,
    skip,
    take: limit,
    include: {
      organizer: true,
      topic: { select: { id: true } }
    }
  });

  // Pagination : l'adresse garde tous les filtres, le tri et l'affichage (avant, seul ?page= restait)
  const pageHref = (target: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key !== "page" && typeof value === "string") next.set(key, value);
    }
    if (target > 1) next.set("page", String(target));
    const text = next.toString();
    return text ? `/tournois?${text}` : "/tournois";
  };

  return (
    <div className="mx-auto w-full max-w-[1232px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ForumListHeader
        title="Tournois"
        subtitle={`${total} tournoi${total > 1 ? "s" : ""}${showHistory ? ", passés compris" : " à venir"}`}
        backHref="/"
        backTitle="Retour à l'accueil"
      />

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[272px_minmax(0,1fr)] lg:items-start lg:gap-6">
        <TournamentFilterAside />

        <section aria-label="Tournois trouvés" className="flex min-w-0 flex-col gap-4">
          <TournamentListControls total={total} />

          {tournaments.length > 0 ? (
            <>
              {view === "grid" ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {tournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament} todayStart={todayStart} />
                  ))}
                </div>
              ) : (
                <Card className="overflow-hidden">
                  {/* En-tête des colonnes (ordinateur) */}
                  <div aria-hidden="true" className="hidden border-b border-bb-border bg-bb-surface-2 px-4 py-2 text-xs font-bold tracking-wide text-bb-text-muted uppercase lg:grid lg:grid-cols-[48px_minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_7rem_5.5rem] lg:gap-4">
                    <span>Date</span>
                    <span>Tournoi</span>
                    <span>Lieu</span>
                    <span>Format</span>
                    <span>Statut</span>
                    <span className="text-right">Prix</span>
                  </div>
                  {tournaments.map((tournament) => (
                    <TournamentRow key={tournament.id} tournament={tournament} todayStart={todayStart} />
                  ))}
                </Card>
              )}

              <div className="flex justify-center">
                <PageNav page={page} totalPages={totalPages} hrefFor={pageHref} linkComponent={Link} />
              </div>
            </>
          ) : (
            <Card>
              <EmptyState icon={<SearchX size={40} />} title="Aucun tournoi trouvé">
                Essayez de modifier vos filtres ou de réinitialiser la recherche.
              </EmptyState>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
