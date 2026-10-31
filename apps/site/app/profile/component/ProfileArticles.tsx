"use client";

/**
 * Onglet « Articles » d'un profil (refonte, carte 092), sur `/profile` (« Mes articles ») et `/spy/[id]` : les
 * articles publiés par le membre, 6 par page, avec la carte d'article de la page `/articles`. Les données viennent
 * de l'adresse `/api/articles?authorId=…` (inchangée), qui cache les articles masqués par la modération sauf à leur
 * auteur et aux modérateurs.
 */
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Card, EmptyState, PageNav, Skeleton } from "@bbfrance/ui";
import ArticleCard from "@/app/articles/component/ArticleCard";

interface ProfileArticlesProps {
  userId: string;
  isOwnProfile?: boolean;
}

type ArticlesPage = { key: string; articles: Parameters<typeof ArticleCard>[0]["article"][]; totalPages: number };

export default function ProfileArticles({ userId, isOwnProfile }: ProfileArticlesProps) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ArticlesPage | null>(null);
  const key = `${userId}:${page}`;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/articles?authorId=${userId}&page=${page}&limit=6`)
      .then((res) => res.json())
      .then((result) => {
        if (!cancelled) setData({ key: `${userId}:${page}`, articles: result.articles ?? [], totalPages: result.totalPages ?? 1 });
      })
      .catch((error) => console.error("Error fetching user articles:", error));
    return () => {
      cancelled = true;
    };
  }, [userId, page]);

  const loading = !data || data.key !== key;

  return (
    <section aria-label={isOwnProfile ? "Mes articles publiés" : "Articles publiés"} className="flex flex-col items-center gap-4">
      <h2 className="m-0 flex w-full items-center gap-2 border-0 p-0 text-lg font-bold tracking-normal text-bb-text normal-case not-italic">
        <FileText size={18} className="text-bb-text-muted" aria-hidden="true" />
        {isOwnProfile ? "Mes articles publiés" : "Articles publiés"}
      </h2>

      {loading ? (
        <div className="grid w-full gap-4 md:grid-cols-2">
          {[0, 1].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : data.articles.length === 0 ? (
        <Card className="w-full">
          <EmptyState icon={<FileText size={32} />} title="Aucun article publié pour le moment." />
        </Card>
      ) : (
        <div className="grid w-full gap-4 md:grid-cols-2">
          {data.articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {data && <PageNav page={page} totalPages={data.totalPages} onPageChange={setPage} />}
    </section>
  );
}
