"use client";

/**
 * Onglet « Activité du forum » d'un profil (refonte, carte 092), sur `/profile` et `/spy/[id]` : les derniers
 * messages du membre sur le forum. Chaque ligne donne le titre du sujet, le début du message et sa date, et mène au
 * message lui-même (ancre `#post-…`).
 */
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, EmptyState } from "@bbfrance/ui";
import { parseInlineBBCode } from "@/lib/bbcode";

interface ActivityPost {
  id: string;
  topicId: string;
  content: string;
  createdAt: string | Date;
  topic: { title: string };
}

interface ProfileActivityProps {
  activities: ActivityPost[];
  userName: string;
}

export default function ProfileActivity({ activities, userName }: ProfileActivityProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <MessageSquare size={18} className="text-bb-text-muted" aria-hidden="true" />
        <CardTitle>Activité récente du forum</CardTitle>
      </CardHeader>
      {activities.length === 0 ? (
        <EmptyState icon={<MessageSquare size={32} />} title="Aucune activité">
          Aucune activité récente trouvée pour {userName}.
        </EmptyState>
      ) : (
        <ul className="m-0 list-none p-0">
          {activities.map((post) => (
            <li key={post.id} className="border-b border-bb-border last:border-b-0">
              <Link
                href={`/forum/topic/${post.topicId}#post-${post.id}`}
                className="flex flex-col gap-1 px-4 py-3 text-bb-text no-underline hover:bg-bb-surface-2"
              >
                <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span
                    className="min-w-0 text-[0.95rem] font-semibold break-words"
                    dangerouslySetInnerHTML={{ __html: parseInlineBBCode(post.topic.title) }}
                  />
                  <span className="shrink-0 text-sm text-bb-text-muted">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </span>
                <span className="line-clamp-2 text-sm break-words text-bb-text-muted">
                  {post.content.length > 200 ? post.content.substring(0, 200) + "…" : post.content}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
