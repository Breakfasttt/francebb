/**
 * Blocs de l'accueil, partagés par l'accueil du membre (`MemberHome`) et celui du visiteur (`VisitorHome`), dans
 * l'ordre de la page : forum, tournois (`NextTournaments`, dans `HomeBlocks.tsx`), classement, ligues, articles,
 * ressources, médias. Déplacés de `MemberHome.tsx` le 17 novembre 2026 pour que le visiteur ait les mêmes blocs.
 * Pour un visiteur : pas de bouton « Forum » ni de lien Discord dans le bloc forum, pas de lien vers la carte dans le
 * bloc des ligues (le haut de son accueil les porte déjà), et les liens « Créer » mènent à la connexion.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Avatar, cn } from "@bbfrance/ui";
import { parseInlineBBCode } from "@/lib/bbcode";
import { UnreadDot, frenchDateTime } from "@/app/forum/component/ForumListItems";
import LigueBlason from "@/app/ligues/component/LigueBlason";
import { CreateLink, MoreLink, blockSurface, blockTitle, focusRing } from "./HomeBlocks";
import LiguesMiniMap from "./LiguesMiniMap";
import type { HomeRankingEntry, HomeResource, MemberForumTopics, MemberLigue, pickRandomArticle } from "./homeData";

/** En-tête d'un bloc : le titre à gauche, les liens à droite, sur une seule ligne même en 360 pixels. */
function BlockHeader({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-2 bg-bb-surface-2 px-4 lg:px-5">
      <h2 id={id} className={cn(blockTitle, "min-w-0")}>{title}</h2>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

/** Ligne d'une liste de bloc : toute la ligne est un lien. */
const rowLink =
  "flex items-start gap-3 px-4 py-3 text-inherit no-underline transition-colors hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus lg:px-5";

/** Phrase d'un bloc vide. */
function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="border-t border-bb-border px-4 py-4 text-sm text-bb-text-muted lg:px-5">{children}</p>;
}

/** Lien du pied d'un bloc (« Voir les ligues sur la carte »…). */
const footerLink = cn("flex min-h-11 items-center gap-2 border-t border-bb-border px-4 text-sm font-semibold text-bb-text-muted no-underline hover:text-bb-accent-text lg:px-5", focusRing);

/**
 * Le bloc du forum. `visitor` : pas de bouton « Forum » (remplacé par « Tout voir ») ni de phrase « Tu es à jour »,
 * et `discordHref` reste vide (le haut de l'accueil du visiteur porte déjà ces deux boutons).
 */
export function ForumBlock({ forum, discordHref, visitor = false }: { forum: MemberForumTopics; discordHref: string | null; visitor?: boolean }) {
  const unread = forum.mode === "unread";
  return (
    <section aria-labelledby="home-forum" className={blockSurface}>
      <BlockHeader id="home-forum" title={unread ? "Non lus au forum" : "Derniers sujets du forum"}>
        <MoreLink href="/forum" srLabel="le forum">Aller au forum</MoreLink>
      </BlockHeader>
      {!unread && !visitor && (
        <p className="border-t border-bb-border px-4 py-2 text-sm text-bb-text-muted lg:px-5">Tu as tout lu. Voici les sujets les plus récents.</p>
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
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyLine>Le forum est encore vide.</EmptyLine>
      )}
      {(unread || discordHref) && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 border-t border-bb-border px-4 lg:px-5">
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

export function RankingBlock({ ranking, year }: { ranking: HomeRankingEntry[]; year: number }) {
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
                  <div className="flex items-center gap-3 px-4 py-3 lg:px-5">{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <EmptyLine>Pas encore de tournoi CDF validé cette saison.</EmptyLine>
      )}
    </section>
  );
}

/** Le bloc des ligues. `mapLink` : lien vers la carte des ligues en pied de bloc (absent pour un visiteur, dont le haut de
 * l'accueil propose déjà « Trouver une ligue »). */
export function LiguesBlock({
  ligues,
  fromRegion,
  regionHref,
  createHref,
  mapLink = true,
}: {
  ligues: MemberLigue[];
  fromRegion: boolean;
  regionHref: string;
  createHref?: string;
  mapLink?: boolean;
}) {
  const points = ligues.map((ligue) => ({ id: ligue.id, name: ligue.name, lat: ligue.lat, lng: ligue.lng, ville: ligue.ville }));
  // La colonne de la petite carte n'existe que si au moins une ligue a des coordonnées (sinon elle resterait vide)
  const hasMap = points.some((point) => point.lat !== null && point.lng !== null);
  return (
    <section aria-labelledby="home-ligues" className={blockSurface}>
      <BlockHeader id="home-ligues" title={fromRegion ? "Ligues de ta région" : "Dernières ligues"}>
        <MoreLink href={regionHref} srLabel="toutes les ligues">Tout voir</MoreLink>
        {createHref && <CreateLink href={createHref} label="Créer une ligue" />}
      </BlockHeader>
      {/* Liste puis petite carte en dessous : le bloc vit dans la colonne de contexte, trop étroite pour deux colonnes */}
      <div className="flex flex-col">
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
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyLine>Pas encore de ligue enregistrée.</EmptyLine>
          )}
          {/* La carte des ligues (carte 210) : le lien sur téléphone ; sur ordinateur, la petite carte s'y ajoute */}
          {mapLink && (
            <Link href="/carte?vue=ligues" className={footerLink}>
              Voir les ligues sur la carte
            </Link>
          )}
        </div>
        {hasMap && <LiguesMiniMap points={points} className="h-[200px] border-t border-bb-border" />}
      </div>
    </section>
  );
}

export function ArticlesBlock({ article, createHref }: { article: Awaited<ReturnType<typeof pickRandomArticle>>; createHref?: string }) {
  return (
    <section aria-labelledby="home-articles" className={blockSurface}>
      <BlockHeader id="home-articles" title="Articles">
        <MoreLink href="/articles" srLabel="tous les articles">Tout voir</MoreLink>
        {createHref && <CreateLink href={createHref} label="Écrire un article" text="Écrire" />}
      </BlockHeader>
      {article ? (
        <Link href={`/articles/${article.id}`} className={cn(rowLink, "flex-col gap-1 border-t border-bb-border")}>
          <span className="line-clamp-2 text-lg leading-snug font-bold break-words text-bb-text">{article.title}</span>
          <span className="text-sm text-bb-text-muted">Au hasard · par {article.author?.name || "Anonyme"}</span>

        </Link>
      ) : (
        <EmptyLine>Pas encore d&apos;article publié.</EmptyLine>
      )}
    </section>
  );
}

export function ResourcesBlock({ resources, createHref }: { resources: HomeResource[]; createHref?: string }) {
  return (
    <section aria-labelledby="home-resources" className={blockSurface}>
      <BlockHeader id="home-resources" title="Ressources">
        <MoreLink href="/ressources" srLabel="toutes les ressources">Tout voir</MoreLink>
        {createHref && <CreateLink href={createHref} label="Proposer une ressource" text="Proposer" />}
      </BlockHeader>
      {resources.length > 0 ? (
        <ul className="m-0 list-none p-0">
          {resources.map((resource) => {
            // Une ressource peut être une page du site ou un outil ailleurs (ouvert dans un nouvel onglet)
            const external = /^https?:\/\//.test(resource.link);
            const content = (
              <>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-base leading-snug font-bold break-words text-bb-text">{resource.title}</span>
                  {resource.description && <span className="line-clamp-2 text-sm leading-normal break-words text-bb-text-muted">{resource.description}</span>}
                </span>
                {external && <ExternalLink size={14} aria-hidden="true" className="mt-1 shrink-0 text-bb-text-muted" />}
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
        <EmptyLine>Pas encore de ressource partagée.</EmptyLine>
      )}
    </section>
  );
}

export function MediaBlock({ media }: { media: { twitch: string[]; youtube: string[] } }) {
  const channels = [
    ...media.twitch.map((name) => ({ key: `twitch-${name}`, name, kind: "Twitch" })),
    ...media.youtube.map((name) => ({ key: `youtube-${name}`, name, kind: "YouTube" })),
  ];
  return (
    <section aria-labelledby="home-media" className={blockSurface}>
      <BlockHeader id="home-media" title="Médias">
        <MoreLink href="/media" srLabel="les vidéos et directs">Tout voir</MoreLink>
      </BlockHeader>
      {channels.length > 0 ? (
        <ul className="m-0 list-none p-0">
          {channels.map(({ key, name, kind }) => (
            <li key={key} className="border-t border-bb-border">
              <Link href="/media" className={cn(rowLink, "items-center")}>
                <span className="min-w-0 flex-1 truncate text-base font-semibold text-bb-text">{name}</span>
                <span className="shrink-0 text-sm text-bb-text-muted">{kind}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyLine>Pas encore de chaîne vidéo référencée.</EmptyLine>
      )}
    </section>
  );
}
