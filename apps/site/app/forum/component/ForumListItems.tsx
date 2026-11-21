/**
 * Lignes des listes du forum, dans le style de la refonte (ADR 0006, carte 085) : une ligne de forum (accueil et
 * sous-forums) et une ligne de sujet (page d'un forum), plus les petites marques partagées (point de non-lu,
 * badge de statut de tournoi). Chaque ligne est un lien unique, facile à toucher sur téléphone (64 pixels au moins).
 * Aucun état ni effet ici : ces composants servent aussi bien dans une page serveur que dans un composant client.
 */
import RelativeTime from "@/common/components/RelativeTime/RelativeTime";
import type { ReactNode } from "react";
import Link from "next/link";
import { Lock, Pin, Trophy } from "lucide-react";
import { Avatar, Badge } from "@bbfrance/ui";
import { parseInlineBBCode } from "@/lib/bbcode";
import { isTournamentOver } from "@/lib/tournamentDates";

/** Date courte à la française (jj/mm/aaaa), comme dans le reste du forum. */
export const frenchDate = (date: Date | string) => new Date(date).toLocaleDateString("fr-FR");

/**
 * Date et heure courtes à la française (« 04/11/2026 18:42 »), à l'heure de Paris : le serveur qui affiche la page
 * peut tourner à l'heure universelle, qui a une ou deux heures d'écart.
 */
export const frenchDateTime = (date: Date | string) =>
  new Date(date).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" });

/** Point bleu signalant du contenu non lu. Il porte un nom lisible par les lecteurs d'écran. */
export function UnreadDot({ className = "" }: { className?: string }) {
  return <span role="img" aria-label="Messages non lus" className={`inline-block size-2.5 shrink-0 rounded-full bg-bb-unread ${className}`} />;
}

/** Cadenas affiché à côté d'un forum ou d'un sujet verrouillé. */
export function LockMark({ label, size = 15 }: { label: string; size?: number }) {
  return <Lock size={size} role="img" aria-label={label} className="shrink-0 text-bb-text-muted" />;
}

interface TournamentState {
  date: Date | string;
  /** Dernier jour du tournoi (carte 187) ; facultatif, la date de début sert à défaut. */
  endDate?: Date | string | null;
  isCancelled: boolean;
  isFinished: boolean;
}

/** Badge du statut d'un tournoi : « Annulé », « Terminé » ou « Passé » ; rien pour un tournoi à venir. */
export function TournamentStatusBadge({ tournament }: { tournament: TournamentState | null | undefined }) {
  if (!tournament) return null;
  if (tournament.isCancelled) return <Badge variant="danger">Annulé</Badge>;
  if (tournament.isFinished) return <Badge variant="success">Terminé</Badge>;
  // « Passé » une fois le dernier jour fini, heure de Paris (règle de lib/tournamentDates.ts, carte 187)
  if (isTournamentOver(tournament)) return <Badge variant="neutral">Passé</Badge>;
  return null;
}

/** Texte BBCode d'une ligne (nom de forum, titre de sujet), mis en forme comme ailleurs dans le forum. */
function InlineBBCode({ text, className = "" }: { text: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: parseInlineBBCode(text) }} />;
}

export interface ForumRowData {
  id: string;
  name: string;
  description: string | null;
  isLocked: boolean;
  isTournamentForum: boolean;
  topicCount: number;
  hasNew: boolean;
  lastTopic?: {
    title: string;
    isTournament: boolean;
    tournament?: TournamentState | null;
    /** Auteur et date du dernier message du sujet (carte 166). */
    lastPostAuthorName: string | null;
    lastPostAt: Date | string;
  };
}

/**
 * Ligne d'un forum, en tableau (DESIGN.md, « Le forum ») : nom (gras s'il contient du non-lu, marqueur bleu à gauche),
 * cadenas, description discrète ; puis, en colonnes sur ordinateur, le nombre de sujets et le dernier message (titre
 * du sujet, auteur, date et heure). Sur téléphone, ces informations passent sous le nom sur une ligne discrète.
 * Un forum vide n'affiche que « Aucun sujet » (carte 190).
 */
export function ForumRow({ forum }: { forum: ForumRowData }) {
  const { lastTopic } = forum;
  return (
    <Link
      href={`/forum/${forum.id}`}
      className={`grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-1 border-b border-l-[3px] border-b-bb-border px-3 py-3 text-bb-text no-underline last:border-b-0 hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus lg:grid-cols-[minmax(0,1fr)_88px_minmax(0,300px)] lg:items-center lg:px-4 ${forum.hasNew ? "border-l-bb-unread" : "border-l-transparent"}`}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-1.5">
          {forum.isTournamentForum && <Trophy size={15} role="img" aria-label="Forum de tournois" className="shrink-0 text-bb-text-muted" />}
          <InlineBBCode text={forum.name} className={`min-w-0 text-base leading-snug break-words ${forum.hasNew ? "font-bold" : "font-semibold"}`} />
          {forum.isLocked && <LockMark label="Forum verrouillé" size={14} />}
          {forum.hasNew && <span className="sr-only">(messages non lus)</span>}
        </span>
        {forum.description && <span className="text-sm leading-snug text-bb-text-muted">{forum.description}</span>}
      </span>
      <span className="text-sm text-bb-text-muted tabular-nums max-lg:hidden lg:text-right">
        <span className="font-semibold text-bb-text lg:block lg:text-base">{forum.topicCount.toLocaleString("fr-FR")}</span>{" "}
        {forum.topicCount > 1 ? "sujets" : "sujet"}
      </span>
      {lastTopic ? (
        <span className="flex min-w-0 flex-col text-sm">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="min-w-0 truncate text-bb-text">{lastTopic.title}</span>
            <TournamentStatusBadge tournament={lastTopic.tournament} />
          </span>
          <span className="truncate text-bb-text-muted tabular-nums">
            {lastTopic.lastPostAuthorName ?? "Anonyme"} · <RelativeTime date={lastTopic.lastPostAt} />
          </span>
        </span>
      ) : (
        <span className="text-sm text-bb-text-muted">Aucun sujet</span>
      )}
    </Link>
  );
}

/** En-tête des colonnes d'une liste de forums, sur ordinateur (voix Heading). */
export function ForumColumnsHeader({ title }: { title: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-x-6 font-bb-heading text-bb-label text-bb-text-muted lg:grid-cols-[minmax(0,1fr)_88px_minmax(0,300px)]">
      <span>{title}</span>
      <span className="hidden text-right lg:block">Sujets</span>
      <span className="hidden lg:block">Dernier message</span>
    </div>
  );
}

export interface TopicRowData {
  id: string;
  title: string;
  isSticky: boolean;
  isLocked: boolean;
  isTournament: boolean;
  tournament?: TournamentState | null;
  hasNew: boolean;
  author: { name: string | null; image?: string | null };
  createdAt: Date | string;
  /** Auteur et date du dernier message (carte 166). */
  lastPostAuthorName: string | null;
  lastPostAt: Date | string;
  postCount: number;
  views: number;
}

/**
 * Ligne d'un sujet, à la manière de Discourse : avatar de l'auteur, titre dominant (gras s'il est non lu), marques
 * épinglé / tournoi / verrouillé, badge de statut du tournoi, « par X · date », puis messages, vues et dernier
 * message (« Dernier : auteur », date et heure). Sur téléphone, ces informations passent sous le titre ; sur
 * ordinateur, elles forment des colonnes.
 */
export function TopicRow({ topic }: { topic: TopicRowData }) {
  const plural = (count: number, word: string) => `${count.toLocaleString("fr-FR")} ${word}${count > 1 ? "s" : ""}`;
  return (
    <Link
      href={`/forum/topic/${topic.id}`}
      className="flex min-h-16 items-start gap-3 border-b border-bb-border px-3 py-3 text-bb-text last:border-b-0 hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus lg:items-center lg:px-4"
    >
      <Avatar name={topic.author.name} src={topic.author.image} size={40} className="mt-0.5 lg:mt-0" aria-hidden="true" />
      <span className="flex min-w-0 flex-1 flex-col gap-1 lg:flex-row lg:items-center lg:gap-4">
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
            {topic.isSticky && <Pin size={15} role="img" aria-label="Épinglé" className="shrink-0 rotate-45 text-bb-accent-text" />}
            {!topic.isSticky && topic.isTournament && <Trophy size={15} role="img" aria-label="Tournoi" className="shrink-0 text-bb-accent-text" />}
            <InlineBBCode
              text={topic.title}
              className={`min-w-0 text-bb-lead leading-snug break-words ${topic.hasNew ? "font-bold" : "font-semibold"}`}
            />
            <TournamentStatusBadge tournament={topic.tournament} />
            {topic.isLocked && <LockMark label="Sujet verrouillé" size={14} />}
            {topic.hasNew && <UnreadDot />}
          </span>
          <span className="text-sm text-bb-text-muted">
            par {topic.author.name ?? "Anonyme"} · {frenchDate(topic.createdAt)}
          </span>
        </span>
        <span className="flex flex-wrap gap-x-3 text-sm text-bb-text-muted lg:flex-nowrap lg:gap-0">
          <span className="lg:w-24 lg:text-right">{plural(topic.postCount, "message")}</span>
          <span className="lg:w-20 lg:text-right">{plural(topic.views, "vue")}</span>
          <span className="flex min-w-0 flex-wrap gap-x-1 lg:w-40 lg:flex-col lg:text-right">
            <span className="min-w-0 truncate">Dernier : {topic.lastPostAuthorName ?? "Anonyme"}</span>
            <span>
              <span className="lg:hidden">· </span>
              <RelativeTime date={topic.lastPostAt} />
            </span>
          </span>
        </span>
      </span>
    </Link>
  );
}
