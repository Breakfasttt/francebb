/**
 * Annuaire des ligues `/ligues` (refonte, carte 094, ADR 0006).
 * En-tête compact « Ligues » avec le nombre de ligues et le bouton « Créer une ligue », puis la barre de recherche,
 * de zone et d'affichage (`LigueFilters`), et les ligues en grille (12 par page) ou en liste (20 par page).
 * Sur téléphone, une seule colonne ; le filtre de zone est rangé dans le panneau « Filtrer les ligues ».
 * La recherche elle-même (paramètres `?view&query&region&page`, conditions, tri par nom) n'a pas changé.
 */
import { getReferenceData } from "@/lib/referenceData";
import Link from "next/link";
import { Button, Card, PageNav } from "@bbfrance/ui";
import SiteLayout, { PanelLink, PanelTitle } from "@/common/components/SiteLayout/SiteLayout";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/prisma/generated-client";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import LigueFilters from "./component/LigueFilters";
import { LigueRow } from "./component/LigueCard";

export const dynamic = "force-dynamic";

export default async function LiguesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = params.query as string | undefined;
  const region = params.region as string | undefined;
  // Une seule présentation, en lignes (DESIGN.md : un annuaire se lit en liste, comme le forum et les tournois)
  const page = parseInt(params.page as string) || 1;
  const limit = 20;
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

  const coachRegions = await getReferenceData("COACH_REGION");
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

  // Lien d'une zone dans le panneau gauche : garde la recherche, repart de la première page
  const zoneHref = (key: string) => {
    const next = new URLSearchParams();
    if (query) next.set("query", query);
    if (key) next.set("region", key);
    const text = next.toString();
    return text ? `/ligues?${text}` : "/ligues";
  };

  // Panneau gauche (DESIGN.md) : action principale, puis les zones comme navigation de la rubrique
  const aside = (
    <>
      <Button asChild variant="primary" size="tap" className="w-full">
        <Link href="/ligues/create">Créer une ligue</Link>
      </Button>
      <nav aria-labelledby="ligues-zones-title" className="flex flex-col">
        <PanelTitle id="ligues-zones-title">Zones</PanelTitle>
        <PanelLink href={zoneHref("")} active={!region} linkComponent={Link}>Toutes les zones</PanelLink>
        {zones.map((zone) => (
          <PanelLink key={zone.key} href={zoneHref(zone.key)} active={region === zone.key} linkComponent={Link}>
            {zone.label}
          </PanelLink>
        ))}
      </nav>
      <PanelLink href="/carte?vue=ligues" linkComponent={Link}>Voir les ligues sur la carte</PanelLink>
    </>
  );

  return (
    <SiteLayout
      asideOnMobile="hidden"
      asideLabel="Zones des ligues"
      aside={aside}
      header={
        <ForumListHeader
          title="Ligues"
          subtitle={`${total} ligue${total > 1 ? "s" : ""} référencée${total > 1 ? "s" : ""}`}
          backHref="/"
          backTitle="Retour à l'accueil"
        >
          <Button asChild variant="primary" size="tap" className="lg:hidden">
            <Link href="/ligues/create">Créer une ligue</Link>
          </Button>
        </ForumListHeader>
      }
    >
      <section aria-label="Ligues trouvées" className="flex min-w-0 flex-col gap-4">
        <LigueFilters zones={zones} total={total} />

        {ligues.length > 0 ? (
          <>
            <Card className="overflow-hidden">
              {ligues.map((ligue) => (
                <LigueRow key={ligue.id} ligue={ligue} zoneLabel={zoneLabels.get(ligue.geographicalZone ?? "")} />
              ))}
            </Card>

            {totalPages > 1 && (
              <div className="flex justify-center">
                <PageNav page={page} totalPages={totalPages} hrefFor={pageHref} linkComponent={Link} />
              </div>
            )}
          </>
        ) : (
          <p className="rounded-bb-lg border border-bb-border bg-bb-surface px-4 py-5 text-bb-text-muted">
            Aucune ligue ne correspond. Essaie une autre recherche, ou référence ta ligue.
          </p>
        )}
      </section>
    </SiteLayout>
  );
}
