import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { Swords } from "lucide-react";
import MatchReporter from "./component/MatchReporter";
import { auth } from "@/auth";

export default async function ReportMatchPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) notFound();

  const season = await prisma.leagueSeason.findUnique({
    where: { id: params.id },
    include: {
      teams: {
        include: { user: true }
      }
    }
  });

  if (!season || season.status !== "COMPETITION") {
    notFound();
  }

  // Vérifier si le user a une équipe dans cette saison (ou si c'est un admin)
  const userTeam = season.teams.find(t => t.userId === session.user?.id);
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "COMMISSAIRE";

  if (!userTeam && !isAdmin) {
    notFound();
  }

  return (
    <>
      <PageHeader 
        title="Rapport de Match" 
        subtitle={season.name} 
        icon={<Swords size={24} />} 
        backLink={`/saisons/jeu/${season.id}`} 
      />
      <div className="page-content">
        <MatchReporter season={season} userTeamId={userTeam?.id} isAdmin={isAdmin} />
      </div>
    </>
  );
}
