import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import ArticleCard from "@/app/articles/component/ArticleCard";
import ArticleFilterSidebar from "@/app/articles/component/ArticleFilterSidebar";
import Pagination from "@/common/components/Pagination/Pagination";
import EmptyState from "@/common/components/EmptyState/EmptyState";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import "./page.css";
import "./page-mobile.css";


export const dynamic = "force-dynamic";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const params = await searchParams;

  const query = params.query as string | undefined;
  const tag = params.tag as string | undefined;
  const author = params.author as string | undefined;
  const sort = (params.sort as string) || "date_desc";
  const view = (params.view as string) || "grid";
  const page = parseInt(params.page as string) || 1;
  const limit = view === "grid" ? 12 : 20;
  const skip = (page - 1) * limit;

  // Construction de la clause WHERE
  const where: any = {};
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { content: { contains: query } }
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
    where.author = { name: { contains: author } };
  }

  // Handle Sort
  let orderBy: any = {};
  if (sort === "date_asc") orderBy = { createdAt: "asc" };
  else if (sort === "date_desc") orderBy = { createdAt: "desc" };
  else if (sort === "title_asc") orderBy = { title: "asc" };
  else if (sort === "reactions_desc") orderBy = { reactions: { _count: "desc" } };

  // Fetch data
  const [articles, total, allTags] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: true,
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

  return (
    <main className="container articles-page">
      <PageHeader 
        title="Articles & Chroniques" 
        subtitle="Découvrez les dernières news, guides et récits de la communauté."
        backHref="/" 
      />

      <div className="articles-layout">
        <ArticleFilterSidebar 
          availableTags={availableTags} 
          isAuthenticated={!!session}
        />

        <div className="articles-content">
          <div className="articles-top-actions">
            <div className="results-count">
              <FileText size={16} className="results-icon" />
              <span><strong>{total}</strong> article{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}</span>
            </div>
          </div>

          {articles.length > 0 ? (
            <>
              <div className={`articles-${view}`}>
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} view={view as "grid" | "list"} />
                ))}
              </div>

              <div className="pagination-wrapper">
                <Pagination 
                  currentPage={page} 
                  totalPages={totalPages} 
                  baseUrl="/articles"
                  queryParam="page"
                />
              </div>
            </>
          ) : (
            <EmptyState 
              icon={<FileText size={48} />}
              title="Aucun article trouvé"
              description="Essayez de modifier vos filtres ou soyez le premier à en écrire un !"
            />
          )}
        </div>
      </div>
    </main>
  );
}
