import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import TournamentResultsEditor from "./TournamentResultsEditor";
import { isModerator } from "@/lib/roles";
import PageHeader from "@/common/components/PageHeader/PageHeader";

export default async function TournamentResultsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      commissaires: { select: { id: true, name: true } },
      topic: { select: { id: true, title: true } },
      results: { 
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { rank: 'asc' }
      },
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
  const isSuperAdmin = isModerator(session.user.role || 'USER');

  if (!isOrganizer && !isCommissaire && !isSuperAdmin) {
    redirect(`/forum/topic/${tournament.topic?.id || ''}`);
  }

  const users = await prisma.user.findMany({
    where: { isBanned: false },
    select: { id: true, name: true, image: true, nafNumber: true },
    orderBy: { name: 'asc' }
  });

  return (
    <main className="container forum-container" style={{ paddingBottom: '4rem' }}>
      <PageHeader 
        title={<span style={{ color: 'var(--primary)' }}>Publier les résultats</span>}
        subtitle={<span style={{ color: 'var(--accent)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700 }}>{tournament.topic?.title || tournament.name}</span>}
        backHref={`/forum/topic/${tournament.topic?.id}`}
        backTitle="Retour au sujet"
      />
      
      <div style={{ marginTop: '2rem' }}>
        <TournamentResultsEditor 
          tournament={tournament} 
          allUsers={users}
        />
      </div>
    </main>
  );
}
