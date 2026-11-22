/**
 * Actions des listes du forum (refonte, carte 085).
 * - `ForumPrimaryActions` : « Nouveau sujet », « Nouveau tournoi » (forum de tournois) ou, dans un forum verrouillé
 *   pour un membre qui n'est pas modérateur, le bouton désactivé « Forum verrouillé ». Sur téléphone, la page les
 *   affiche en haut de la liste ; sur ordinateur, ils sont en tête de la colonne latérale.
 * - `ForumSidebar` : le contenu du panneau gauche (SiteLayout, DESIGN.md) : action principale, outils en lignes,
 *   administration. Sur téléphone, SiteLayout le place sous la liste.
 */
import { getUnreadTopicsCount, getSubForumCount } from "@/app/forum/actions";
import Link from "next/link";
import { Lock as LockIcon } from "lucide-react";
import { Button } from "@bbfrance/ui";
import { PanelLink, PanelTitle } from "@/common/components/SiteLayout/SiteLayout";
import { getActiveSession } from "@/lib/authGuard";
import { isModerator } from "@/lib/roles";
import DeleteForumButton from "@/app/forum/component/DeleteForumButton";
import MarkAllAsReadButton from "@/app/forum/component/MarkAllAsReadButton";
import NewForumButton from "@/app/forum/component/NewForumButton";
import LockButton from "@/app/forum/component/LockButton";
import ForumQuickSearch from "@/app/forum/component/ForumQuickSearch";

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
          Nouveau sujet
        </Link>
      </Button>
      {isTournamentForum && (
        <Button asChild variant="secondary" size="tap" className="w-full">
          <Link href={`/forum/new-tournament?forumId=${forumId}`}>
            Annoncer un tournoi
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
  onUnreadPage = false,
}: {
  /** Page des sujets non lus : son lien est allumé, et « Tout marquer comme lu » est déjà dans l'en-tête de la page. */
  onUnreadPage?: boolean;
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
  // Accueil du forum et non-lus : « Nouveau sujet » mène au choix du forum (/forum/new-topic sans forumId)
  const isForumHome = !forumId && !categoryId && !parentForumId;

  // Contenu du panneau gauche (SiteLayout) : action principale en haut (sur ordinateur seulement : sur téléphone, la
  // page l'affiche déjà en haut de la liste), puis les outils en lignes, puis l'administration.
  return (
    <>
      {forumId && (
        <ForumPrimaryActions
          forumId={forumId}
          isLocked={!!isLocked}
          isTournamentForum={!!isTournamentForum}
          isMember={!!session}
          isModerator={canCreateForum}
          className="max-lg:hidden"
        />
      )}

      {isForumHome && (
        <div className="flex flex-col gap-3 max-lg:hidden">
          {session && (
            <Button asChild variant="primary" size="tap" className="w-full">
              <Link href="/forum/new-topic">Nouveau sujet</Link>
            </Button>
          )}
          <ForumQuickSearch id="forum-search-panel" placeholder="Rechercher…" />
        </div>
      )}

      <nav aria-labelledby="forum-tools-title" className="flex flex-col">
        <PanelTitle id="forum-tools-title">Outils du forum</PanelTitle>
        {showUnread && (
          <PanelLink href="/forum/unread" count={unreadTopics} active={onUnreadPage} linkComponent={Link}>
            Sujets non lus
          </PanelLink>
        )}
        <PanelLink href={forumId ? `/forum/search?forumId=${forumId}` : `/forum/search`} linkComponent={Link}>
          Recherche avancée
        </PanelLink>
        <PanelLink href="/membres" linkComponent={Link}>
          Les membres
        </PanelLink>
      </nav>

      {showUnread && !onUnreadPage && <MarkAllAsReadButton className="w-full justify-start" />}

      {canCreateForum && (
        <section className="flex flex-col gap-2" aria-labelledby="forum-admin-title">
          <PanelTitle id="forum-admin-title">Administration</PanelTitle>
          <NewForumButton categoryId={categoryId} parentForumId={parentForumId} subForumCount={subForumCount} />
          {forumId && <LockButton id={forumId} type="forum" isLocked={isLocked || false} />}
          {forumId && <DeleteForumButton forumId={forumId} forumName={forumName || ""} />}
        </section>
      )}
    </>
  );
}
