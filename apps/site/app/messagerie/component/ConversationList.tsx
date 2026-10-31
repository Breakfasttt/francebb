"use client";

/**
 * Liste des conversations du membre (refonte, carte 093) : les 20 plus récentes, chacune avec l'avatar du membre
 * (ou une icône de groupe), son nom ou le titre du groupe, la date du dernier message, le début de ce message et la
 * pastille du nombre de messages non lus. La conversation ouverte est mise en valeur (colonne de gauche sur ordinateur).
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { format, formatDistanceToNow, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { MessagesSquare, Users } from "lucide-react";
import { Avatar, CountBadge, EmptyState, Skeleton, cn } from "@bbfrance/ui";
import { getConversations } from "../actions";
import { conversationTitle, plainPreview } from "./conversationText";

type ConversationSummary = NonNullable<Awaited<ReturnType<typeof getConversations>>>["conversations"][number];

interface ConversationListProps {
  /** Conversation ouverte (paramètre `?id=`), mise en valeur dans la liste. */
  activeId: string | null;
  /** Change quand la liste doit être rechargée (message envoyé, groupe renommé…). */
  version: number;
}

export default function ConversationList({ activeId, version }: ConversationListProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Rechargée à chaque changement signalé, dont l'ouverture d'une conversation (ses non-lus disparaissent)
  useEffect(() => {
    let cancelled = false;
    getConversations()
      .then((data) => {
        if (!cancelled && data) setConversations(data.conversations);
      })
      .catch((error) => console.error(error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-3" aria-busy="true">
        {[0, 1, 2].map((n) => (
          <div key={n} className="flex items-center gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState icon={<MessagesSquare size={32} />} title="Aucune conversation pour le moment.">
        Commencez à discuter avec d&apos;autres coachs !
      </EmptyState>
    );
  }

  return (
    <ul className="m-0 list-none p-0">
      {conversations.map((conv) => {
        const lastMsg = conv.messages[0];
        const unreadCount = conv._count?.messages || 0;
        const others = conv.participants.filter((p) => String(p.user.id) !== String(currentUserId));
        const isOneOnOne = conv.participants.length === 2;
        const title = conversationTitle(conv, currentUserId);
        const isActive = conv.id === activeId;

        return (
          <li key={conv.id} className="border-b border-bb-border last:border-b-0">
            <Link
              href={`/messagerie?id=${conv.id}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-[72px] items-center gap-3 px-3 py-3 text-bb-text no-underline hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus",
                isActive && "bg-bb-accent-soft hover:bg-bb-accent-soft"
              )}
            >
              <span className="relative shrink-0">
                {isOneOnOne ? (
                  <Avatar name={others[0]?.user.name} src={others[0]?.user.image} size={48} />
                ) : (
                  <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full border border-bb-border bg-bb-surface-2 text-bb-text-muted">
                    <Users size={22} />
                  </span>
                )}
                <CountBadge
                  count={unreadCount}
                  role="img"
                  aria-label={`${unreadCount} message(s) non lu(s)`}
                  className="absolute -top-1 -right-1 ring-2 ring-bb-surface"
                />
              </span>

              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-baseline gap-2">
                  <span className={cn("min-w-0 flex-1 truncate text-[1.02rem]", unreadCount > 0 ? "font-bold" : "font-semibold")}>{title}</span>
                  {/* Heure si c'est aujourd'hui, sinon la date ; la durée écoulée reste lisible au survol */}
                  <time
                    dateTime={new Date(conv.updatedAt).toISOString()}
                    title={formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true, locale: fr })}
                    className="shrink-0 text-xs text-bb-text-muted"
                  >
                    {isToday(new Date(conv.updatedAt)) ? format(new Date(conv.updatedAt), "HH:mm") : format(new Date(conv.updatedAt), "d MMM", { locale: fr })}
                  </time>
                </span>
                {!isOneOnOne && (
                  <span className="truncate text-xs text-bb-text-muted">
                    {conv.participants.length} participants : {conv.participants.map((p) => p.user.name).join(", ")}
                  </span>
                )}
                <span className={cn("truncate text-sm", unreadCount > 0 ? "text-bb-text" : "text-bb-text-muted")}>
                  {lastMsg ? (
                    <>
                      <span className="font-semibold">{lastMsg.authorId === currentUserId ? "Vous" : lastMsg.author.name} : </span>
                      {plainPreview(lastMsg.content)}
                    </>
                  ) : (
                    <em>Aucun message</em>
                  )}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
