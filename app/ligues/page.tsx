import { prisma } from "@/lib/prisma";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import LigueCard from "./component/LigueCard";
import LigueFilters from "./component/LigueFilters";
import { Search, MapPin, Grid, List as ListIcon, Plus, Shield } from "lucide-react";
import Link from "next/link";
import Pagination from "@/common/components/Pagination/Pagination";
import EmptyState from "@/common/components/EmptyState/EmptyState";
import "./page.css";

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

  const where: any = {};
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { acronym: { contains: query } }
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

  return (
    <main className="container">
      <PageHeader 
        title="L'Annuaire des Ligues" 
        subtitle="Trouvez votre club et rejoignez la communauté"
        backHref="/" 
      />

      <div className="ligues-top-bar">
        <LigueFilters 
          initialQuery={query} 
          initialRegion={region} 
          coachRegions={coachRegions.map(r => ({ key: r.key, label: r.label }))} 
        />

        <div className="ligue-actions">
            <div className="view-toggle">
                <Link href={`/ligues?view=grid${query ? `&query=${query}` : ''}${region ? `&region=${region}` : ''}`} className={view === 'grid' ? 'active' : ''}>
                    <Grid size={20} />
                </Link>
                <Link href={`/ligues?view=list${query ? `&query=${query}` : ''}${region ? `&region=${region}` : ''}`} className={view === 'list' ? 'active' : ''}>
                    <ListIcon size={20} />
                </Link>
            </div>
            <Link href="/ligues/create" className="btn-create-ligue">
                <Plus size={18} /> Créer une Ligue
            </Link>
        </div>
      </div>

      {ligues.length > 0 ? (
        <>
            <div className={view === 'grid' ? "ligues-grid" : "ligues-list"}>
                {ligues.map(ligue => (
                    <LigueCard key={ligue.id} ligue={ligue} view={view as any} />
                ))}
            </div>

            <div className="pagination-wrapper">
                <Pagination 
                    currentPage={page} 
                    totalPages={totalPages} 
                    baseUrl={`/ligues?view=${view}${query ? `&query=${query}` : ''}${region ? `&region=${region}` : ''}`} 
                    queryParam="page"
                />
            </div>
        </>
      ) : (
        <EmptyState 
          icon={<Shield size={64} style={{ opacity: 0.2 }} />}
          title="Aucune ligue trouvée"
          description="Soyez le premier à référencer votre ligue dans cette zone !"
          action={<Link href="/ligues/create" className="btn-create-ligue"><Plus size={18} /> Créer une Ligue</Link>}
        />
      )}
    </main>
  );
}
