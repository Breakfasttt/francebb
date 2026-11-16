/**
 * Accueil d'un membre connecté (carte 210, revu le 16 novembre 2026 à la demande du responsable du projet) : une seule
 * colonne qui défile, sans bandeau d'accueil, dans cet ordre :
 * 1. le forum : ses trois derniers sujets non lus, ou, s'il a tout lu, les trois sujets les plus récents ; le bouton
 *    « Forum » est dans l'en-tête du bloc ;
 * 2. les prochains tournois avec « Créer » ;
 * 3. la tête du classement du Championnat de France de l'année ;
 * 4. les ligues de sa région avec « Créer » et la carte ;
 * 5. les articles avec « Écrire » ;
 * 6. les dernières ressources avec « Proposer » ;
 * 7. les chaînes vidéo (médias).
 * Statistiques reste au pied de page, Membres dans le panneau « Plus » et sur le forum, Jouer dans le panneau « Plus ».
 * Sur ordinateur, des repères à droite de l'écran (`HomeWaypoints`) mènent d'un bloc à l'autre.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight, ExternalLink, MapPin, MessageSquare, Radio, Youtube } from "lucide-react";
import { Avatar, Button, cn } from "@bbfrance/ui";
import { parseInlineBBCode } from "@/lib/bbcode";
import { UnreadDot, frenchDateTime } from "@/app/forum/component/ForumListItems";
import LigueBlason from "@/app/ligues/component/LigueBlason";
import { CreateLink, MoreLink, NextTournaments, blockSurface, blockTitle, focusRing } from "./HomeBlocks";
import HomeWaypoints, { type Waypoint } from "./HomeWaypoints";
import LiguesMiniMap from "./LiguesMiniMap";
import type { HomeRankingEntry, HomeResource, HomeTournament, MemberForumTopics, MemberLigue, pickRandomArticle } from "./homeData";

/** Les blocs de l'accueil, dans l'ordre de la page : ancre et nom affiché dans les repères. */
const WAYPOINTS: Waypoint[] = [
  { id: "forum", label: "Forum" },
  { id: "tournois", label: "Tournois" },
  { id: "classement", label: "Classement" },
  { id: "ligues", label: "Ligues" },
  { id: "articles", label: "Articles" },
  { id: "ressources", label: "Ressources" },
  { id: "medias", label: "Médias" },
];

/** Ancre d'un bloc : le haut du bloc s'arrête sous la barre du haut, collée à l'écran. */
function Anchor({ id, children }: { id: string; children: ReactNode }) {
  return <div id={id} className="scroll-mt-24">{children}</div>;
}

/** En-tête d'un bloc : le titre à gauche, les liens à droite, sur une seule ligne même en 360 pixels. */
function BlockHeader({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2 lg:px-[22px] lg:pt-4">
      <h2 id={id} className={cn(blockTitle, "min-w-0")}>{title}</h2>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

/** Ligne d'une liste de bloc : toute la ligne est un lien. */
const rowLink =
  "flex items-start gap-3 px-4 py-3.5 text-inherit no-underline transition-colors hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus lg:px-[22px]";

/** Phrase d'un bloc vide. */
function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="m-0 border-t border-bb-border px-4 py-5 text-sm text-bb-text-muted lg:px-[22px]">{children}</p>;
}

/** Lien du pied d'un bloc (« Voir les ligues sur la carte »…). */
const footerLink = cn("flex min-h-12 items-center gap-2 border-t border-bb-border px-4 text-sm font-semibold text-bb-accent-text no-underline lg:px-[22px]", focusRing);

function ForumBlock({ forum, discordHref }: { forum: MemberForumTopics; discordHref: string | null }) {
  const unread = forum.mode === "unread";
  return (
    <section aria-labelledby="home-forum" className={blockSurface}>
      <BlockHeader id="home-forum" title={unread ? "Non lus au forum" : "Derniers sujets du forum"}>
        <Button asChild variant="primary" size="tap" className="px-4 font-extrabold">
          <Link href="/forum">
            <MessageSquare size={18} aria-hidden="true" /> Forum
          </Link>
        </Button>
      </BlockHeader>
      {!unread && (
        <p className="m-0 px-4 pb-3 text-sm text-bb-text-muted lg:px-[22px]">Tu es à jour : tu as lu tous les sujets du forum.</p>
      )}
      {forum.topics.length > 0 ? (
        <ul className="m-0 list-none p-0">
          {forum.topics.map((topic) => (
            <li key={topic.id} className="border-t border-bb-border">
              <Link href={`/forum/topic/${topic.id}`} className={rowLink}>
                <Avatar name={topic.lastPostAuthorName} src={topic.lastPostAuthorImage} size={36} aria-hidden="true" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex min-w-0 items-center gap-2">
                    {unread && <UnreadDot />}
                    <span className="line-clamp-2 min-w-0 text-base leading-snug font-bold break-words text-bb-text" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.title) }} />
                  </span>
                  <span className="text-sm text-bb-text-muted">
                    <span dangerouslySetInnerHTML={{ __html: parseInlineBBCode(topic.forumName) }} /> · {topic.lastPostAuthorName} · {frenchDateTime(topic.lastPostAt)}
                  </span>
                  {topic.excerpt && <span className="line-clamp-2 text-sm leading-normal break-words text-bb-text">{topic.excerpt}</span>}
                </span>
                <ChevronRight size={18} aria-hidden="true" className="shrink-0 self-center text-bb-text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyLine>Aucun sujet pour l&apos;instant.</EmptyLine>
      )}
      {(unread || discordHref) && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 border-t border-bb-border px-4 lg:px-[22px]">
          {unread && (
            <Link href="/forum/unread" className={cn("inline-flex min-h-12 items-center gap-1.5 text-sm font-semibold text-bb-accent-text no-underline", focusRing)}>
              {forum.total > 1 ? `Voir les ${forum.total} sujets non lus` : "Voir le sujet non lu"} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
          {discordHref && (
            <a href={discordHref} target="_blank" rel="noopener noreferrer" className={cn("inline-flex min-h-12 items-center gap-1.5 text-sm font-semibold text-bb-text-muted no-underline hover:text-bb-text", focusRing)}>
              Rejoindre le Discord <ExternalLink size={14} aria-hidden="true" />
              <span className="sr-only">(nouvel onglet)</span>
            </a>
          )}
        </div>
      )}
    </section>
  );
}

function RankingBlock({ ranking, year }: { ranking: HomeRankingEntry[]; year: number }) {
  return (
    <section aria-labelledby="home-ranking" className={blockSurface}>
      <BlockHeader id="home-ranking" title={`Classement ${year}`}>
        <MoreLink href="/classement" srLabel="le classement du Championnat de France">Tout voir</MoreLink>
      </BlockHeader>
      {ranking.length > 0 ? (
        <ol className="m-0 list-none p-0">
          {ranking.map((entry, index) => {
            const content = (
              <>
                <span className={cn("w-7 shrink-0 text-right text-base font-extrabold tabular-nums", index === 0 ? "text-bb-accent-text" : "text-bb-text-muted")}>
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-base font-bold text-bb-text">{entry.name}</span>
                <span className="shrink-0 text-sm font-semibold text-bb-text-muted tabular-nums">
                  {entry.totalPoints.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} pts
                </span>
              </>
            );
            return (
              <li key={`${index}-${entry.name}`} className="border-t border-bb-border">
                {entry.userId ? (
                  <Link href={`/spy/${entry.userId}`} className={cn(rowLink, "items-center py-3")}>{content}</Link>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 lg:px-[22px]">{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <EmptyLine>Aucun tournoi du Championnat de France validé cette saison pour l&apos;instant.</EmptyLine>
      )}
    </section>
  );
}

function LiguesBlock({ ligues, fromRegion, regionHref }: { ligues: MemberLigue[]; fromRegion: boolean; regionHref: string }) {
  const points = ligues.map((ligue) => ({ id: ligue.id, name: ligue.name, lat: ligue.lat, lng: ligue.lng, ville: ligue.ville }));
  // La colonne de la petite carte n'existe que si au moins une ligue a des coordonnées (sinon elle resterait vide)
  const hasMap = points.some((point) => point.lat !== null && point.lng !== null);
  return (
    <section aria-labelledby="home-ligues" className={blockSurface}>
      <BlockHeader id="home-ligues" title={fromRegion ? "Ligues de ta région" : "Dernières ligues"}>
        <MoreLink href={regionHref} srLabel="toutes les ligues">Tout voir</MoreLink>
        <CreateLink href="/ligues/create" label="Créer une ligue" />
      </BlockHeader>
      <div className={cn("grid", hasMap && "lg:grid-cols-[minmax(0,1fr)_220px]")}>
        <div className="flex flex-col">
          {ligues.length > 0 ? (
            <ul className="m-0 list-none p-0">
              {ligues.map((ligue) => (
                <li key={ligue.id} className="border-t border-bb-border">
                  <Link href={`/ligue/${ligue.id}`} className={cn(rowLink, "items-center")}>
                    <LigueBlason image={ligue.image} size={36} />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-base leading-snug font-bold break-words text-bb-text">{ligue.name}</span>
                      <span className="text-sm text-bb-text-muted">
                        {ligue.ville ? `${ligue.ville} · ` : ""}{ligue._count.members} membre{ligue._count.members > 1 ? "s" : ""}
                      </span>
                    </span>
                    <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-bb-text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyLine>Aucune ligue pour l&apos;instant.</EmptyLine>
          )}
          {/* La carte des ligues (carte 210) : le lien sur téléphone ; sur ordinateur, la petite carte s'y ajoute */}
          <Link href="/carte?vue=ligues" className={footerLink}>
            <MapPin size={16} aria-hidden="true" /> Voir les ligues sur la carte
          </Link>
        </div>
        <LiguesMiniMap points={points} className="border-t border-bb-border lg:border-l" />
      </div>
    </section>
  );
}

function ArticlesBlock({ article }: { article: Awaited<ReturnType<typeof pickRandomArticle>> }) {
  return (
    <section aria-labelledby="home-articles" className={blockSurface}>
      <BlockHeader id="home-articles" title="Articles">
        <MoreLink href="/articles" srLabel="tous les articles">Tout voir</MoreLink>
        <CreateLink href="/articles/create" label="Écrire un article" text="Écrire" />
      </BlockHeader>
      {article ? (
        <Link href={`/articles/${article.id}`} className={cn(rowLink, "flex-col gap-1 border-t border-bb-border")}>
          <span className="line-clamp-2 text-lg leading-snug font-bold break-words text-bb-text">{article.title}</span>
          <span className="text-sm text-bb-text-muted">Au hasard · par {article.author?.name || "Anonyme"}</span>
          <span aria-hidden="true" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-bb-accent-text">
            Lire l&apos;article <ArrowRight size={16} />
          </span>
        </Link>
      ) : (
        <EmptyLine>Aucun article pour l&apos;instant.</EmptyLine>
      )}
    </section>
  );
}

function ResourcesBlock({ resources }: { resources: HomeResource[] }) {
  return (
    <section aria-labelledby="home-resources" className={blockSurface}>
      <BlockHeader id="home-resources" title="Ressources">
        <MoreLink href="/ressources" srLabel="toutes les ressources">Tout voir</MoreLink>
        <CreateLink href="/ressources/submit" label="Proposer une ressource" text="Proposer" />
      </BlockHeader>
      {resources.length > 0 ? (
        <ul className="m-0 list-none p-0">
          {resources.map((resource) => {
            // Une ressource peut être une page du site ou un outil ailleurs (ouvert dans un nouvel onglet)
            const external = /^https?:\/\//.test(resource.link);
            const content = (
              <>
                <BookOpen size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-bb-accent-text" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-base leading-snug font-bold break-words text-bb-text">{resource.title}</span>
                  {resource.description && <span className="line-clamp-2 text-sm leading-normal break-words text-bb-text-muted">{resource.description}</span>}
                </span>
                {external ? (
                  <ExternalLink size={16} aria-hidden="true" className="shrink-0 self-center text-bb-text-muted" />
                ) : (
                  <ChevronRight size={18} aria-hidden="true" className="shrink-0 self-center text-bb-text-muted" />
                )}
              </>
            );
            return (
              <li key={resource.id} className="border-t border-bb-border">
                {external ? (
                  <a href={resource.link} target="_blank" rel="noopener noreferrer" className={rowLink}>
                    {content}
                    <span className="sr-only">(nouvel onglet)</span>
                  </a>
                ) : (
                  <Link href={resource.link} className={rowLink}>{content}</Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyLine>Aucune ressource pour l&apos;instant.</EmptyLine>
      )}
    </section>
  );
}

function MediaBlock({ media }: { media: { twitch: string[]; youtube: string[] } }) {
  const channels = [
    ...media.twitch.map((name) => ({ key: `twitch-${name}`, name, kind: "Direct Twitch", Icon: Radio })),
    ...media.youtube.map((name) => ({ key: `youtube-${name}`, name, kind: "YouTube", Icon: Youtube })),
  ];
  return (
    <section aria-labelledby="home-media" className={blockSurface}>
      <BlockHeader id="home-media" title="Médias">
        <MoreLink href="/media" srLabel="les vidéos et directs">Tout voir</MoreLink>
      </BlockHeader>
      {channels.length > 0 ? (
        <ul className="m-0 list-none p-0">
          {channels.map(({ key, name, kind, Icon }) => (
            <li key={key} className="border-t border-bb-border">
              <Link href="/media" className={cn(rowLink, "items-center")}>
                <Icon size={20} aria-hidden="true" className="shrink-0 text-bb-accent-text" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-base font-bold text-bb-text">{name}</span>
                  <span className="text-sm text-bb-text-muted">{kind}</span>
                </span>
                <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-bb-text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyLine>Aucune chaîne vidéo pour l&apos;instant.</EmptyLine>
      )}
    </section>
  );
}

export default function MemberHome({
  discordHref,
  forum,
  tournaments,
  registeredIds,
  tournamentCreateHref,
  ligues,
  article,
  ranking,
  resources,
  media,
}: {
  discordHref: string | null;
  forum: MemberForumTopics;
  tournaments: HomeTournament[];
  registeredIds: Set<string>;
  tournamentCreateHref: string | null;
  ligues: { ligues: MemberLigue[]; fromRegion: boolean; regionHref: string };
  article: Awaited<ReturnType<typeof pickRandomArticle>>;
  ranking: HomeRankingEntry[];
  resources: HomeResource[];
  media: { twitch: string[]; youtube: string[] };
}) {
  const year = new Date().getFullYear();
  return (
    <div className="font-bb-sans text-base text-bb-text">
      <h1 className="sr-only">Accueil</h1>
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4 px-4 pt-4 pb-10 lg:gap-6 lg:px-6 lg:pt-8 lg:pb-16">
        <Anchor id="forum"><ForumBlock forum={forum} discordHref={discordHref} /></Anchor>
        <Anchor id="tournois">
          <NextTournaments tournaments={tournaments} createHref={tournamentCreateHref} createInHeader registeredIds={registeredIds} />
        </Anchor>
        <Anchor id="classement"><RankingBlock ranking={ranking} year={year} /></Anchor>
        <Anchor id="ligues"><LiguesBlock {...ligues} /></Anchor>
        <Anchor id="articles"><ArticlesBlock article={article} /></Anchor>
        <Anchor id="ressources"><ResourcesBlock resources={resources} /></Anchor>
        <Anchor id="medias"><MediaBlock media={media} /></Anchor>
      </div>
      <HomeWaypoints items={WAYPOINTS} />
    </div>
  );
}
