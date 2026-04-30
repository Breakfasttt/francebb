import PageHeader from "@/common/components/PageHeader/PageHeader";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { Trophy, Plus, Users, Swords } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import { isAdmin, isModerator } from "@/lib/roles";
import Pagination from "@/common/components/Pagination/Pagination";
import Link from "next/link";
import LigueSearchWrapper from "./LigueSearchWrapper";
import "./page.css";

interface PageProps {
  searchParams: Promise<{ page?: string; ligueId?: string }>;
}

export default async function SaisonsHubPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const ligueId = params.ligueId;
  const itemsPerPage = 20;

  const session = await auth();
  const userRole = session?.user?.role;
  const isAuth = !!session?.user;
  const isAdminUser = isAdmin(userRole) || userRole === "COMMISSAIRE";


  const where = ligueId ? { ligueId } : {};

  const [activeSeasons, totalSeasons, initialLigue] = await Promise.all([
    prisma.leagueSeason.findMany({
      where,
      take: itemsPerPage,
      skip: (currentPage - 1) * itemsPerPage,
      include: {
        ligue: true,
        _count: {
          select: { teams: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.leagueSeason.count({ where }),
    ligueId ? prisma.ligue.findUnique({ 
      where: { id: ligueId },
      select: { id: true, name: true, acronym: true, region: true, geographicalZone: true }
    }) : null
  ]);

  const totalPages = Math.ceil(totalSeasons / itemsPerPage);

  return (
    <>
      <PageHeader 
        title="Saisons de Ligue" 
        subtitle="Le hub compétitif de Blood Bowl France" 
        icon={<Swords size={24} />} 
        backHref="/" 
      />
      
      <div className="saisons-hub-container page-content">
        
        {/* Colonne 1 : Filtres et Actions */}
        <aside className="saisons-col col-filters">
          <PremiumCard title="Filtres">
            <div className="filter-group">
              <div className="mb-2">
                <label className="text-xs font-bold uppercase text-muted mb-2 block">
                  Filtrer par ligue
                </label>
                <LigueSearchWrapper initialLigue={initialLigue as any} />
              </div>

              <div className="pt-4 border-t border-white-10 mt-2">
                <CTAButton 
                  href={isAuth ? "/equipes" : "/auth/login?callback=/equipes"} 
                  fullWidth 
                  className="match-select-size"
                >
                  <Users size={18} /> Mes Équipes
                </CTAButton>
              </div>
            </div>
          </PremiumCard>
        </aside>

        {/* Colonne 2 : Liste des Saisons */}
        <main className="saisons-col col-main">
          <div className="col-main-header">
            <h2 className="flex items-center gap-2 m-0">
              <Trophy size={20} className="text-primary" />
              Saisons Actives
            </h2>

            {isAdminUser && (
              <Link href="/saisons/create" className="no-underline">
                <ClassicButton>
                  <Plus size={18} /> Nouvelle Saison
                </ClassicButton>
              </Link>
            )}
          </div>
          
          <div className="saisons-list">
            {activeSeasons.length === 0 ? (
              <PremiumCard>
                <p className="text-muted">Aucune saison en cours.</p>
              </PremiumCard>
            ) : (
              activeSeasons.map(season => (
                <Link href={`/saisons/jeu/${season.id}`} key={season.id} className="season-card-link">
                  <PremiumCard className="hover-lift flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">{season.name}</h3>
                      <p className="text-sm text-muted">{season.ligue.name} • Équipes : {season._count.teams}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="badge">{season.status}</span>
                    </div>
                  </PremiumCard>
                </Link>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                baseUrl={ligueId ? `/saisons?ligueId=${ligueId}` : "/saisons"}
              />
            </div>
          )}
        </main>

        {/* Colonne 3 : Derniers Résultats */}
        <aside className="saisons-col col-results">
          <div className="col-main-header">
            <h2 className="flex items-center gap-2">
              <Swords size={20} className="text-primary" />
              Derniers Résultats
            </h2>
          </div>
          
          <div className="latest-results-list">
            <PremiumCard>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted">Aucun match récent.</p>
              </div>
            </PremiumCard>
          </div>
        </aside>

      </div>
    </>
  );
}
