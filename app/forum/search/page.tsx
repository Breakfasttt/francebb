import { prisma } from "@/lib/prisma";
import SearchForm, { ForumOption } from "@/app/forum/component/SearchForm";
import Link from "next/link";
import BackButton from "@/common/components/BackButton/BackButton";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import Pagination from "@/common/components/Pagination/Pagination";
import { ArrowLeft, Eye, Trophy } from "lucide-react";
import { parseBBCode } from "@/lib/bbcode";
import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import ClassicButton from "@/common/components/Button/ClassicButton";

import "./page.css";

export const dynamic = "force-dynamic";

function getDescendantForumIds(allForums: any[], rootId: string): string[] {
  let ids = [rootId];
  const children = allForums.filter(f => f.parentForumId === rootId);
  for (const child of children) {
    ids = ids.concat(getDescendantForumIds(allForums, child.id));
  }
  return ids;
}

// Highlight search word
function highlightKeyword(text: string, query: string, currentUserId?: string) {
  if (!query) return parseBBCode(text, {}, currentUserId);
  
  const stripped = text.replace(/\[.*?\]/g, ""); // strip bbcode
  const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "gi");
  
  const matchIndex = stripped.search(new RegExp(query, "i"));
  if (matchIndex === -1) return stripped.substring(0, 200) + "...";
  
  const start = Math.max(0, matchIndex - 50);
  const end = Math.min(stripped.length, matchIndex + query.length + 50);
  let snippet = stripped.substring(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < stripped.length) snippet = snippet + "...";

  return snippet.replace(regex, `<span class="search-highlight">$1</span>`);
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await auth();
  const params = await searchParams;
  
  const q = (params.q as string) || "";
  const forumId = (params.forumId as string) || "";
  const authorQuery = (params.author as string) || "";
  const dateStr = (params.date as string) || "all";
  const sortBy = (params.sortBy as string) || "desc";
  const page = parseInt((params.page as string) || "1", 10);
  
  const POSTS_PER_PAGE = 20;
  const skip = (page - 1) * POSTS_PER_PAGE;

  // 1. Fetch Forums for the select options
  const allCategories = await prisma.category.findMany({
    orderBy: { order: "asc" }
  });
  const allForumsDB = await prisma.forum.findMany({
    orderBy: { name: "asc" }
  });

  const flatForums: ForumOption[] = [];
  allCategories.forEach(cat => {
    const rootForums = allForumsDB.filter(f => f.categoryId === cat.id && !f.parentForumId);
    
    const recurse = (forumsList: any[], level: number) => {
      forumsList.forEach(f => {
        flatForums.push({ id: f.id, name: `${cat.name} - ${f.name}`, level });
        const children = allForumsDB.filter(child => child.parentForumId === f.id);
        if (children.length > 0) recurse(children, level + 1);
      });
    };
    
    recurse(rootForums, 0);
  });

  // 2. Build Query Filters
  let whereClause: any = { 
    isDeleted: false,
    topic: { isArchived: false }
  };
  
  const isMod = isModerator(session?.user?.role);
  if (!isMod) {
    whereClause.isModerated = false;
  }

  if (q) {
    whereClause.OR = [
      { content: { contains: q } },
      { topic: { title: { contains: q } } }
    ];
  }

  if (authorQuery) {
    whereClause.author = { name: { contains: authorQuery } };
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
    
    whereClause.topic = { 
      ...whereClause.topic,
      forumId: { in: targetForumIds } 
    };
  }

  let posts: any[] = [];
  let totalMatches = 0;

  const hasPerformedSearch = !!params.q || !!params.author || !!params.forumId;
  
  if (hasPerformedSearch) {
    [posts, totalMatches] = await Promise.all([
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
    ]);
  }

  const totalPages = Math.max(1, Math.ceil(totalMatches / POSTS_PER_PAGE));

  return (
    <div className="container search-page-container fade-in">
      <PageHeader
        title="Recherche Avancée"
        subtitle="Trouvez exactement ce que vous cherchez parmi tous les forums."
        backHref="/forum"
        backTitle="Retour au forum"
      />

      <SearchForm 
        initialQuery={q} 
        initialForumId={forumId} 
        initialAuthor={authorQuery} 
        initialDate={dateStr} 
        initialSortBy={sortBy}
        forums={flatForums} 
      />

      {hasPerformedSearch && (
        <div className="search-results-section">
          <div className="search-results-header">
            <h2>Résultats pour votre recherche ({totalMatches} trouvé{totalMatches > 1 ? 's' : ''})</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
            {posts.length === 0 ? (
              <div style={{ padding: "4rem", textAlign: "center", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "16px", color: "var(--text-muted)" }}>
                Aucun résultat ne correspond à vos filtres. Essayez d'élargir votre recherche.
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="post-result-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <h3 className="post-result-title">
                        {post.topic.tournamentId && <Trophy size={18} style={{ color: "var(--accent)", opacity: 0.8 }} />}
                        <Link href={`/forum/topic/${post.topicId}#${post.id}`}>
                          Sujet: {post.topic.title}
                        </Link>
                      </h3>
                      <div className="post-result-meta">
                        <span>Dans <strong>{post.topic.forum.name}</strong></span>
                        <span>•</span>
                        <span>Par <strong className="author-name">{post.author.name}</strong></span>
                        <span>•</span>
                        <span title={new Date(post.createdAt).toLocaleString("fr-FR")}>
                          Posté il y a {formatDistanceToNow(new Date(post.createdAt), { addSuffix: false, locale: fr })}
                        </span>
                        
                        <span style={{ margin: "0 0.5rem", width: "1px", height: "12px", background: "var(--glass-border)" }}></span>
                        
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }} title="Vues du sujet">
                          <Eye size={16} /> {post.topic.views || 0}
                        </span>
                        <span>•</span>
                        <span title={new Date(post.topic.updatedAt).toLocaleString("fr-FR")}>
                          Dernier msg: {new Date(post.topic.updatedAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                    
                    <ClassicButton href={`/forum/topic/${post.topicId}#${post.id}`} size="sm">
                      Voir
                    </ClassicButton>
                  </div>
                  
                  <div className="post-result-snippet">
                    <div dangerouslySetInnerHTML={{ __html: highlightKeyword(post.content, q, session?.user?.id) }} />
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div style={{ marginTop: "3rem", display: "flex", justifyContent: "center" }}>
              <Pagination 
                currentPage={page}
                totalPages={totalPages}
                baseUrl={`/forum/search?q=${q}&forumId=${forumId}&author=${authorQuery}&date=${dateStr}&sortBy=${sortBy}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
