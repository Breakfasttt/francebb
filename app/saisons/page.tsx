import PageHeader from "@/common/components/PageHeader/PageHeader";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { Trophy, Plus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import Link from "next/link";

export default async function SaisonsHubPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "COMMISSAIRE";
  const isAuth = !!session?.user;

  const activeSeasons = await prisma.leagueSeason.findMany({
    include: {
      ligue: true,
      _count: {
        select: { teams: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <>
      <PageHeader 
        title="Saisons de Ligue" 
        subtitle="Le hub compétitif de Blood Bowl France" 
        icon={<Trophy size={24} />} 
        backLink="/" 
      />
      <div className="saisons-hub-container page-content">
        
        <div className="flex gap-4 mb-8">
          <Link href={isAuth ? "/equipes" : "/auth/login?callback=/equipes"}>
            <CTAButton>
              <Users size={18} /> Mes Équipes
            </CTAButton>
          </Link>

          {isAdmin && (
            <Link href="/saisons/create">
              <ClassicButton>
                <Plus size={18} /> Nouvelle Saison (Admin)
              </ClassicButton>
            </Link>
          )}
        </div>

        <section className="active-seasons-section">
          <h2 className="mb-4">Saisons et Ligues</h2>
          <div className="grid gap-4">
            {activeSeasons.length === 0 ? (
              <PremiumCard>
                <p className="text-muted">Aucune saison en cours.</p>
              </PremiumCard>
            ) : (
              activeSeasons.map(season => (
                <Link href={`/saisons/jeu/${season.id}`} key={season.id} className="no-underline">
                  <PremiumCard className="hover-lift flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">{season.name}</h3>
                      <p className="text-sm text-muted">{season.ligue.name} • Équipes : {season._count.teams}</p>
                    </div>
                    <span className="badge">{season.status}</span>
                  </PremiumCard>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="latest-matches-section" style={{ marginTop: '2rem' }}>
          <h2>Derniers Résultats</h2>
          <PremiumCard>
            <p className="text-muted">Aucun match rapporté récemment.</p>
          </PremiumCard>
        </section>
      </div>
    </>
  );
}
