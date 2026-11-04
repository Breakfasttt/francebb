"use client";

/**
 * Onglet « Sujets suivis » du profil (refonte, carte 092) : les sujets que le membre suit, du plus récent au plus
 * ancien dernier message, 20 par page. Une pastille « Non lu » signale un sujet qui a reçu un message depuis la dernière
 * lecture. Chaque ligne mène au sujet. Les données viennent de l'action `getFollowedTopics`.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Bookmark, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, EmptyState, PageNav, Skeleton } from "@bbfrance/ui";
import { getFollowedTopics } from "@/app/forum/actions";

type FollowedTopic = { id: string; title: string; lastPostAt: Date; forumId: string; isUnread: boolean };

export default function ProfileFollowedTopics() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ page: number; topics: FollowedTopic[]; totalPages: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFollowedTopics(page).then((result) => {
      if (!cancelled) setData({ page, topics: result.topics as FollowedTopic[], totalPages: result.totalPages });
    });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const loading = !data || data.page !== page;

  return (
    <div className="flex flex-col items-center gap-4">
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <Bookmark size={18} className="text-bb-text-muted" aria-hidden="true" />
          <CardTitle>Mes sujets suivis</CardTitle>
        </CardHeader>
        {loading ? (
          <div className="flex flex-col gap-3 p-4" aria-label="Chargement de vos sujets suivis">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-11 w-full" />)}
          </div>
        ) : data.topics.length === 0 ? (
          <EmptyState icon={<Bookmark size={32} />} title="Aucun sujet suivi">
            Pour suivre un sujet, choisissez « Suivre le sujet » dans ses outils.
          </EmptyState>
        ) : (
          <ul className="m-0 list-none p-0">
            {data.topics.map((topic) => (
              <li key={topic.id} className="border-b border-bb-border last:border-b-0">
                <Link
                  href={`/forum/topic/${topic.id}`}
                  className="flex min-h-14 items-center gap-3 px-4 py-2.5 text-bb-text no-underline hover:bg-bb-surface-2"
                >
                  <span className="relative shrink-0 text-bb-text-muted">
                    <Bookmark size={18} aria-hidden="true" />
                    {topic.isUnread && (
                      <span role="img" aria-label="Non lu" className="absolute -top-1 -right-1 size-2.5 rounded-full bg-bb-unread" />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className={`truncate text-[0.95rem] ${topic.isUnread ? "font-bold" : "font-semibold"}`}>{topic.title}</span>
                    <span className="text-sm text-bb-text-muted">
                      Dernier message {formatDistanceToNow(new Date(topic.lastPostAt), { addSuffix: true, locale: fr })}
                    </span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-bb-text-muted" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {data && <PageNav page={page} totalPages={data.totalPages} onPageChange={setPage} />}
    </div>
  );
}
