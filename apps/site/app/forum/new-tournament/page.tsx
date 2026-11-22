import { getTournamentFormLists } from "@/lib/referenceData";
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
  // Sans forum dans l'adresse (lien tapé à la main, ancien favori) : le premier forum de tournois visible par le
  // membre, plutôt qu'une page introuvable (carte 221)
  if (!forumId) {
    const { roles } = await getForumAccess();
    const candidates = await prisma.forum.findMany({
      where: { isTournamentForum: true },
      orderBy: { order: "asc" },
      include: { category: true, parentForum: { include: { category: true } } },
    });
    const first = candidates.find((candidate) => canAccessForum(candidate, roles));
    if (!first) notFound();
    redirect(`/forum/new-tournament?forumId=${first.id}`);
  }

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
  // Visiteur : connexion, puis retour sur ce formulaire (comme /ligues/create)
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/forum/new-tournament?forumId=${forumId}`)}`);
  }

  const userCanStick = isModerator(session.user.role);

  // Charger toutes les données de référence nécessaires
  // Les sept listes du formulaire, en une seule requête (lib/referenceData.ts, carte 203)
  const lists = await getTournamentFormLists();
  const franceRegions = lists.REGION_FRANCE;
  const gameEditions = lists.GAME_EDITION;
  const departments = lists.DEPARTEMENT_FRANCE;
  const tournamentFormats = lists.TOURNAMENT_FORMAT;
  const tournamentTypes = lists.TOURNAMENT_TYPE;
  const platforms = lists.PLATFORM;
  const coachRegions = lists.COACH_REGION;

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
        canSetCdf={userCanStick}
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
