"use client";

import React, { useEffect, useState } from "react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import ArticleCard from "@/app/articles/component/ArticleCard";
import { FileText, Loader2 } from "lucide-react";
import Pagination from "@/common/components/Pagination/Pagination";

interface ProfileArticlesProps {
  userId: string;
  isOwnProfile?: boolean;
}

export default function ProfileArticles({ userId, isOwnProfile }: ProfileArticlesProps) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function fetchArticles(p: number = 1) {
    setLoading(true);
    try {
      // On utilise une API existante ou on en crée une petite ? 
      // Pour rester simple, on peut fetcher avec des query params sur /api/articles si on l'avait, 
      // mais ici on va faire un fetch direct à une API dédiée ou via server action si on peut l'appeler du client.
      // Utilisons l'API route qu'on va créer ou appeler /api/articles?authorId=...
      const res = await fetch(`/api/articles?authorId=${userId}&page=${p}&limit=6`);
      const data = await res.json();
      setArticles(data.articles);
      setTotalPages(data.totalPages);
      setPage(p);
    } catch (error) {
      console.error("Error fetching user articles:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchArticles();
  }, [userId]);

  if (loading && page === 1) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="profile-articles-view fade-in">
      <div className="section-header-pm" style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
        <FileText size={20} className="header-icon" color="var(--accent)" />
        <h3 className="activity-box-title" style={{ margin: 0 }}>
          {isOwnProfile ? "Mes articles publiés" : "Articles publiés"}
        </h3>
      </div>

      {articles.length === 0 ? (
        <PremiumCard style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          <FileText size={48} style={{ marginBottom: "1rem", opacity: 0.2 }} />
          <p>Aucun article publié pour le moment.</p>
        </PremiumCard>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ marginTop: "2rem" }}>
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={fetchArticles} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
