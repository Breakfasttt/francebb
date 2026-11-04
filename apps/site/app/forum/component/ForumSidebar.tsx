/**
 * Actions des listes du forum (refonte, carte 085).
 * - `ForumPrimaryActions` : « Nouveau sujet », « Nouveau tournoi » (forum de tournois) ou, dans un forum verrouillé
 *   pour un membre qui n'est pas modérateur, le bouton désactivé « Forum verrouillé ». Sur téléphone, la page les
 *   affiche en haut de la liste ; sur ordinateur, ils sont en tête de la colonne latérale.
 * - `ForumSidebar` : la colonne latérale, collée en haut de l'écran pendant le défilement sur ordinateur. Sur
 *   téléphone, ses actions secondaires (recherche avancée, membres, non-lus, administration) sont affichées sur
 *   place, dans un bloc « Outils du forum » sous la liste (carte 156 : plus de portail vers le panneau « Plus »).
 */
import { getUnreadTopicsCount, getSubForumCount } from "@/app/forum/actions";
import Link from "next/link";
import { Lock as LockIcon, MessageSquare, PlusCircle, Search, Trophy, Users } from "lucide-react";
import { Button, Card } from "@bbfrance/ui";
import { getActiveSession } from "@/lib/authGuard";
import { isModerator } from "@/lib/roles";
import DeleteForumButton from "@/app/forum/component/DeleteForumButton";
import MarkAllAsReadButton from "@/app/forum/component/MarkAllAsReadButton";
import NewForumButton from "@/app/forum/component/NewForumButton";
import LockButton from "@/app/forum/component/LockButton";

/** Titre discret d'un groupe d'actions de la colonne. */
const groupTitle = "m-0 border-0 p-0 text-[0.8125rem] font-bold tracking-wider text-bb-text-muted uppercase not-italic";

interface PrimaryActionsProps {
  forumId: string;
  isLocked: boolean;
  isTournamentForum: boolean;
  /** Le visiteur est un membre connecté. */
  isMember: boolean;
  isModerator: boolean;
  className?: string;
}

export function ForumPrimaryActions({ forumId, isLocked, isTournamentForum, isMember, isModerator: canModerate, className = "" }: PrimaryActionsProps) {
  if (!isMember) return null;
  if (isLocked && !canModerate) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <Button type="button" variant="secondary" size="tap" disabled className="w-full">
          <LockIcon size={18} aria-hidden="true" /> Forum verrouillé
        </Button>
      </div>
    );
  }
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Button asChild variant="primary" size="tap" className="w-full">
        <Link href={`/forum/new-topic?forumId=${forumId}`}>
          <PlusCircle size={18} aria-hidden="true" /> Nouveau sujet
        </Link>
      </Button>
      {isTournamentForum && (
        <Button asChild variant="secondary" size="tap" className="w-full">
          <Link href={`/forum/new-tournament?forumId=${forumId}`}>
            <Trophy size={18} aria-hidden="true" /> Nouveau tournoi
          </Link>
        </Button>
      )}
    </div>
  );
}

export default async function ForumSidebar({
  forumId,
  forumName,
  categoryId,
  parentForumId,
  isLocked,
  isTournamentForum,
}: {
  forumId?: string;
  forumName?: string;
  categoryId?: string;
  parentForumId?: string;
  isLocked?: boolean;
  isTournamentForum?: boolean;
}) {
  const [unreadTopics, subForumCount, session] = await Promise.all([
    getUnreadTopicsCount(),
    parentForumId ? getSubForumCount(parentForumId) : 0,
    getActiveSession(),
  ]);
  const canCreateForum = isModerator(session?.user?.role);
  const showUnread = !!session && !forumId && !categoryId && !parentForumId && unreadTopics > 0;

  // Actions secondaires : dans la colonne sur ordinateur, dans le bloc « Outils du forum » sur téléphone
  const secondary = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Button asChild variant="secondary" size="tap" className="w-full justify-start">
          <Link href={forumId ? `/forum/search?forumId=${forumId}` : `/forum/search`}>
            <Search size={18} aria-hidden="true" /> Recherche avancée
          </Link>
        </Button>
        <Button asChild variant="secondary" size="tap" className="w-full justify-start">
          <Link href="/membres">
            <Users size={18} aria-hidden="true" /> Les membres
          </Link>
        </Button>
      </div>

      {showUnread && (
        <div className="flex flex-col gap-2">
          <Button asChild variant="secondary" size="tap" className="w-full justify-start">
            <Link href="/forum/unread">
              <MessageSquare size={18} aria-hidden="true" /> Sujets non lus ({unreadTopics})
            </Link>
          </Button>
          <MarkAllAsReadButton className="w-full justify-start" />
        </div>
      )}

      {canCreateForum && (
        <section className="flex flex-col gap-2" aria-label="Administration du forum">
          <h2 className={groupTitle}>Administration</h2>
          <NewForumButton categoryId={categoryId} parentForumId={parentForumId} subForumCount={subForumCount} />
          {forumId && <LockButton id={forumId} type="forum" isLocked={isLocked || false} />}
          {forumId && <DeleteForumButton forumId={forumId} forumName={forumName || ""} />}
        </section>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden lg:sticky lg:top-20 lg:block" aria-label="Actions du forum">
        <Card className="flex flex-col gap-4 p-4">
          {forumId && (
            <ForumPrimaryActions
              forumId={forumId}
              isLocked={!!isLocked}
              isTournamentForum={!!isTournamentForum}
              isMember={!!session}
              isModerator={canCreateForum}
            />
          )}
          {secondary}
        </Card>
      </aside>

      {/* Téléphone : la même colonne sous la liste, sans les actions principales (déjà affichées en haut de la liste) */}
      <section className="lg:hidden" aria-labelledby="forum-tools-title">
        <Card className="flex flex-col gap-3 p-4">
          <h2 id="forum-tools-title" className={groupTitle}>Outils du forum</h2>
          {secondary}
        </Card>
      </section>
    </>
  );
}
