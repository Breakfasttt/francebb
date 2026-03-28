import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import ArticleCard from "@/app/articles/component/ArticleCard";
import ArticleFilterSidebar from "@/app/articles/component/ArticleFilterSidebar";
import Pagination from "@/common/components/Pagination/Pagination";
import EmptyState from "@/common/components/EmptyState/EmptyState";
import { Trophy, MessageSquare, MapPin, Calendar, Users, Shield, Info, BookOpen, HelpCircle, Plus, FileText } from "lucide-react";
import Link from "next/link";
import "./page.css";

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
    where.tags = { some: { name: tag } };
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
    <main className="container articles-container">
      <PageHeader 
        title="Articles & Chroniques" 
        subtitle="Découvrez les dernières news, guides et récits de la communauté."
        backHref="/" 
      />

      <div className="articles-actions-bar">
        <div className="results-count">
          <strong>{total}</strong> article{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
        </div>
        {session && (
          <Link href="/articles/create" className="create-article-btn">
            <Plus size={18} />
            Créer un article
          </Link>
        )}
      </div>

      <div className="search-layout">
        <aside className="sidebar-wrapper">
          <ArticleFilterSidebar availableTags={availableTags} />
        </aside>

        <section className="results-wrapper">
          {articles.length > 0 ? (
            <>
              {view === "grid" ? (
                <div className="articles-grid">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} view="grid" />
                  ))}
                </div>
              ) : (
                <div className="articles-list-view">
                  <div className="list-header-row">
                    <span>Article</span>
                    <span>Auteur</span>
                    <span>Tags</span>
                    <span>Date</span>
                  </div>
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} view="list" />
                  ))}
                </div>
              )}

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
        </section>
      </div>
    </main>
  );
}
