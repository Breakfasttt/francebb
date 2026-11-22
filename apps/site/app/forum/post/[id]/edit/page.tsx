import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getForumAccess, canAccessForum } from "@/lib/forumAccess";
import { getTopicLatestPosts, getQuoteStatusMap } from "@/app/forum/actions";
import { parseInlineBBCode } from "@/lib/bbcode";
import EditPostForm from "@/app/forum/component/EditPostForm";
import ComposeScreen, { RecentPostsRecap } from "@/app/forum/component/ComposeScreen";
import type { EditRefusal } from "@/app/forum/component/EditRefusedNotice";
import { isModerator } from "@/lib/roles";
import { canSavePostEdit } from "@/lib/forumRights";
import { isTopicClosedFor } from "@/lib/forumWriteRules";
import { forumPostHrefFor } from "@/lib/forumPostLink";
// Styles des blocs BBCode (spoiler, accordéon, galerie) affichés dans l'aperçu et le rappel des messages

export const dynamic = "force-dynamic";

/**
 * Page de modification d'un message (carte 087 : écran de rédaction plein écran sur téléphone, voir ComposeScreen).
 * Elle applique la même règle que l'enregistrement (`canSavePostEdit`, lib/forumRights.ts) : le message d'un autre
 * membre, un message supprimé ou masqué, un sujet verrouillé ou archivé ne s'ouvrent pas. Le membre est renvoyé sur
 * le message avec `?modification=<raison>`, que lit EditRefusedNotice pour lui dire pourquoi. Le texte d'un message
 * supprimé n'est donc jamais envoyé à un membre qui n'est pas modérateur.
 */
export default async function EditPostPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const session = await getActiveSession();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/forum/post/${id}/edit`)}`);
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      topic: {
        include: {
          forum: {
            include: {
              category: true,
              parentForum: {
                include: { category: true }
              }
            }
          }
        }
      }
    }
  });

  // Un message d'un sujet supprimé (carte 165) ne se modifie plus : le sujet est introuvable pour les membres
  if (!post || post.topic.isDeleted) notFound();
  const { roles } = await getForumAccess();
  if (!canAccessForum(post.topic.forum, roles)) notFound();

  // Même règle que l'action updatePost (lib/forumRights.ts) : sinon le membre écrirait pour rien
  const viewer = { id: session.user.id, isModerator: isModerator(session.user.role) };
  const topicState = { isLocked: post.topic.isLocked, isArchived: post.topic.isArchived, forumIsLocked: post.topic.forum.isLocked };
  if (!canSavePostEdit(viewer, isTopicClosedFor(topicState, false), post)) {
    const reason: EditRefusal =
      post.authorId !== session.user.id ? "not-author"
      : post.isDeleted ? "deleted"
      : post.isModerated ? "moderated"
      : topicState.forumIsLocked ? "forum-locked"
      : topicState.isArchived ? "archived"
      : "locked";
    // « /forum/topic/<sujet>?page=N#post-<message> » : la raison s'ajoute avant l'ancre
    const [path, hash] = (await forumPostHrefFor(post.topicId, post)).split("#");
    redirect(`${path}&modification=${reason}${hash ? `#${hash}` : ""}`);
  }

  // Les 3 derniers messages, pour le rappel sous l'éditeur
  const latestPosts = await getTopicLatestPosts(post.topicId, 3);
  const quoteStatusMap = await getQuoteStatusMap(latestPosts.map(p => p.content));

  const breadcrumbs = [];
  if (post.topic.forum.parentForum) {
    if (post.topic.forum.parentForum.category) breadcrumbs.push({ label: post.topic.forum.parentForum.category.name, isCategory: true });
    breadcrumbs.push({ label: post.topic.forum.parentForum.name, href: `/forum/${post.topic.forum.parentForumId}` });
  } else if (post.topic.forum.category) {
    breadcrumbs.push({ label: post.topic.forum.category.name, isCategory: true });
  }
  breadcrumbs.push({ label: post.topic.forum.name, href: `/forum/${post.topic.forumId}` });
  breadcrumbs.push({ label: post.topic.title, href: `/forum/topic/${post.topic.id}` });
  breadcrumbs.push({ label: "Modifier le message" });

  return (
    <ComposeScreen
      breadcrumbs={breadcrumbs}
      title={post.authorId === session.user.id ? "Modifier mon message" : "Modifier le message"}
      subtitle={<>Sujet : <strong className="text-bb-text" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(post.topic.title) }} /></>}
      backHref={`/forum/post/${id}`}
      backTitle="Retour au message"
    >
      <EditPostForm postId={id} initialContent={post.content} />

      <RecentPostsRecap posts={latestPosts} quoteStatusMap={quoteStatusMap} currentUserId={session?.user?.id} editingPostId={id} />
    </ComposeScreen>
  );
}
