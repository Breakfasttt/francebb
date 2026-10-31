import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import TournamentResultsEditor from "./TournamentResultsEditor";
import { isModerator } from "@/lib/roles";
import ComposeScreen from "@/app/forum/component/ComposeScreen";

/**
 * Saisie des résultats d'un tournoi (refonte, carte 089) : écran de saisie plein écran sur téléphone (`ComposeScreen`,
 * sans la barre de navigation du bas), avec « Publier les résultats » dans la barre collée en bas de l'écran.
 * Réservé à l'organisateur, à ses commissaires et aux modérateurs.
 */
export default async function TournamentResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getActiveSession();
  if (!session?.user) redirect(`/auth/login?callbackUrl=/forum/tournament/${id}/results`);

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

  // Autorisation : Organisateur, Commissaire ou modération (même règle que saveTournamentResults)
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

  const topicHref = `/forum/topic/${tournament.topic?.id}`;
  const title = tournament.topic?.title || tournament.name;

  return (
    <ComposeScreen
      breadcrumbs={[{ label: title, href: topicHref }, { label: "Publier les résultats" }]}
      title="Publier les résultats"
      subtitle={title}
      backHref={topicHref}
      backTitle="Retour au sujet"
    >
      <TournamentResultsEditor
        tournament={tournament}
        allUsers={users}
      />
    </ComposeScreen>
  );
}
