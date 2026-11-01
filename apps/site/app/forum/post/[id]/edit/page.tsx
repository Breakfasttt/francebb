import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getForumAccess, canAccessForum } from "@/lib/forumAccess";
import { getTopicLatestPosts, getQuoteStatusMap } from "@/app/forum/actions";
import { parseInlineBBCode } from "@/lib/bbcode";
import EditPostForm from "@/app/forum/component/EditPostForm";
import ComposeScreen, { RecentPostsRecap } from "@/app/forum/component/ComposeScreen";
import { isModerator } from "@/lib/roles";
// Styles des blocs BBCode (spoiler, accordéon, galerie) affichés dans l'aperçu et le rappel des messages

export const dynamic = "force-dynamic";

/** Page de modification d'un message (carte 087 : écran de rédaction plein écran sur téléphone, voir ComposeScreen). */
export default async function EditPostPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const session = await getActiveSession();
  if (!session?.user?.id) {
    redirect("/forum");
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
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

  if (!post) notFound();
  const { roles } = await getForumAccess();
  if (!canAccessForum(post.topic.forum, roles)) notFound();

  // Seuls l'auteur et les modérateurs peuvent modifier le message
  const canEdit = post.authorId === session.user.id || isModerator(session.user.role);
  if (!canEdit) {
    redirect(`/forum/topic/${post.topicId}`);
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
      title="Modifier mon message"
      subtitle={<>Sujet : <strong className="text-bb-text" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(post.topic.title) }} /></>}
      backHref={`/forum/topic/${post.topicId}`}
      backTitle="Retour au sujet"
    >
      <EditPostForm postId={id} initialContent={post.content} />

      <RecentPostsRecap posts={latestPosts} quoteStatusMap={quoteStatusMap} currentUserId={session?.user?.id} editingPostId={id} />
    </ComposeScreen>
  );
}
