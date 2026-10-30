import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getForumAccess, canAccessForum } from "@/lib/forumAccess";
import { getTopicLatestPosts, getPostById, getQuoteStatusMap } from "@/app/forum/actions";
import { parseInlineBBCode } from "@/lib/bbcode";
import ReplyForm from "@/app/forum/component/ReplyForm";
import ComposeScreen, { RecentPostsRecap } from "@/app/forum/component/ComposeScreen";
// Styles des blocs BBCode (spoiler, accordéon, galerie) affichés dans l'aperçu et le rappel des messages
import "../../../page.css";

export const dynamic = "force-dynamic";

/**
 * Page de réponse à un sujet (carte 087 : écran de rédaction plein écran sur téléphone, voir ComposeScreen).
 * `?quotePostId=` préremplit l'éditeur avec la citation du message demandé.
 */
export default async function ReplyPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ quotePostId?: string }>
}) {
  const { id } = await params;
  const { quotePostId } = await searchParams;

  const session = await getActiveSession();
  if (!session?.user?.id) {
    redirect(`/forum/topic/${id}`);
  }

  const topic = await prisma.topic.findUnique({
    where: { id },
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
  });

  if (!topic) notFound();
  const { roles } = await getForumAccess();
  if (!canAccessForum(topic.forum, roles)) notFound();

  // Citation demandée
  let quoteData = null;
  if (quotePostId) {
    const post = await getPostById(quotePostId);
    if (post && post.topicId === id) {
      quoteData = {
        postId: post.id,
        author: post.authorId,
        authorName: post.author.name,
        content: post.content
      };
    }
  }

  // Les 3 derniers messages, pour le rappel sous l'éditeur
  const latestPosts = await getTopicLatestPosts(id, 3);
  const quoteStatusMap = await getQuoteStatusMap(latestPosts.map(p => p.content));

  const breadcrumbs = [];
  if (topic.forum.parentForum) {
    if (topic.forum.parentForum.category) breadcrumbs.push({ label: topic.forum.parentForum.category.name, isCategory: true });
    breadcrumbs.push({ label: topic.forum.parentForum.name, href: `/forum/${topic.forum.parentForumId}` });
  } else if (topic.forum.category) {
    breadcrumbs.push({ label: topic.forum.category.name, isCategory: true });
  }
  breadcrumbs.push({ label: topic.forum.name, href: `/forum/${topic.forumId}` });
  breadcrumbs.push({ label: topic.title, href: `/forum/topic/${topic.id}` });
  breadcrumbs.push({ label: "Répondre" });

  return (
    <ComposeScreen
      breadcrumbs={breadcrumbs}
      title="Répondre au sujet"
      subtitle={<>Sujet : <strong className="text-bb-text" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.title) }} /></>}
      backHref={`/forum/topic/${id}`}
      backTitle="Retour au sujet"
    >
      <ReplyForm
        topicId={id}
        quotePostId={quoteData?.postId}
        quoteAuthor={quoteData?.author}
        quoteAuthorName={quoteData?.authorName ?? undefined}
        quoteContent={quoteData?.content}
      />

      <RecentPostsRecap posts={latestPosts} quoteStatusMap={quoteStatusMap} currentUserId={session?.user?.id} />
    </ComposeScreen>
  );
}
