/**
 * Page des notifications du membre (carte 167), ouverte par la cloche de la barre du site : les mentions, les réponses
 * dans les sujets suivis, les messages privés et les nouvelles de ses tournois (carte 186), de la plus récente à la plus ancienne, 30 par page. Une notification
 * non lue est en gras avec un point de couleur. Chaque ligne est un lien vers `/notifications/<identifiant>`, qui la
 * marque lue et mène au bon message ; « Tout marquer comme lu » est en tête de page.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { AtSign, Bell, Mail, MessageSquareReply, Trophy } from "lucide-react";
import { Avatar, Card, EmptyState, PageNav, cn } from "@bbfrance/ui";
import { parseInlineBBCode } from "@/lib/bbcode";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import { UnreadDot, frenchDateTime } from "@/app/forum/component/ForumListItems";
import { getNotifications } from "./actions";
import MarkAllNotificationsReadButton from "./component/MarkAllNotificationsReadButton";

export const dynamic = "force-dynamic";

type NotificationRow = NonNullable<Awaited<ReturnType<typeof getNotifications>>>["notifications"][number];

const TYPE_ICON = {
  MENTION: AtSign,
  FOLLOWED_REPLY: MessageSquareReply,
  PRIVATE_MESSAGE: Mail,
  TOURNAMENT_PROMOTED: Trophy,
  TOURNAMENT_FORMAT_CHANGED: Trophy,
} as const;

/** Phrase d'une notification : qui a fait quoi, et où. Le titre du sujet est du BBCode en ligne, rendu en HTML sûr. */
function NotificationText({ notification }: { notification: NotificationRow }) {
  const actor = <strong className="font-semibold">{notification.actor?.name ?? "Un ancien membre"}</strong>;
  const topicTitle = notification.topic && (
    <span className="font-semibold" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(notification.topic.title) }} />
  );
  switch (notification.type) {
    case "MENTION":
      return <>{actor} vous a mentionné dans « {topicTitle} »</>;
    case "FOLLOWED_REPLY":
      return <>{actor} a répondu dans « {topicTitle} », un sujet que vous suivez</>;
    case "TOURNAMENT_PROMOTED":
      return <>Une place s&apos;est libérée dans le tournoi « {topicTitle} » : vous passez de la liste d&apos;attente aux pré-inscrits</>;
    case "TOURNAMENT_FORMAT_CHANGED":
      return (
        <>
          {actor} a changé le format du tournoi « {topicTitle} » (individuel ou par équipes) : votre inscription a été supprimée,
          inscrivez-vous de nouveau si vous le souhaitez
        </>
      );
    default: {
      const group = notification.conversation?.isGroup ? notification.conversation.name : null;
      return group ? <>{actor} vous a écrit dans la conversation « {group} »</> : <>{actor} vous a envoyé un message privé</>;
    }
  }
}

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr || "1", 10) || 1);
  const data = await getNotifications(currentPage);
  if (!data) redirect("/auth/login?callbackUrl=/notifications");
  const { notifications, unread, totalPages } = data;

  return (
    <div className="mx-auto w-full max-w-[960px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ForumListHeader
        title="Notifications"
        subtitle="Mentions, réponses dans vos sujets suivis, messages privés et tournois"
        backHref="/"
        backTitle="Retour à l'accueil"
      >
        {unread > 0 && <MarkAllNotificationsReadButton className="max-lg:w-full" />}
      </ForumListHeader>

      <div className="flex flex-col gap-4">
        <Card className="overflow-hidden">
          {notifications.length > 0 ? (
            <ul className="m-0 list-none p-0">
              {notifications.map((notification) => {
                const Icon = TYPE_ICON[notification.type as keyof typeof TYPE_ICON] ?? Bell;
                const isUnread = !notification.readAt;
                return (
                  <li key={notification.id} className="border-b border-bb-border last:border-b-0">
                    {/* Lien ordinaire (pas de Link) : l'adresse marque la notification lue, elle ne doit pas être chargée à l'avance */}
                    <a
                      href={`/notifications/${notification.id}`}
                      className={cn(
                        "flex min-h-16 items-start gap-3 px-3 py-3 text-bb-text no-underline hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus lg:px-4",
                        isUnread && "bg-bb-accent-soft"
                      )}
                    >
                      <span className="relative mt-0.5 shrink-0">
                        <Avatar name={notification.actor?.name} src={notification.actor?.image} size={40} aria-hidden="true" />
                        <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border border-bb-border bg-bb-surface text-bb-accent-text">
                          <Icon size={12} aria-hidden="true" />
                        </span>
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className={cn("text-[0.95rem] leading-snug break-words", isUnread ? "font-medium" : "text-bb-text-muted")}>
                          <NotificationText notification={notification} />
                        </span>
                        <span className="text-[0.8125rem] text-bb-text-muted">{frenchDateTime(notification.createdAt)}</span>
                      </span>
                      {isUnread && <UnreadDot className="mt-2" />}
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={<Bell size={40} />} title="Aucune notification">
              Vous serez prévenu ici quand un membre vous mentionne, répond dans un sujet que vous suivez ou vous écrit, et quand votre inscription à un tournoi change.
            </EmptyState>
          )}
        </Card>

        <PageNav
          page={currentPage}
          totalPages={totalPages}
          hrefFor={(page) => `/notifications?page=${page}`}
          linkComponent={Link}
          className="self-center"
        />
      </div>
    </div>
  );
}
