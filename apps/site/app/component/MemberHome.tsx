/**
 * Accueil d'un membre connecté (carte 210), dans l'ordre fixé par le responsable du projet :
 * 1. dans l'en-but, « Salut … », « Aller au forum » (l'action principale) et Discord ;
 * 2. ses trois derniers sujets non lus du forum ;
 * 3. la ligne de mêlée, puis les prochains tournois avec « Créer » ;
 * 4. les ligues de sa région avec « Créer » et la carte ;
 * 5. les articles avec « Écrire » ;
 * 6. les autres rubriques.
 * Pas de classement sur l'accueil. Sur ordinateur, deux colonnes de part et d'autre de la ligne de mêlée, devenue
 * verticale : le forum et les articles à gauche, les tournois et les ligues à droite. Sur téléphone, les deux
 * colonnes s'effacent (`max-lg:contents`) et les blocs suivent l'ordre ci-dessus (`order-*`, annulé sur ordinateur
 * pour que la grille place les deux colonnes et la ligne de mêlée dans l'ordre du code).
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, MapPin, MessageSquare } from "lucide-react";
import { Avatar, cn } from "@bbfrance/ui";
import { parseInlineBBCode } from "@/lib/bbcode";
import { UnreadDot, frenchDateTime } from "@/app/forum/component/ForumListItems";
import LigueBlason from "@/app/ligues/component/LigueBlason";
import { moreNavFor } from "@/common/components/AppShell/navItems";
import { END_ZONE, PitchField, ScrimmageLine } from "./PitchField";
import { CreateLink, ForumDiscordButtons, MoreLink, NextTournaments, blockSurface, blockTitle, focusRing } from "./HomeBlocks";
import LiguesMiniMap from "./LiguesMiniMap";
import type { HomeTournament, MemberLigue, MemberUnreadTopic, pickRandomArticle } from "./homeData";

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

function UnreadTopics({ topics, total, className }: { topics: MemberUnreadTopic[]; total: number; className?: string }) {
  return (
    <section aria-labelledby="home-unread" className={cn(blockSurface, className)}>
      <BlockHeader id="home-unread" title="Non lus au forum">
        {total > 0 && <MoreLink href="/forum/unread" srLabel={`les ${total} sujets non lus`}>Tout voir{total > topics.length ? ` (${total})` : ""}</MoreLink>}
      </BlockHeader>
      {topics.length > 0 ? (
        <ul className="m-0 list-none p-0">
          {topics.map((topic) => (
            <li key={topic.id} className="border-t border-bb-border">
              <Link href={`/forum/topic/${topic.id}`} className={rowLink}>
                <Avatar name={topic.lastPostAuthorName} src={topic.lastPostAuthorImage} size={36} aria-hidden="true" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex min-w-0 items-center gap-2">
                    <UnreadDot />
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
        <div className="flex flex-col items-center gap-2 border-t border-bb-border px-4 py-6 text-center">
          <MessageSquare size={28} aria-hidden="true" className="text-bb-text-muted" />
          <p className="m-0 text-base font-bold text-bb-text">Tu es à jour</p>
          <p className="m-0 max-w-[300px] text-sm leading-normal text-bb-text-muted">Tu as lu tous les sujets du forum.</p>
        </div>
      )}
    </section>
  );
}

function Ligues({ ligues, fromRegion, regionHref, className }: { ligues: MemberLigue[]; fromRegion: boolean; regionHref: string; className?: string }) {
  const points = ligues.map((ligue) => ({ id: ligue.id, name: ligue.name, lat: ligue.lat, lng: ligue.lng, ville: ligue.ville }));
  // La colonne de la petite carte n'existe que si au moins une ligue a des coordonnées (sinon elle resterait vide)
  const hasMap = points.some((point) => point.lat !== null && point.lng !== null);
  return (
    <section aria-labelledby="home-ligues" className={cn(blockSurface, className)}>
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
            <p className="m-0 border-t border-bb-border px-4 py-5 text-sm text-bb-text-muted lg:px-[22px]">Aucune ligue pour l&apos;instant.</p>
          )}
          {/* La carte des ligues (carte 210) : le lien sur téléphone ; sur ordinateur, la petite carte s'y ajoute */}
          <Link href="/carte?vue=ligues" className={cn("flex min-h-12 items-center gap-2 border-t border-bb-border px-4 text-sm font-semibold text-bb-accent-text no-underline lg:px-[22px]", focusRing)}>
            <MapPin size={16} aria-hidden="true" /> Voir les ligues sur la carte
          </Link>
        </div>
        <LiguesMiniMap points={points} className="border-t border-bb-border lg:border-l" />
      </div>
    </section>
  );
}

function Articles({ article, className }: { article: Awaited<ReturnType<typeof pickRandomArticle>>; className?: string }) {
  return (
    <section aria-labelledby="home-articles" className={cn(blockSurface, className)}>
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
        <p className="m-0 border-t border-bb-border px-4 py-5 text-sm text-bb-text-muted lg:px-[22px]">Aucun article pour l&apos;instant.</p>
      )}
    </section>
  );
}

/** Rubriques déjà présentes sur l'accueil du membre : elles ne sont pas répétées en bas de page. */
const ALREADY_ON_HOME = new Set(["/ligues", "/carte", "/articles"]);

export default function MemberHome({
  memberName,
  discordHref,
  unread,
  tournaments,
  registeredIds,
  tournamentCreateHref,
  ligues,
  article,
}: {
  memberName: string;
  discordHref: string | null;
  unread: { topics: MemberUnreadTopic[]; total: number };
  tournaments: HomeTournament[];
  registeredIds: Set<string>;
  tournamentCreateHref: string | null;
  ligues: { ligues: MemberLigue[]; fromRegion: boolean; regionHref: string };
  article: Awaited<ReturnType<typeof pickRandomArticle>>;
}) {
  const otherSections = moreNavFor(true).filter((item) => !ALREADY_ON_HOME.has(item.href));
  return (
    <PitchField className="font-bb-sans text-base text-bb-text">
      <section aria-labelledby="home-title" className={END_ZONE}>
        <div className="mx-auto flex w-full max-w-[1232px] flex-col gap-4 px-4 pt-5 pb-5 lg:flex-row lg:items-center lg:gap-4 lg:px-6 lg:py-6">
          <h1 id="home-title" className="m-0 min-w-0 flex-1 border-0 p-0 text-2xl leading-tight font-extrabold tracking-[-0.02em] break-words text-bb-text normal-case not-italic lg:text-3xl">
            Salut {memberName}
          </h1>
          <ForumDiscordButtons discordHref={discordHref} />
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1232px] flex-col gap-4 px-4 pt-4 pb-10 lg:grid lg:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] lg:items-start lg:gap-y-0 lg:px-6 lg:pt-6">
        <div className="flex flex-col gap-4 max-lg:contents lg:gap-5">
          <UnreadTopics topics={unread.topics} total={unread.total} className="order-1" />
          <Articles article={article} className="order-5" />
        </div>
        <ScrimmageLine vertical className="order-2 -mx-4 lg:order-none lg:mx-0 lg:self-stretch" />
        <div className="flex flex-col gap-4 max-lg:contents lg:gap-5">
          <NextTournaments tournaments={tournaments} createHref={tournamentCreateHref} createInHeader registeredIds={registeredIds} className="order-3" />
          <Ligues {...ligues} className="order-4" />
        </div>

        <nav aria-label="Autres rubriques" className="order-6 flex flex-wrap gap-2 lg:order-none lg:col-span-3 lg:mt-6">
          {otherSections.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("inline-flex min-h-11 items-center gap-2 rounded-full border border-bb-border bg-bb-surface px-4 text-sm font-bold text-bb-text no-underline hover:bg-bb-surface-2", focusRing)}
            >
              <item.icon size={16} aria-hidden="true" className="text-bb-text-muted" /> {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </PitchField>
  );
}
