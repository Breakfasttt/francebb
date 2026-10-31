/**
 * Recherche avancée du forum (refonte, carte 088) : formulaire (mots-clés et filtres), puis les messages trouvés,
 * 20 par page, un par ligne : titre du sujet (avec un trophée pour un tournoi), forum, auteur, ancienneté, extrait du
 * message avec les mots cherchés surlignés, vues du sujet, date du dernier message et bouton « Voir ».
 * La recherche elle-même (filtres, droits d'accès aux forums, calcul de la page du sujet où se trouve chaque message)
 * est la même qu'avant la refonte ; seul l'affichage change.
 */
import Link from "next/link";
import { Eye, SearchX, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button, Card, EmptyState, PageNav } from "@bbfrance/ui";
import { prisma } from "@/lib/prisma";
import { parseInlineBBCode } from "@/lib/bbcode";
import { getActiveSession } from "@/lib/authGuard";
import { getForumAccess, forumAccessWhere, topicAccessWhere } from "@/lib/forumAccess";
import { isModerator } from "@/lib/roles";
import type { Prisma } from "@/prisma/generated-client";
import SearchForm, { ForumOption } from "@/app/forum/component/SearchForm";
import ForumListHeader from "@/app/forum/component/ForumListHeader";

export const dynamic = "force-dynamic";

function getDescendantForumIds(allForums: { id: string; parentForumId: string | null }[], rootId: string): string[] {
  let ids = [rootId];
  const children = allForums.filter(f => f.parentForumId === rootId);
  for (const child of children) {
    ids = ids.concat(getDescendantForumIds(allForums, child.id));
  }
  return ids;
}

/** Nombre de caractères gardés de part et d'autre du mot cherché dans l'extrait. */
const SNIPPET_CONTEXT = 50;
/** Longueur de l'extrait quand le mot cherché n'est pas dans le texte du message (ou sans mot-clé). */
const SNIPPET_LENGTH = 200;

/**
 * Extrait d'un message autour du premier mot cherché, sans les balises BBCode, découpé en morceaux : les morceaux
 * `match` sont les mots cherchés, à surligner. Les morceaux sont affichés comme du texte (jamais comme du HTML) :
 * un message qui contiendrait des balises HTML ne peut donc rien exécuter dans la page.
 */
function buildSnippet(content: string, query: string): { text: string; match: boolean }[] {
  const stripped = content.replace(/\[.*?\]/g, "");
  const shorten = () => [{ text: stripped.length > SNIPPET_LENGTH ? `${stripped.substring(0, SNIPPET_LENGTH)}…` : stripped, match: false }];
  if (!query) return shorten();

  // Les caractères spéciaux des expressions régulières (parenthèses, points…) sont cherchés tels quels
  const escaped = query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const matchIndex = stripped.search(new RegExp(escaped, "i"));
  if (matchIndex === -1) return shorten();

  const start = Math.max(0, matchIndex - SNIPPET_CONTEXT);
  const end = Math.min(stripped.length, matchIndex + query.length + SNIPPET_CONTEXT);
  const snippet = `${start > 0 ? "…" : ""}${stripped.substring(start, end)}${end < stripped.length ? "…" : ""}`;
  // Avec des parenthèses dans l'expression, split garde les morceaux trouvés : ce sont les indices impairs
  return snippet
    .split(new RegExp(`(${escaped})`, "gi"))
    .map((text, index) => ({ text, match: index % 2 === 1 }))
    .filter((part) => part.text !== "");
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const [session, { roles }] = await Promise.all([getActiveSession(), getForumAccess()]);
  const params = await searchParams;

  const q = (params.q as string) || "";
  const forumId = (params.forumId as string) || "";
  const authorQuery = (params.author as string) || "";
  const dateStr = (params.date as string) || "all";
  const sortBy = (params.sortBy as string) || "desc";
  const page = parseInt((params.page as string) || "1", 10);

  const POSTS_PER_PAGE = 20;
  // Nombre de messages par page dans un sujet (même valeur que la page du sujet).
  const TOPIC_POSTS_PER_PAGE = 20;
  const skip = (page - 1) * POSTS_PER_PAGE;

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
  // Le filtre des sujets est un objet à part, complété plus bas par le filtre du forum
  const topicWhere: Prisma.TopicWhereInput = { isArchived: false, ...topicAccessWhere(roles) };
  const whereClause: Prisma.PostWhereInput = {
    isDeleted: false,
    topic: topicWhere
  };

  const isMod = isModerator(session?.user?.role);
  if (!isMod) {
    whereClause.isModerated = false;
  }

  if (q) {
    whereClause.OR = [
      { content: { contains: q, mode: "insensitive" } },
      { topic: { title: { contains: q, mode: "insensitive" } } }
    ];
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

  // Sans recherche lancée (ni mot-clé, ni auteur, ni forum), aucune requête n'est faite
  const searchResults = hasPerformedSearch
    ? await Promise.all([
        prisma.post.findMany({
          where: whereClause,
          orderBy: { createdAt: sortBy === "asc" ? "asc" : "desc" },
          skip,
          take: POSTS_PER_PAGE,
          include: {
            author: true,
            topic: {
              include: { forum: true }
            }
          }
        }),
        prisma.post.count({ where: whereClause })
      ])
    : null;
  const posts = searchResults?.[0] ?? [];
  const totalMatches = searchResults?.[1] ?? 0;

  const totalPages = Math.max(1, Math.ceil(totalMatches / POSTS_PER_PAGE));

  // Lien vers chaque message : on compte les messages qui le précèdent dans son sujet
  // (même ordre que la page du sujet : date de création puis identifiant) pour en
  // déduire la page du sujet qui le contient. Une requête de comptage par résultat, 20 au plus.
  const topicPageByPostId = new Map<string, number>();
  const countsBefore = await Promise.all(
    posts.map(post =>
      prisma.post.count({
        where: {
          topicId: post.topicId,
          OR: [
            { createdAt: { lt: post.createdAt } },
            { createdAt: post.createdAt, id: { lt: post.id } }
          ]
        }
      })
    )
  );
  posts.forEach((post, i) => {
    topicPageByPostId.set(post.id, Math.floor(countsBefore[i] / TOPIC_POSTS_PER_PAGE) + 1);
  });
  const postHref = (post: { id: string; topicId: string }) =>
    `/forum/topic/${post.topicId}?page=${topicPageByPostId.get(post.id) ?? 1}#post-${post.id}`;

  // Adresse d'une page de résultats : mêmes paramètres qu'avant la refonte, encodés proprement
  const pageHref = (target: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (forumId) query.set("forumId", forumId);
    if (authorQuery) query.set("author", authorQuery);
    if (dateStr !== "all") query.set("date", dateStr);
    if (sortBy !== "desc") query.set("sortBy", sortBy);
    query.set("page", String(target));
    return `/forum/search?${query.toString()}`;
  };

  return (
    <div className="mx-auto w-full max-w-[1000px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ForumListHeader
        title="Recherche avancée"
        subtitle="Trouvez un message ou un sujet parmi tous les forums."
        backHref="/forum"
        backTitle="Retour au forum"
      />

      {/* `key` : quand l'adresse change, le formulaire repart des valeurs de la nouvelle adresse */}
      <SearchForm
        key={`${q}|${forumId}|${authorQuery}|${dateStr}|${sortBy}`}
        initialQuery={q}
        initialForumId={forumId}
        initialAuthor={authorQuery}
        initialDate={dateStr}
        initialSortBy={sortBy}
        forums={flatForums}
      />

      {hasPerformedSearch && (
        <section aria-label="Résultats de la recherche" className="mt-5 flex flex-col gap-4">
          {posts.length === 0 ? (
            <Card>
              <EmptyState icon={<SearchX size={40} />} title="Aucun résultat">
                Rien ne correspond à vos filtres. Essayez d&apos;élargir votre recherche : moins de mots, une période plus longue
                ou tous les forums.
              </EmptyState>
            </Card>
          ) : (
            <>
              <h2 className="m-0 border-0 p-0 text-lg font-bold text-bb-text normal-case not-italic">
                {totalMatches} résultat{totalMatches > 1 ? "s" : ""}
                {totalPages > 1 && <span className="font-normal text-bb-text-muted"> · page {page} sur {totalPages}</span>}
              </h2>
              <Card className="overflow-hidden">
                <ul className="m-0 list-none p-0">
                  {posts.map((post) => {
                    const href = postHref(post);
                    const createdAt = new Date(post.createdAt);
                    const lastPostAt = new Date(post.topic.updatedAt);
                    return (
                      <li key={post.id} className="flex items-start gap-3 border-b border-bb-border p-3 last:border-b-0 lg:px-4">
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <h3 className="m-0 flex min-w-0 items-start gap-1.5 border-0 p-0 text-[1.0625rem] leading-snug font-bold text-bb-text normal-case not-italic">
                            {post.topic.tournamentId && (
                              <Trophy size={16} role="img" aria-label="Tournoi" className="mt-1 shrink-0 text-bb-accent-text" />
                            )}
                            {/* Sur téléphone, la marge intérieure porte la zone d'appui du titre à 44 pixels sans changer la mise en page */}
                            <Link
                              href={href}
                              className="inline-block min-w-0 break-words text-bb-text no-underline max-lg:-my-3 max-lg:py-3 hover:text-bb-accent-text hover:underline focus-visible:outline-2 focus-visible:outline-bb-focus"
                              dangerouslySetInnerHTML={{ __html: parseInlineBBCode(post.topic.title) }}
                            />
                          </h3>
                          <p className="m-0 text-[0.8125rem] text-bb-text-muted">
                            dans{" "}
                            <strong className="font-semibold text-bb-text" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(post.topic.forum.name) }} />{" "}
                            · par <strong className="font-semibold text-bb-text">{post.author.name}</strong> ·{" "}
                            <time dateTime={createdAt.toISOString()} title={createdAt.toLocaleString("fr-FR")}>
                              il y a {formatDistanceToNow(createdAt, { locale: fr })}
                            </time>
                          </p>
                          <p className="m-0 line-clamp-3 border-l-2 border-bb-border pl-3 text-[0.9375rem] leading-relaxed break-words text-bb-text">
                            {buildSnippet(post.content, q).map((part, index) =>
                              part.match ? (
                                <mark key={index} className="rounded-sm bg-bb-accent-soft px-0.5 font-semibold text-bb-accent-text">
                                  {part.text}
                                </mark>
                              ) : (
                                <span key={index}>{part.text}</span>
                              )
                            )}
                          </p>
                          <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-bb-text-muted">
                            <span className="inline-flex items-center gap-1" title="Vues du sujet">
                              <Eye size={14} aria-hidden="true" /> {post.topic.views || 0} vue{(post.topic.views || 0) > 1 ? "s" : ""}
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
    </div>
  );
}
