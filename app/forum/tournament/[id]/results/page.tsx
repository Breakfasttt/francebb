import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import TournamentResultsEditor from "./TournamentResultsEditor";
import { isModerator } from "@/lib/roles";

export default async function TournamentResultsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      commissaires: { select: { id: true } },
      topic: { select: { id: true, title: true } },
      results: { include: { user: { select: { id: true, name: true, image: true } } } },
      rounds: { 
        include: { 
          matches: { 
            include: { 
              coach1User: { select: { id: true, name: true, image: true } },
              coach2User: { select: { id: true, name: true, image: true } }
            } 
          } 
        },
        orderBy: { roundNumber: 'asc' }
      }
    }
  });

  if (!tournament) notFound();

  // Autorisation : Organisateur, Commissaire ou Admin
  const isOrganizer = tournament.organizerId === session.user.id;
  const isCommissaire = tournament.commissaires.some(c => c.id === session.user.id);
  const isSuperAdmin = isModerator(session.user.role);

  if (!isOrganizer && !isCommissaire && !isSuperAdmin) {
    redirect(`/forum/topic/${tournament.topic?.id || ''}`);
  }

  // Récupérer tous les utilisateurs pour le mapping (simplifié : juste id et name)
  // On pourrait filtrer par ceux qui ont un numéro NAF ou sont inscrits
  const users = await prisma.user.findMany({
    where: { isBanned: false },
    select: { id: true, name: true, image: true, nafNumber: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <TournamentResultsEditor 
        tournament={tournament} 
        allUsers={users}
      />
    </div>
  );
}
