/**
 * Liste des articles `/articles` (refonte, carte 095, ADR 0006).
 * En-tête compact « Articles » avec le nombre d'articles et, pour un membre connecté, le bouton « Créer un article » ;
 * puis la barre de recherche, de tri et d'affichage (`ArticleListControls`) et les articles en grille (12 par page) ou
 * en liste (20 par page). Sur ordinateur, les filtres (tags, auteur) sont dans une colonne à gauche ; sur téléphone,
 * une seule colonne, et les filtres sont rangés dans le panneau « Filtrer les articles ».
 * La recherche elle-même (paramètres `?query&tag&author&sort&view&page`, conditions, tris) n'a pas changé.
 */
import Link from "next/link";
import { Button, Card, PageNav } from "@bbfrance/ui";
import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import type { Prisma } from "@/prisma/generated-client";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import ArticleCard from "@/app/articles/component/ArticleCard";
import { ArticleFilterAside, ArticleListControls } from "@/app/articles/component/ArticleFilters";

export const dynamic = "force-dynamic";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getActiveSession();
  const params = await searchParams;

  const query = params.query as string | undefined;
  const tag = params.tag as string | undefined;
  const author = params.author as string | undefined;
  const sort = (params.sort as string) || "date_desc";
  // Liste par défaut (DESIGN.md : lignes plutôt que cartes) ; la grille reste au choix
  const view = (params.view as string) || "list";
  const page = parseInt(params.page as string) || 1;
  const limit = view === "grid" ? 12 : 20;
  const skip = (page - 1) * limit;

  // Construction de la clause WHERE. Un article masqué par la modération n'est listé que pour un modérateur, qui le
  // voit avec la mention « Modéré » ; les visiteurs et les membres ne le voient pas (carte 139).
  const where: Prisma.ArticleWhereInput = isModerator(session?.user?.role) ? {} : { isModerated: false };
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } }
    ];
  }
  if (tag) {
    const tagNames = tag.split(",");
    where.tags = {
      some: {
        name: { in: tagNames }
      }
    };
  }
  if (author) {
    where.author = { name: { contains: author, mode: "insensitive" } };
  }

  // Tri
  let orderBy: Prisma.ArticleOrderByWithRelationInput = {};
  if (sort === "date_asc") orderBy = { createdAt: "asc" };
  else if (sort === "date_desc") orderBy = { createdAt: "desc" };
  else if (sort === "title_asc") orderBy = { title: "asc" };
  else if (sort === "reactions_desc") orderBy = { reactions: { _count: "desc" } };

  const [articles, total, allTags] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          include: {
            _count: { select: { posts: true } }
          }
        },
        tags: true,
        _count: { select: { reactions: true } }
      }
    }),
    prisma.article.count({ where }),
    prisma.articleTag.findMany({
      select: { name: true },
      orderBy: { name: "asc" }
    })
  ]);

  const totalPages = Math.ceil(total / limit);
  const availableTags = allTags.map((t) => t.name);

  // Pagination : l'adresse garde la recherche, les filtres, le tri et l'affichage
  const pageHref = (target: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key !== "page" && typeof value === "string") next.set(key, value);
    }
    if (target > 1) next.set("page", String(target));
    const text = next.toString();
    return text ? `/articles?${text}` : "/articles";
  };

  // Action principale de la rubrique : en haut du panneau gauche sur ordinateur, dans l'en-tête sur téléphone
  const createHref = session ? "/articles/create" : null;
  const hasFilters = Object.entries(params).some(([key, value]) => !["page", "view", "sort"].includes(key) && !!value);
  const showControls = total > 0 || hasFilters;

  return (
    <div className="mx-auto w-full max-w-[1760px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6 xl:px-8">
      <ForumListHeader
        title="Articles"
        subtitle={`Guides, récits et analyses de la communauté · ${total} article${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}`}
        backHref="/"
        backTitle="Retour à l'accueil"
      >
        {createHref && (
          <Button asChild variant="primary" size="tap" className="lg:hidden">
            <Link href={createHref}>Écrire un article</Link>
          </Button>
        )}
      </ForumListHeader>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-6 xl:gap-8">
        <ArticleFilterAside availableTags={availableTags} createHref={createHref} showFilters={showControls} />

        <section aria-label="Articles trouvés" className="flex min-w-0 flex-col gap-4">
          {showControls && <ArticleListControls total={total} availableTags={availableTags} />}

          {articles.length > 0 ? (
            <>
              {view === "list" ? (
                <Card className="overflow-hidden">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} view="list" />
                  ))}
                </Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center">
                  <PageNav page={page} totalPages={totalPages} hrefFor={pageHref} linkComponent={Link} />
                </div>
              )}
            </>
          ) : (
            <p className="rounded-bb-lg border border-bb-border bg-bb-surface px-4 py-5 text-bb-text-muted">
              {hasFilters
                ? "Aucun article ne correspond à ces filtres. Retire un filtre pour élargir la recherche."
                : "Pas encore d'article publié. Un guide, un compte-rendu de tournoi ? Écris le premier."}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
