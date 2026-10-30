/**
 * Lignes des listes du forum, dans le style de la refonte (ADR 0006, carte 085) : une ligne de forum (accueil et
 * sous-forums) et une ligne de sujet (page d'un forum), plus les petites marques partagées (point de non-lu,
 * badge de statut de tournoi). Chaque ligne est un lien unique, facile à toucher sur téléphone (64 pixels au moins).
 * Aucun état ni effet ici : ces composants servent aussi bien dans une page serveur que dans un composant client.
 */
import Link from "next/link";
import { Folder, Lock, Pin, Trophy } from "lucide-react";
import { Avatar, Badge } from "@bbfrance/ui";
import { parseInlineBBCode } from "@/lib/bbcode";

/** Date courte à la française (jj/mm/aaaa), comme dans le reste du forum. */
export const frenchDate = (date: Date | string) => new Date(date).toLocaleDateString("fr-FR");

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
  isCancelled: boolean;
  isFinished: boolean;
}

/** Badge du statut d'un tournoi : « Annulé », « Terminé » ou « Passé » ; rien pour un tournoi à venir. */
export function TournamentStatusBadge({ tournament }: { tournament: TournamentState | null | undefined }) {
  if (!tournament) return null;
  if (tournament.isCancelled) return <Badge variant="danger">Annulé</Badge>;
  if (tournament.isFinished) return <Badge variant="success">Terminé</Badge>;
  if (new Date(tournament.date) < new Date()) return <Badge variant="neutral">Passé</Badge>;
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
    authorName: string | null;
    date: Date | string;
  };
}

/**
 * Ligne d'un forum : icône carrée (trophée pour un forum de tournois, dossier sinon), nom (gras s'il contient du
 * non-lu), cadenas, description, dernier sujet sur une ligne tronquée, puis « N sujets · par X · date ».
 */
export function ForumRow({ forum }: { forum: ForumRowData }) {
  const { lastTopic } = forum;
  const Icon = forum.isTournamentForum ? Trophy : Folder;
  return (
    <Link
      href={`/forum/${forum.id}`}
      className="flex min-h-16 items-start gap-3 border-b border-bb-border px-3 py-3 text-bb-text last:border-b-0 hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus lg:px-4"
    >
      <span
        aria-hidden="true"
        className={`flex size-10 shrink-0 items-center justify-center rounded-bb-md bg-bb-surface-2 ${forum.hasNew ? "text-bb-accent-text" : "text-bb-text-muted"}`}
      >
        <Icon size={20} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-1.5">
          <InlineBBCode text={forum.name} className={`min-w-0 text-base leading-snug break-words ${forum.hasNew ? "font-bold" : "font-semibold"}`} />
          {forum.isLocked && <LockMark label="Forum verrouillé" size={14} />}
        </span>
        {forum.description && <span className="text-sm leading-snug text-bb-text-muted">{forum.description}</span>}
        {lastTopic ? (
          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-sm">
            {lastTopic.isTournament && <Trophy size={13} aria-hidden="true" className="shrink-0 text-bb-text-muted" />}
            <span className="min-w-0 truncate">{lastTopic.title}</span>
            <TournamentStatusBadge tournament={lastTopic.tournament} />
          </span>
        ) : (
          <span className="mt-0.5 text-sm text-bb-text-muted">Aucun sujet</span>
        )}
        <span className="text-[0.8125rem] text-bb-text-muted">
          {forum.topicCount} {forum.topicCount > 1 ? "sujets" : "sujet"}
          {lastTopic && ` · par ${lastTopic.authorName ?? "Anonyme"} · ${frenchDate(lastTopic.date)}`}
        </span>
      </span>
      {forum.hasNew && <UnreadDot className="mt-2" />}
    </Link>
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
  updatedAt: Date | string;
  postCount: number;
  views: number;
}

/**
 * Ligne d'un sujet, à la manière de Discourse : avatar de l'auteur, titre dominant (gras s'il est non lu), marques
 * épinglé / tournoi / verrouillé, badge de statut du tournoi, « par X · date », puis messages, vues et dernière
 * activité. Sur téléphone, ces trois chiffres passent sous le titre ; sur ordinateur, ils forment des colonnes.
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
              className={`min-w-0 text-[1.0625rem] leading-snug break-words ${topic.hasNew ? "font-bold" : "font-semibold"}`}
            />
            <TournamentStatusBadge tournament={topic.tournament} />
            {topic.isLocked && <LockMark label="Sujet verrouillé" size={14} />}
            {topic.hasNew && <UnreadDot />}
          </span>
          <span className="text-[0.8125rem] text-bb-text-muted">
            par {topic.author.name ?? "Anonyme"} · {frenchDate(topic.createdAt)}
          </span>
        </span>
        <span className="flex flex-wrap gap-x-3 text-[0.8125rem] text-bb-text-muted lg:flex-nowrap lg:gap-0 lg:text-sm">
          <span className="lg:w-24 lg:text-right">{plural(topic.postCount, "message")}</span>
          <span className="lg:w-20 lg:text-right">{plural(topic.views, "vue")}</span>
          <span className="lg:w-28 lg:text-right">
            <span className="lg:sr-only">Activité </span>
            {frenchDate(topic.updatedAt)}
          </span>
        </span>
      </span>
    </Link>
  );
}
