import { getActiveSession } from "@/lib/authGuard";
import { isModerator } from "@/lib/roles";
import { notFound, redirect } from "next/navigation";
import { getForumAccess, canAccessForum } from "@/lib/forumAccess";
import { prisma } from "@/lib/prisma";
import ComposeScreen from "@/app/forum/component/ComposeScreen";
import NewTopicForm from "@/app/forum/component/NewTopicForm";
import { parseInlineBBCode } from "@/lib/bbcode";

/**
 * Page de création d'un sujet classique (carte 087 : écran de rédaction plein écran sur téléphone, voir
 * ComposeScreen). Un forum de tournoi utilise /forum/new-tournament pour les annonces.
 * Le formulaire lui-même (colonne « Publication », barre d'envoi, brouillon du message) est dans NewTopicForm.
 */
export default async function NewTopicPage({ searchParams }: { searchParams: Promise<{ forumId?: string }> }) {
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

  if (!forum) notFound();
  const { roles } = await getForumAccess();
  if (!canAccessForum(forum, roles)) notFound();

  const session = await getActiveSession();
  if (!session?.user?.id) {
    // Carte 149 : un visiteur passe par la page de connexion, qui le ramène ensuite sur cet écran (callbackUrl).
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/forum/new-topic?forumId=${forumId}`)}`);
  }

  const userCanStick = isModerator(session.user.role);

  // Carte 152 : même règle que createTopic, un forum verrouillé n'accepte de nouveaux sujets que des modérateurs.
  // Un membre ordinaire est renvoyé vers le forum avant d'écrire, au lieu d'être refusé à l'envoi.
  if (forum.isLocked && !userCanStick) {
    redirect(`/forum/${forumId}`);
  }

  const breadcrumbs = [];
  if (forum.parentForum) {
    if (forum.parentForum.category) breadcrumbs.push({ label: forum.parentForum.category.name, isCategory: true });
    breadcrumbs.push({ label: forum.parentForum.name, href: `/forum/${forum.parentForumId}` });
  } else if (forum.category) {
    breadcrumbs.push({ label: forum.category.name, isCategory: true });
  }
  breadcrumbs.push({ label: forum.name, href: `/forum/${forum.id}` });
  breadcrumbs.push({ label: "Nouveau sujet" });

  const cancelHref = `/forum/${forumId}`;

  return (
    <ComposeScreen
      breadcrumbs={breadcrumbs}
      title="Nouveau sujet"
      subtitle={<>Dans le forum : <strong className="text-bb-text" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(forum.name) }} /></>}
      backHref={cancelHref}
      backTitle="Retour au forum"
    >
      <NewTopicForm forumId={forumId} userCanStick={userCanStick} cancelHref={cancelHref} />
    </ComposeScreen>
  );
}
