import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@bbfrance/ui";
import { getActiveSession } from "@/lib/authGuard";
import { isModerator } from "@/lib/roles";
import { notFound, redirect } from "next/navigation";
import { getForumAccess, canAccessForum, forumAccessWhere } from "@/lib/forumAccess";
import { prisma } from "@/lib/prisma";
import ComposeScreen from "@/app/forum/component/ComposeScreen";
import NewTopicForm from "@/app/forum/component/NewTopicForm";
import { parseInlineBBCode } from "@/lib/bbcode";

/**
 * Page de création d'un sujet classique (carte 087 : écran de rédaction plein écran sur téléphone, voir
 * ComposeScreen). Un forum de tournoi utilise /forum/new-tournament pour les annonces.
 * Le formulaire lui-même (colonne « Publication », barre d'envoi, brouillon du message) est dans NewTopicForm.
 * Sans `?forumId=` (bouton « Nouveau sujet » de l'accueil du forum), la page propose d'abord de choisir le forum :
 * seulement ceux que le membre peut voir (lib/forumAccess.ts) et où il peut écrire (pas verrouillés, sauf pour un
 * modérateur).
 */
export default async function NewTopicPage({ searchParams }: { searchParams: Promise<{ forumId?: string }> }) {
  const { forumId } = await searchParams;
  if (!forumId) return <ForumChoice />;

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

/** Choix du forum d'un nouveau sujet : les forums ouverts au membre, rangés par catégorie, sous-forums en retrait. */
async function ForumChoice() {
  const session = await getActiveSession();
  if (!session?.user?.id) redirect(`/auth/login?callbackUrl=${encodeURIComponent("/forum/new-topic")}`);

  const { roles } = await getForumAccess();
  const canModerate = isModerator(session.user.role);
  const [categories, forums] = await Promise.all([
    prisma.category.findMany({ where: { allowedRoles: { in: roles } }, orderBy: { order: "asc" }, select: { id: true, name: true } }),
    prisma.forum.findMany({
      where: { ...forumAccessWhere(roles), ...(canModerate ? {} : { isLocked: false }) },
      orderBy: { order: "asc" },
      select: { id: true, name: true, description: true, categoryId: true, parentForumId: true },
    }),
  ]);

  const rootsOf = (categoryId: string) => forums.filter((forum) => forum.categoryId === categoryId && !forum.parentForumId);
  const childrenOf = (parentId: string) => forums.filter((forum) => forum.parentForumId === parentId);
  const groups = categories.map((category) => ({ category, roots: rootsOf(category.id) })).filter((group) => group.roots.length > 0);

  const row = (forum: (typeof forums)[number], isSub: boolean) => (
    <li key={forum.id} className="border-b border-bb-border last:border-b-0">
      <Link
        href={`/forum/new-topic?forumId=${forum.id}`}
        className={`flex min-h-14 items-center gap-3 py-2.5 pr-3 text-bb-text no-underline hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus lg:pr-4 ${isSub ? "pl-8 lg:pl-10" : "pl-3 lg:pl-4"}`}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-semibold break-words" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(forum.name) }} />
          {forum.description && <span className="text-sm text-bb-text-muted">{forum.description}</span>}
        </span>
        <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-bb-text-muted" />
      </Link>
    </li>
  );

  return (
    <ComposeScreen
      breadcrumbs={[{ label: "Nouveau sujet" }]}
      title="Nouveau sujet"
      subtitle="Choisis le forum où publier ton sujet."
      backHref="/forum"
      backTitle="Retour au forum"
    >
      <div className="flex max-w-[720px] flex-col gap-4">
        {groups.length === 0 ? (
          <Card className="p-4 text-bb-text-muted">Aucun forum n&apos;est ouvert à tes sujets pour le moment.</Card>
        ) : (
          groups.map(({ category, roots }) => (
            <section key={category.id} aria-labelledby={`choix-${category.id}`}>
              <h2 id={`choix-${category.id}`} className="mb-2 font-bb-heading text-bb-label text-bb-text-muted">{category.name}</h2>
              <Card className="overflow-hidden">
                <ul className="m-0 list-none p-0">
                  {roots.flatMap((forum) => [row(forum, false), ...childrenOf(forum.id).map((sub) => row(sub, true))])}
                </ul>
              </Card>
            </section>
          ))
        )}
      </div>
    </ComposeScreen>
  );
}
