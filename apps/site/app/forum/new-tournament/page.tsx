import { getActiveSession } from "@/lib/authGuard";
import { isModerator } from "@/lib/roles";
// Styles des blocs BBCode (spoiler, accordéon, galerie) affichés dans l'aperçu de l'éditeur
import { notFound, redirect } from "next/navigation";
import { getForumAccess, canAccessForum } from "@/lib/forumAccess";
import { prisma } from "@/lib/prisma";
import { parseInlineBBCode } from "@/lib/bbcode";
import TournamentForm from "@/app/forum/component/TournamentForm";
import ComposeScreen from "@/app/forum/component/ComposeScreen";

/**
 * Page de création d'un sujet de tournoi (refonte, carte 089) : écran de rédaction plein écran sur téléphone
 * (`ComposeScreen`, sans la barre de navigation du bas), avec la barre d'envoi collée en bas de l'écran.
 */

export default async function NewTournamentPage({ searchParams }: { searchParams: Promise<{ forumId?: string }> }) {
  const { forumId } = await searchParams;
  if (!forumId) notFound();

  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
    include: {
      category: true,
      parentForum: {
        include: { category: true }
      }
    }
  });

  if (!forum || !forum.isTournamentForum) notFound();
  const { roles } = await getForumAccess();
  if (!canAccessForum(forum, roles)) notFound();

  const session = await getActiveSession();
  if (!session?.user?.id) {
    redirect("/forum");
  }

  const userCanStick = isModerator(session.user.role);

  // Charger toutes les données de référence nécessaires
  const [franceRegions, gameEditions, departments, tournamentFormats, tournamentTypes, platforms, coachRegions] = await Promise.all([
    prisma.referenceData.findMany({ where: { group: 'REGION_FRANCE', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'GAME_EDITION', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'DEPARTEMENT_FRANCE', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'TOURNAMENT_FORMAT', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'TOURNAMENT_TYPE', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'PLATFORM', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'COACH_REGION', isActive: true }, orderBy: { order: 'asc' } }),
  ]);

  const breadcrumbs = [];
  if (forum.parentForum) {
    if (forum.parentForum.category) breadcrumbs.push({ label: forum.parentForum.category.name, isCategory: true });
    breadcrumbs.push({ label: forum.parentForum.name, href: `/forum/${forum.parentForumId}` });
  } else if (forum.category) {
    breadcrumbs.push({ label: forum.category.name, isCategory: true });
  }
  breadcrumbs.push({ label: forum.name, href: `/forum/${forum.id}` });
  breadcrumbs.push({ label: "Annoncer un tournoi" });

  return (
    <ComposeScreen
      breadcrumbs={breadcrumbs}
      title="Annoncer un tournoi"
      subtitle={<>Dans le forum : <strong className="text-bb-text" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(forum.name) }} /></>}
      backHref={`/forum/${forumId}`}
      backTitle="Retour au forum"
    >
      <TournamentForm 
        forumId={forumId}
        userCanStick={userCanStick}
        referenceData={{
          franceRegions,
          gameEditions,
          departments,
          tournamentFormats,
          tournamentTypes,
          platforms,
          coachRegions
        }}
      />
    </ComposeScreen>
  );
}
