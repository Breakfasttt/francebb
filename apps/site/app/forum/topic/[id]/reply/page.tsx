import { getActiveSession } from "@/lib/authGuard";
import { isModerator } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getForumAccess, canAccessForum } from "@/lib/forumAccess";
import { getTopicLatestPosts, getPostById, getQuoteStatusMap } from "@/app/forum/actions";
import { parseInlineBBCode } from "@/lib/bbcode";
import { canQuotePost } from "@/lib/forumPostPrivacy";
import ReplyForm from "@/app/forum/component/ReplyForm";
import ComposeScreen, { RecentPostsRecap } from "@/app/forum/component/ComposeScreen";
// Styles des blocs BBCode (spoiler, accordéon, galerie) affichés dans l'aperçu et le rappel des messages

export const dynamic = "force-dynamic";

/**
 * Page de réponse à un sujet (carte 087 : écran de rédaction plein écran sur téléphone, voir ComposeScreen).
 * `?quotePostId=` préremplit l'éditeur avec la citation du message demandé, sauf s'il est supprimé ou masqué.
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

  // Un sujet supprimé (carte 165) n'accepte plus de réponse
  if (!topic || topic.isDeleted) notFound();
  const { roles } = await getForumAccess();
  if (!canAccessForum(topic.forum, roles)) notFound();

  // Carte 149 : un sujet verrouillé (ou un sujet d'un forum verrouillé) n'accepte que les réponses des modérateurs.
  // Un membre ordinaire est renvoyé vers le sujet avant d'écrire, au lieu d'être refusé à l'envoi.
  // Carte 169 : un sujet archivé est fermé de la même façon.
  if ((topic.isLocked || topic.isArchived || topic.forum.isLocked) && !isModerator(session.user.role)) {
    redirect(`/forum/topic/${id}`);
  }

  // Citation demandée. Un message supprimé ou masqué par la modération ne se cite pas (carte 164) : l'adresse
  // ?quotePostId= est alors ignorée et l'éditeur s'ouvre vide.
  let quoteData = null;
  if (quotePostId) {
    const post = await getPostById(quotePostId);
    if (post && post.topicId === id && canQuotePost(post)) {
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
