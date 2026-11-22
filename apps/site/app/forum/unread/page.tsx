/**
 * Sujets non lus du membre (refonte, carte 085) : une ligne par sujet (titre, forum, auteur du sujet, messages, auteur, date et
 * heure du dernier message) avec un bouton pour le marquer comme lu, « Tout marquer comme lu » en tête, 20 sujets par page.
 */
import Link from "next/link";
import { getActiveSession } from "@/lib/authGuard";
import { redirect } from "next/navigation";
import { Trophy } from "lucide-react";
import { Avatar, Card, PageNav } from "@bbfrance/ui";
import SiteLayout from "@/common/components/SiteLayout/SiteLayout";
import RelativeTime from "@/common/components/RelativeTime/RelativeTime";
import ForumSidebar from "../component/ForumSidebar";
import { parseInlineBBCode } from "@/lib/bbcode";
import { getUnreadTopics } from "../actions";
import ForumListHeader from "../component/ForumListHeader";
import { UnreadDot } from "../component/ForumListItems";
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
    // Coquille du forum (DESIGN.md) : outils du forum dans le panneau gauche
    <SiteLayout
      asideLabel="Outils du forum"
      aside={<ForumSidebar onUnreadPage />}
      header={
        <ForumListHeader
          title="Sujets non lus"
          subtitle="Les sujets qui ont bougé depuis ta dernière visite"
          backHref="/forum"
          backTitle="Retour au forum"
        >
          {unreadTopics.length > 0 && <MarkAllAsReadButton className="max-lg:w-full" />}
        </ForumListHeader>
      }
    >
        <Card className="overflow-hidden">
          {unreadTopics.length > 0 ? (
            <ul className="m-0 list-none p-0">
              {unreadTopics.map((topic) => (
                <li key={topic.id} className="flex flex-col border-b border-bb-border last:border-b-0 lg:flex-row lg:items-center lg:gap-1 lg:pr-2">
                  <Link
                    href={`/forum/topic/${topic.id}`}
                    className="flex min-h-16 min-w-0 flex-1 items-start gap-3 py-3 pr-3 pl-3 text-bb-text max-lg:pb-1 hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus lg:items-center lg:pl-4"
                  >
                    <Avatar name={topic.author.name} src={topic.author.image} size={40} className="mt-0.5 lg:mt-0" aria-hidden="true" />
                    <span className="flex min-w-0 flex-1 flex-col gap-1 lg:flex-row lg:items-center lg:gap-4">
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
                          {topic.tournamentId && <Trophy size={15} role="img" aria-label="Tournoi" className="shrink-0 text-bb-accent-text" />}
                          <span
                            className="min-w-0 text-bb-lead leading-snug font-bold break-words"
                            dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.title) }}
                          />
                          <UnreadDot />
                        </span>
                        <span className="text-sm text-bb-text-muted">
                          dans <strong className="font-semibold text-bb-text" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.forum.name) }} /> · par{" "}
                          {topic.author.name}
                        </span>
                      </span>{" "}
                      <span className="flex flex-wrap gap-x-3 text-sm text-bb-text-muted lg:flex-nowrap lg:gap-0">
                        <span className="lg:w-24 lg:text-right">
                          {topic._count.posts} {topic._count.posts > 1 ? "messages" : "message"}
                        </span>{" "}
                        <span className="flex min-w-0 flex-wrap gap-x-1 lg:w-40 lg:flex-col lg:text-right">
                          <span className="min-w-0 truncate">Dernier : {topic.lastPostAuthor?.name ?? "Anonyme"}</span>
                          <span>
                            <span className="lg:hidden">· </span>
                            <RelativeTime date={topic.lastPostAt} />
                          </span>
                        </span>
                      </span>
                    </span>
                  </Link>
                  <MarkTopicReadButton topicId={topic.id} className="self-end max-lg:mr-1 max-lg:mb-1" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex flex-wrap items-center gap-x-3 px-4 py-5 text-bb-text-muted">
              Tu as tout lu.
              <Link href="/forum" className="inline-flex min-h-11 items-center font-semibold text-bb-text no-underline hover:text-bb-accent-text">
                Aller au forum
              </Link>
            </p>
          )}
        </Card>

        <PageNav
          page={currentPage}
          totalPages={totalPages}
          hrefFor={(page) => `/forum/unread?page=${page}`}
          linkComponent={Link}
          className="self-center"
        />
    </SiteLayout>
  );
}
