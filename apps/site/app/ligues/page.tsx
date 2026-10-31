/**
 * Annuaire des ligues `/ligues` (refonte, carte 094, ADR 0006).
 * En-tête compact « Ligues » avec le nombre de ligues et le bouton « Créer une ligue », puis la barre de recherche,
 * de zone et d'affichage (`LigueFilters`), et les ligues en grille (12 par page) ou en liste (20 par page).
 * Sur téléphone, une seule colonne ; le filtre de zone est rangé dans le panneau « Filtrer les ligues ».
 * La recherche elle-même (paramètres `?view&query&region&page`, conditions, tri par nom) n'a pas changé.
 */
import Link from "next/link";
import { Plus, Shield } from "lucide-react";
import { Button, Card, EmptyState, PageNav } from "@bbfrance/ui";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/prisma/generated-client";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import LigueFilters from "./component/LigueFilters";
import { LigueCard, LigueRow } from "./component/LigueCard";

export const dynamic = "force-dynamic";

export default async function LiguesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = params.query as string | undefined;
  const region = params.region as string | undefined;
  const view = (params.view as string) || "grid";
  const page = parseInt(params.page as string) || 1;
  const limit = view === "grid" ? 12 : 20;
  const skip = (page - 1) * limit;

  const where: Prisma.LigueWhereInput = {};
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { acronym: { contains: query, mode: "insensitive" } }
    ];
  }
  if (region) where.geographicalZone = region;

  const total = await prisma.ligue.count({ where });
  const totalPages = Math.ceil(total / limit);

  const ligues = await prisma.ligue.findMany({
    where,
    orderBy: { name: "asc" },
    skip,
    take: limit,
    include: {
      _count: {
        select: { tournaments: true, members: true }
      }
    }
  });

  const coachRegions = await prisma.referenceData.findMany({
    where: { group: "COACH_REGION", isActive: true },
    orderBy: { order: "asc" }
  });
  const zones = coachRegions.map((zone) => ({ key: zone.key, label: zone.label }));
  const zoneLabels = new Map(zones.map((zone) => [zone.key, zone.label]));

  // Pagination : l'adresse garde la recherche, la zone et l'affichage
  const pageHref = (target: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key !== "page" && typeof value === "string") next.set(key, value);
    }
    if (target > 1) next.set("page", String(target));
    const text = next.toString();
    return text ? `/ligues?${text}` : "/ligues";
  };

  const createButton = (
    <Button asChild variant="primary" size="tap">
      <Link href="/ligues/create" className="no-underline">
        <Plus size={18} aria-hidden="true" />
        {/* Un seul bloc de texte : l'écart entre l'icône et le texte ne s'ajoute pas avant « une ligue » */}
        <span>Créer<span className="max-sm:sr-only"> une ligue</span></span>
      </Link>
    </Button>
  );

  return (
    <div className="mx-auto w-full max-w-[1232px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ForumListHeader
        title="Ligues"
        subtitle={`${total} ligue${total > 1 ? "s" : ""} référencée${total > 1 ? "s" : ""}`}
        backHref="/"
        backTitle="Retour à l'accueil"
      >
        {createButton}
      </ForumListHeader>

      <section aria-label="Ligues trouvées" className="flex min-w-0 flex-col gap-4">
        <LigueFilters zones={zones} total={total} />

        {ligues.length > 0 ? (
          <>
            {view === "grid" ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ligues.map((ligue) => (
                  <LigueCard key={ligue.id} ligue={ligue} zoneLabel={zoneLabels.get(ligue.geographicalZone ?? "")} />
                ))}
              </div>
            ) : (
              <Card className="overflow-hidden">
                {ligues.map((ligue) => (
                  <LigueRow key={ligue.id} ligue={ligue} zoneLabel={zoneLabels.get(ligue.geographicalZone ?? "")} />
                ))}
              </Card>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center">
                <PageNav page={page} totalPages={totalPages} hrefFor={pageHref} linkComponent={Link} />
              </div>
            )}
          </>
        ) : (
          <Card>
            <EmptyState icon={<Shield size={40} />} title="Aucune ligue trouvée" action={createButton}>
              Essayez une autre recherche, ou référencez votre ligue dans cette zone.
            </EmptyState>
          </Card>
        )}
      </section>
    </div>
  );
}
