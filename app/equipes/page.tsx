import { auth } from "@/auth";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import Link from "next/link";
import { Users, Plus, Shield } from "lucide-react";
import { prisma } from "@/lib/prisma";
import "./page.css";

export default async function EquipesHubPage() {
  const session = await auth();

  let userTeams: any[] = [];
  if (session?.user?.id) {
    userTeams = await prisma.teamRoster.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    });
  }

  return (
    <>
      <PageHeader 
        title="Mes Équipes" 
        subtitle="Gérez vos rosters et suivez leur évolution" 
        icon={<Users size={24} />} 
        backLink="/" 
      />
      <div className="equipes-hub-container page-content">
        <div className="actions-bar">
          <Link href="/equipes/create">
            <button className="classic-button cta-button">
              <Plus size={18} /> Créer une Équipe
            </button>
          </Link>
        </div>

        <section className="my-teams-section">
          <h2>Vos Rosters Actifs</h2>
          {!session?.user ? (
            <PremiumCard>
              <p>Vous devez être connecté pour gérer vos équipes.</p>
            </PremiumCard>
          ) : (
            <div className="teams-grid">
              {userTeams.length > 0 ? (
                userTeams.map(team => (
                  <Link href={`/equipes/${team.id}`} key={team.id} className="no-underline">
                    <PremiumCard className="team-card hover-lift">
                      <div className="team-card-header">
                        <Shield size={24} className="text-primary" />
                        <h3>{team.name}</h3>
                      </div>
                      <div className="team-card-stats">
                        <span className="badge">TV: {team.currentTV.toLocaleString()}</span>
                        <span className="badge">{team.treasury.toLocaleString()} po</span>
                      </div>
                    </PremiumCard>
                  </Link>
                ))
              ) : (
                <p className="text-muted">Aucune équipe créée pour le moment.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
