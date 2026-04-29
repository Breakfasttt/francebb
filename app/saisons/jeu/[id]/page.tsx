import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { Trophy } from "lucide-react";
import { auth } from "@/auth";
import SeasonManager from "./component/SeasonManager";

export default async function SeasonDetailsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  const season = await prisma.leagueSeason.findUnique({
    where: { id: params.id },
    include: {
      ligue: true,
      teams: {
        include: { user: true }
      },
      matches: true
    }
  });

  if (!season) notFound();

  // Les commissaires/admins
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "COMMISSAIRE";

  // Si c'est en DRAFT et qu'on n'est pas admin, on bloque
  if (season.status === "DRAFT" && !isAdmin) {
    notFound();
  }

  // Équipes de l'utilisateur qu'il pourrait inscrire
  let userAvailableTeams: any[] = [];
  if (session?.user?.id && season.status === "REGISTRATION") {
    userAvailableTeams = await prisma.teamRoster.findMany({
      where: { 
        userId: session.user.id,
        seasonId: null // Pas encore inscrite
      }
    });
  }

  // Calcul du classement
  const standingsMap: Record<string, any> = {};
  season.teams.forEach(t => {
    standingsMap[t.id] = {
      team: t,
      pts: 0,
      played: 0,
      w: 0, d: 0, l: 0,
      tdFor: 0, tdAgainst: 0,
      casFor: 0, casAgainst: 0
    };
  });

  season.matches.forEach(m => {
    if (m.status !== "VALIDATED") return;
    const sA = standingsMap[m.teamAId];
    const sB = standingsMap[m.teamBId];

    if (sA && sB) {
      sA.played++; sB.played++;
      sA.tdFor += m.scoreA; sA.tdAgainst += m.scoreB;
      sB.tdFor += m.scoreB; sB.tdAgainst += m.scoreA;
      sA.casFor += m.casualtiesA; sA.casAgainst += m.casualtiesB;
      sB.casFor += m.casualtiesB; sB.casAgainst += m.casualtiesA;

      if (m.scoreA > m.scoreB) { sA.w++; sA.pts += 3; sB.l++; }
      else if (m.scoreA < m.scoreB) { sB.w++; sB.pts += 3; sA.l++; }
      else { sA.d++; sB.d++; sA.pts += 1; sB.pts += 1; }
    }
  });

  const standings = Object.values(standingsMap).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts; // 1. Points
    const diffB = b.tdFor - b.tdAgainst;
    const diffA = a.tdFor - a.tdAgainst;
    if (diffB !== diffA) return diffB - diffA; // 2. Diff TD
    return (b.casFor - b.casAgainst) - (a.casFor - a.casAgainst); // 3. Diff Sorties
  });

  return (
    <>
      <PageHeader 
        title={season.name} 
        subtitle={`Ligue: ${season.ligue.name} | Statut: ${season.status}`} 
        icon={<Trophy size={24} />} 
        backLink="/saisons" 
      />
      <div className="page-content">
        <SeasonManager 
          season={season} 
          isAdmin={isAdmin} 
          userAvailableTeams={userAvailableTeams}
          standings={standings}
          currentUserId={session?.user?.id}
        />
      </div>
    </>
  );
}
