/**
 * Recherche avancée du forum (refonte, carte 088) : formulaire (mots-clés et filtres), puis les sujets trouvés, 20 par
 * page. Depuis la revue 221, la page a la coquille du forum (SiteLayout) : les filtres sont dans le panneau gauche sur
 * ordinateur ; les messages trouvés sont regroupés par sujet (« 12 messages trouvés dans ce sujet ») et chaque ligne
 * mène au message le mieux placé ; les sujets archivés restent trouvables, avec un badge « Archivé ».
 * Une ligne : titre du sujet (avec un trophée pour un tournoi), forum, auteur, ancienneté, extrait du message avec les
 * mots cherchés surlignés, vues du sujet, date du dernier message et bouton « Voir ».
 * Depuis la carte 169, un mot trouvé dans le titre d'un sujet ne ramène que son premier message, et une page illisible
 * dans l'adresse donne la page 1.
 * Depuis la carte 191, les mots-clés passent par la recherche plein texte de Postgres (lib/forumSearch.ts) : elle
 * comprend le français (« nains chaos » trouve « Nains du Chaos », « équipe » trouve « equipes ») et s'appuie sur un
 * index au lieu de relire tous les messages. Les résultats sont triés par pertinence puis du plus récent au plus
 * ancien, sauf si l'on choisit un tri par date. Les filtres et les droits d'accès restent des filtres Prisma.
 */
import Link from "next/link";
import { Eye, SearchX, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge, Button, Card, EmptyState, PageNav } from "@bbfrance/ui";
import { prisma } from "@/lib/prisma";
import { parseInlineBBCode } from "@/lib/bbcode";
import { getActiveSession } from "@/lib/authGuard";
import { rateLimitRefusal } from "@/lib/rateLimit";
import { getForumAccess, forumAccessWhere, topicAccessWhere } from "@/lib/forumAccess";
import { isModerator } from "@/lib/roles";
import { forumPostHrefFor } from "@/lib/forumPostLink";
import { headlineSnippet, plainSnippet } from "@/lib/forumSearchSnippet";
import { filteredPostHits, headlinesFor, searchPostHits, type SearchSort } from "@/lib/forumSearch";
import { groupHitsByTopic, topicHitsLabel, type SearchHit } from "@/lib/forumSearchGroups";
import type { Prisma } from "@/prisma/generated-client";
import SearchForm, { SearchFilterPanel, SearchFormProvider, type ForumOption } from "@/app/forum/component/SearchForm";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import SiteLayout from "@/common/components/SiteLayout/SiteLayout";

export const dynamic = "force-dynamic";

/** Sujets affichés par page de résultats. */
const TOPICS_PER_PAGE = 20;

function getDescendantForumIds(allForums: { id: string; parentForumId: string | null }[], rootId: string): string[] {
  let ids = [rootId];
  const children = allForums.filter(f => f.parentForumId === rootId);
  for (const child of children) {
    ids = ids.concat(getDescendantForumIds(allForums, child.id));
  }
  return ids;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const [session, { roles }] = await Promise.all([getActiveSession(), getForumAccess()]);
  const params = await searchParams;

  const q = (params.q as string) || "";
  const forumId = (params.forumId as string) || "";
  const authorQuery = (params.author as string) || "";
  const dateStr = (params.date as string) || "all";
  // Tri : par pertinence (par défaut), ou par date si l'adresse le demande (« desc » ou « asc »)
  const sortBy: SearchSort = params.sortBy === "desc" || params.sortBy === "asc" ? params.sortBy : "relevance";
  // Un numéro de page absent ou illisible (« ?page=abc ») donne la page 1
  const page = Math.max(1, parseInt((params.page as string) || "1", 10) || 1);
  const skip = (page - 1) * TOPICS_PER_PAGE;

  // 1. Forums proposés dans la liste du filtre
  // Seulement les catégories / forums accessibles au rôle (lib/forumAccess.ts)
  const allCategories = await prisma.category.findMany({
    where: { allowedRoles: { in: roles } },
    orderBy: { order: "asc" }
  });
  const allForumsDB = await prisma.forum.findMany({
    where: forumAccessWhere(roles),
    orderBy: { name: "asc" }
  });

  const flatForums: ForumOption[] = [];
  allCategories.forEach(cat => {
    const rootForums = allForumsDB.filter(f => f.categoryId === cat.id && !f.parentForumId);

    const recurse = (forumsList: typeof allForumsDB, level: number) => {
      forumsList.forEach(f => {
        flatForums.push({ id: f.id, name: `${cat.name} - ${f.name}`, level });
        const children = allForumsDB.filter(child => child.parentForumId === f.id);
        if (children.length > 0) recurse(children, level + 1);
      });
    };

    recurse(rootForums, 0);
  });

  // 2. Filtres de la requête
  // Le filtre des sujets est un objet à part, complété plus bas par le filtre du forum. Les sujets archivés restent
  // trouvables (revue 221) : l'accueil du forum les compte, et la liste d'un forum les range en bas.
  const topicWhere: Prisma.TopicWhereInput = { ...topicAccessWhere(roles) };
  const whereClause: Prisma.PostWhereInput = {
    isDeleted: false,
    topic: topicWhere
  };

  const isMod = isModerator(session?.user?.role);
  if (!isMod) {
    whereClause.isModerated = false;
  }

  if (authorQuery) {
    whereClause.author = { name: { contains: authorQuery, mode: "insensitive" } };
  }

  if (dateStr !== "all") {
    const dateLimit = new Date();
    if (dateStr === "7d") dateLimit.setDate(dateLimit.getDate() - 7);
    else if (dateStr === "30d") dateLimit.setDate(dateLimit.getDate() - 30);
    else if (dateStr === "1y") dateLimit.setFullYear(dateLimit.getFullYear() - 1);

    whereClause.createdAt = { gte: dateLimit };
  }

  if (forumId) {
    const allForumsFlat = await prisma.forum.findMany({ select: { id: true, parentForumId: true } });
    const targetForumIds = getDescendantForumIds(allForumsFlat, forumId);

    topicWhere.forumId = { in: targetForumIds };
  }

  const hasPerformedSearch = !!params.q || !!params.author || !!params.forumId;

  // Sans recherche lancée (ni mot-clé, ni auteur, ni forum), aucune requête n'est faite.
  // Avec des mots-clés : la recherche plein texte donne les messages candidats dans l'ordre d'affichage, puis Prisma
  // garde ceux qui passent les filtres et les droits d'accès. Sans mot-clé : la liste filtrée par Prisma, par date.
  // Les messages sont ensuite regroupés par sujet ; seuls les sujets de la page sont lus en détail. Les requêtes
  // s'enchaînent l'une après l'autre (la base locale de développement refuse les requêtes simultanées).
  let hits: SearchHit[] = [];
  // Limite d'actions par minute pour un membre connecté (carte 224) ; un visiteur n'est pas identifiable
  const tooFast = hasPerformedSearch && session?.user?.id ? await rateLimitRefusal(session.user.id, session.user.role, "SEARCH") : null;
  if (hasPerformedSearch && !tooFast) {
    hits = q ? await searchPostHits(q, sortBy, whereClause) : await filteredPostHits(sortBy, whereClause);
  }
  const groups = groupHitsByTopic(hits);
  const pageGroups = groups.slice(skip, skip + TOPICS_PER_PAGE);
  const representativeIds = pageGroups.map((group) => group.postIds[0]);
  const pagePosts = representativeIds.length === 0
    ? []
    : await prisma.post.findMany({
        where: { id: { in: representativeIds } },
        include: { author: { select: { name: true } }, topic: { include: { forum: { select: { name: true } } } } }
      });
  const postById = new Map(pagePosts.map((post) => [post.id, post]));
  const results = pageGroups.flatMap((group) => {
    const post = postById.get(group.postIds[0]);
    return post ? [{ post, count: group.postIds.length }] : [];
  });

  const headlines = q ? await headlinesFor(representativeIds, q) : new Map<string, string>();
  const snippetFor = (post: { id: string; content: string }) => {
    const headline = headlines.get(post.id);
    return headline === undefined ? plainSnippet(post.content) : headlineSnippet(headline, post.content);
  };

  const totalPages = Math.max(1, Math.ceil(groups.length / TOPICS_PER_PAGE));

  // Lien vers chaque message, sur la bonne page de son sujet (lib/forumPostLink.ts) : une requête de comptage par
  // résultat, 20 au plus, l'une après l'autre (la base locale de développement refuse les requêtes simultanées)
  const hrefByPostId = new Map<string, string>();
  for (const { post } of results) {
    hrefByPostId.set(post.id, await forumPostHrefFor(post.topicId, post));
  }
  const postHref = (post: { id: string; topicId: string }) => hrefByPostId.get(post.id) ?? `/forum/topic/${post.topicId}`;

  // Adresse d'une page de résultats : mêmes paramètres qu'avant la refonte, encodés proprement
  const pageHref = (target: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (forumId) query.set("forumId", forumId);
    if (authorQuery) query.set("author", authorQuery);
    if (dateStr !== "all") query.set("date", dateStr);
    if (sortBy !== "relevance") query.set("sortBy", sortBy);
    query.set("page", String(target));
    return `/forum/search?${query.toString()}`;
  };

  const plural = (count: number, word: string) => `${count.toLocaleString("fr-FR")} ${word}${count > 1 ? "s" : ""}`;

  return (
    // `key` : quand l'adresse change, le formulaire repart des valeurs de la nouvelle adresse
    <SearchFormProvider
      key={`${q}|${forumId}|${authorQuery}|${dateStr}|${sortBy}`}
      initialQuery={q}
      initialForumId={forumId}
      initialAuthor={authorQuery}
      initialDate={dateStr}
      initialSortBy={sortBy}
      forums={flatForums}
    >
      <SiteLayout
        header={
          <ForumListHeader
            title="Recherche avancée"
            subtitle="Trouve un message ou un sujet parmi tous les forums."
            backHref="/forum"
            backTitle="Retour au forum"
          />
        }
        aside={<SearchFilterPanel />}
        asideLabel="Filtres de la recherche"
        asideOnMobile="hidden"
      >
        <SearchForm />

        {hasPerformedSearch && (
          <section aria-label="Résultats de la recherche" className="flex flex-col gap-4">
            {results.length === 0 ? (
              <Card>
                <EmptyState icon={<SearchX size={40} />} title={tooFast ? "Trop de recherches" : "Aucun résultat"}>
                  {tooFast ?? (
                    <>
                      Rien ne correspond à tes filtres. Élargis ta recherche : moins de mots, une période plus longue
                      ou tous les forums.
                    </>
                  )}
                </EmptyState>
              </Card>
            ) : (
              <>
                <h2 className="text-lg font-bold text-bb-text">
                  {plural(hits.length, "message")} trouvé{hits.length > 1 ? "s" : ""}
                  {groups.length !== hits.length && <span className="font-normal text-bb-text-muted"> dans {plural(groups.length, "sujet")}</span>}
                  {totalPages > 1 && <span className="font-normal text-bb-text-muted"> · page {page} sur {totalPages}</span>}
                </h2>
                <Card className="overflow-hidden">
                  <ul className="m-0 list-none p-0">
                    {results.map(({ post, count }) => {
                      const href = postHref(post);
                      const createdAt = new Date(post.createdAt);
                      const lastPostAt = new Date(post.topic.lastPostAt);
                      const hitsLabel = topicHitsLabel(count);
                      return (
                        <li key={post.id} className="flex items-start gap-3 border-b border-bb-border p-3 last:border-b-0 lg:px-4">
                          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <h3 className="flex min-w-0 flex-wrap items-start gap-1.5 text-bb-lead leading-snug font-bold text-bb-text">
                              {post.topic.tournamentId && (
                                <Trophy size={16} role="img" aria-label="Tournoi" className="mt-1 shrink-0 text-bb-accent-text" />
                              )}
                              {/* Titre et « Voir » mènent au même message. Sur téléphone, la marge intérieure porte la zone
                                  d'appui du titre à 44 pixels sans changer la mise en page */}
                              <Link
                                href={href}
                                className="inline-block min-w-0 break-words text-bb-text no-underline max-lg:-my-3 max-lg:py-3 hover:text-bb-accent-text hover:underline focus-visible:outline-2 focus-visible:outline-bb-focus"
                                dangerouslySetInnerHTML={{ __html: parseInlineBBCode(post.topic.title) }}
                              />
                              {post.topic.isArchived && <Badge variant="neutral" className="mt-0.5">Archivé</Badge>}
                            </h3>
                            <p className="m-0 text-sm text-bb-text-muted">
                              dans{" "}
                              <strong className="font-semibold text-bb-text" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(post.topic.forum.name) }} />{" "}
                              · par <strong className="font-semibold text-bb-text">{post.author.name}</strong> ·{" "}
                              <time dateTime={createdAt.toISOString()} title={createdAt.toLocaleString("fr-FR")}>
                                il y a {formatDistanceToNow(createdAt, { locale: fr })}
                              </time>
                            </p>
                            <p className="m-0 line-clamp-3 border-l-2 border-bb-border pl-3 text-[0.9375rem] leading-relaxed break-words text-bb-text">
                              {snippetFor(post).map((part, index) =>
                                part.match ? (
                                  // Surlignage neutre : le rouge est réservé à l'action principale (DESIGN.md)
                                  <mark key={index} className="rounded-sm bg-bb-surface-2 px-0.5 font-semibold text-bb-text underline decoration-bb-text-muted underline-offset-2">
                                    {part.text}
                                  </mark>
                                ) : (
                                  <span key={index}>{part.text}</span>
                                )
                              )}
                            </p>
                            <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-bb-text-muted">
                              {hitsLabel && <span className="font-semibold text-bb-text">{hitsLabel}</span>}
                              <span className="inline-flex items-center gap-1" title="Vues du sujet">
                                <Eye size={14} aria-hidden="true" /> {plural(post.topic.views || 0, "vue")}
                              </span>
                              <span>
                                Dernier message le <time dateTime={lastPostAt.toISOString()}>{lastPostAt.toLocaleDateString("fr-FR")}</time>
                              </span>
                            </p>
                          </div>
                          <Button asChild variant="secondary" size="tap" className="shrink-0 no-underline">
                            <Link href={href}>Voir</Link>
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
                <PageNav page={page} totalPages={totalPages} hrefFor={pageHref} linkComponent={Link} className="self-center" />
              </>
            )}
          </section>
        )}
      </SiteLayout>
    </SearchFormProvider>
  );
}
