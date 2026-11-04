/**
 * Sujets non lus du membre (refonte, carte 085) : une ligne par sujet (titre, forum, auteur du sujet, messages, auteur, date et
 * heure du dernier message) avec un bouton pour le marquer comme lu, « Tout marquer comme lu » en tête, 20 sujets par page.
 */
import Link from "next/link";
import { getActiveSession } from "@/lib/authGuard";
import { redirect } from "next/navigation";
import { Check, MessageSquare, Trophy } from "lucide-react";
import { Avatar, Button, Card, EmptyState, PageNav } from "@bbfrance/ui";
import { parseInlineBBCode } from "@/lib/bbcode";
import { getUnreadTopics } from "../actions";
import ForumListHeader from "../component/ForumListHeader";
import { UnreadDot, frenchDateTime } from "../component/ForumListItems";
import MarkAllAsReadButton from "../component/MarkAllAsReadButton";
import MarkTopicReadButton from "./component/MarkTopicReadButton";

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 20;


export default async function UnreadPostsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await getActiveSession();
  if (!session) redirect("/auth/login?callbackUrl=/forum/unread");

  const { page: pageStr } = await searchParams;
  // Un numéro de page illisible (« ?page=abc ») donne la page 1 : avant la carte 169, il donnait une page cassée
  const currentPage = Math.max(1, parseInt(pageStr || "1", 10) || 1);
  const { topics: unreadTopics, total } = await getUnreadTopics(currentPage, POSTS_PER_PAGE);
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="mx-auto w-full max-w-[1232px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ForumListHeader
        title="Messages non lus"
        subtitle="Liste des sujets ayant de nouvelles activités depuis votre dernière visite"
        backHref="/forum"
        backTitle="Retour au forum"
      >
        {unreadTopics.length > 0 && <MarkAllAsReadButton className="max-lg:w-full" />}
      </ForumListHeader>

      <div className="flex flex-col gap-4">
        <Card className="overflow-hidden">
          {unreadTopics.length > 0 ? (
            <ul className="m-0 list-none p-0">
              {unreadTopics.map((topic) => (
                <li key={topic.id} className="flex items-center gap-1 border-b border-bb-border pr-1 last:border-b-0 lg:pr-2">
                  <Link
                    href={`/forum/topic/${topic.id}`}
                    className="flex min-h-16 min-w-0 flex-1 items-start gap-3 py-3 pl-3 text-bb-text hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus lg:items-center lg:pl-4"
                  >
                    <Avatar name={topic.author.name} src={topic.author.image} size={40} className="mt-0.5 lg:mt-0" aria-hidden="true" />
                    <span className="flex min-w-0 flex-1 flex-col gap-1 lg:flex-row lg:items-center lg:gap-4">
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
                          {topic.tournamentId && <Trophy size={15} role="img" aria-label="Tournoi" className="shrink-0 text-bb-accent-text" />}
                          <span
                            className="min-w-0 text-[1.0625rem] leading-snug font-bold break-words"
                            dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.title) }}
                          />
                          <UnreadDot />
                        </span>
                        <span className="text-[0.8125rem] text-bb-text-muted">
                          dans <strong className="font-semibold text-bb-text" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.forum.name) }} /> · par{" "}
                          {topic.author.name}
                        </span>
                      </span>
                      <span className="flex flex-wrap gap-x-3 text-[0.8125rem] text-bb-text-muted lg:flex-nowrap lg:gap-0 lg:text-sm">
                        <span className="lg:w-24 lg:text-right">
                          {topic._count.posts} {topic._count.posts > 1 ? "messages" : "message"}
                        </span>
                        <span className="flex min-w-0 flex-wrap gap-x-1 lg:w-40 lg:flex-col lg:text-right">
                          <span className="min-w-0 truncate">Dernier : {topic.lastPostAuthor?.name ?? "Anonyme"}</span>
                          <span>
                            <span className="lg:hidden">· </span>
                            {frenchDateTime(topic.lastPostAt)}
                          </span>
                        </span>
                      </span>
                    </span>
                  </Link>
                  <MarkTopicReadButton topicId={topic.id} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<MessageSquare size={40} />}
              title="Aucun nouveau message"
              action={
                <Button asChild variant="primary" size="tap">
                  <Link href="/forum">
                    <Check size={18} aria-hidden="true" /> Retour à l&apos;index du forum
                  </Link>
                </Button>
              }
            >
              Vous êtes à jour ! Tous les sujets ont été lus.
            </EmptyState>
          )}
        </Card>

        <PageNav
          page={currentPage}
          totalPages={totalPages}
          hrefFor={(page) => `/forum/unread?page=${page}`}
          linkComponent={Link}
          className="self-center"
        />
      </div>
    </div>
  );
}
