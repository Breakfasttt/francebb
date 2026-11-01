import { getActiveSession } from "@/lib/authGuard";
import { isModerator } from "@/lib/roles";
// Styles des blocs BBCode (spoiler, accordéon, galerie) affichés dans l'aperçu de l'éditeur
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseInlineBBCode } from "@/lib/bbcode";
import TournamentForm from "@/app/forum/component/TournamentForm";
import ComposeScreen from "@/app/forum/component/ComposeScreen";

/**
 * Page de modification d'un tournoi existant (refonte, carte 089) : même écran de rédaction que la création
 * (`ComposeScreen`), réservé à l'organisateur, à ses commissaires et aux modérateurs.
 */

export default async function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      commissaires: true,
      // Ligue rattachée, pour que le champ de recherche de ligue l'affiche déjà choisie (carte 131)
      ligue: { select: { id: true, name: true, acronym: true, region: true, geographicalZone: true } },
      topic: {
        include: {
          forum: {
            include: {
              category: true,
              parentForum: { include: { category: true } }
            }
          },
          posts: {
            orderBy: { createdAt: 'asc' },
            take: 1
          }
        }
      }
    }
  });

  if (!tournament || !tournament.topic) notFound();

  const session = await getActiveSession();
  if (!session?.user?.id) {
    redirect(`/forum/topic/${tournament.topic.id}`);
  }

  // Vérifier les droits (Auteur ou Commissaire ou Modérateur)
  const isOrganizer = tournament.organizerId === session.user.id;
  const isCommissaire = tournament.commissaires.some(c => c.id === session.user.id);
  const isMod = isModerator(session.user.role);

  if (!isOrganizer && !isCommissaire && !isMod) {
    redirect(`/forum/topic/${tournament.topic.id}`);
  }

  const firstPost = tournament.topic.posts[0];
  if (!firstPost) notFound();

  // Charger toutes les données de référence
  const [franceRegions, gameEditions, departments, tournamentFormats, tournamentTypes, platforms, coachRegions] = await Promise.all([
    prisma.referenceData.findMany({ where: { group: 'REGION_FRANCE', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'GAME_EDITION', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'DEPARTEMENT_FRANCE', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'TOURNAMENT_FORMAT', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'TOURNAMENT_TYPE', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'PLATFORM', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'COACH_REGION', isActive: true }, orderBy: { order: 'asc' } }),
  ]);

  const forum = tournament.topic.forum;
  const breadcrumbs = [];
  if (forum.parentForum) {
    if (forum.parentForum.category) breadcrumbs.push({ label: forum.parentForum.category.name, isCategory: true });
    breadcrumbs.push({ label: forum.parentForum.name, href: `/forum/${forum.parentForumId}` });
  } else if (forum.category) {
    breadcrumbs.push({ label: forum.category.name, isCategory: true });
  }
  breadcrumbs.push({ label: forum.name, href: `/forum/${forum.id}` });
  breadcrumbs.push({ label: tournament.topic.title, href: `/forum/topic/${tournament.topic.id}` });
  breadcrumbs.push({ label: "Modifier le tournoi" });

  return (
    <ComposeScreen
      breadcrumbs={breadcrumbs}
      title="Modifier le tournoi"
      subtitle={<>Sujet : <strong className="text-bb-text" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(tournament.topic.title) }} /></>}
      backHref={`/forum/topic/${tournament.topic.id}`}
      backTitle="Retour au sujet"
    >
      <TournamentForm 
        forumId={forum.id}
        userCanStick={isMod}
        referenceData={{
          franceRegions,
          gameEditions,
          departments,
          tournamentFormats,
          tournamentTypes,
          platforms,
          coachRegions
        }}
        initialData={{
          ...tournament,
          topicId: tournament.topic.id,
          firstPostId: firstPost.id,
          postContent: firstPost.content,
          isOrganizer: isOrganizer // Pour restreindre l'édition des commissaires
        }}
      />
    </ComposeScreen>
  );
}
