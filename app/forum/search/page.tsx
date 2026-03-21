import { prisma } from "@/lib/prisma";
import SearchForm, { ForumOption } from "@/components/forum/SearchForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { parseBBCode } from "@/lib/bbcode";
import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

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
function highlightKeyword(text: string, query: string) {
  if (!query) return parseBBCode(text, {});
  
  // Basic highlight: just parse BBCode then wrap the keyword found in the string in a span
  const html = parseBBCode(text, {});
  // this is a simple string replace for visual purpose, real implementation requires parsing text nodes to avoid breaking HTML.
  // We'll use a regex that matches outside HTML tags if possible, or just parse BBCode and trust simple queries.
  // Considering this is a simple forum, we'll strip HTML tags, find the snippet, and highlight it.
  
  const stripped = text.replace(/\[.*?\]/g, ""); // strip bbcode
  const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "gi");
  
  // Extract a snippet around the first match
  const matchIndex = stripped.search(new RegExp(query, "i"));
  if (matchIndex === -1) return stripped.substring(0, 200) + "...";
  
  const start = Math.max(0, matchIndex - 50);
  const end = Math.min(stripped.length, matchIndex + query.length + 50);
  let snippet = stripped.substring(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < stripped.length) snippet = snippet + "...";

  return snippet.replace(regex, `<span style="background: rgba(255, 200, 0, 0.3); color: #fff; padding: 0 2px; border-radius: 2px;">$1</span>`);
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
  let whereClause: any = { isDeleted: false };
  
  // Modérateur or not
  const isMod = isModerator(session?.user?.role);
  if (!isMod) {
    whereClause.isModerated = false; // Hide moderated posts for normal users in search
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
    // Need to find all descendant forums
    const allForumsFlat = await prisma.forum.findMany({ select: { id: true, parentForumId: true } });
    const targetForumIds = getDescendantForumIds(allForumsFlat, forumId);
    
    whereClause.topic = { forumId: { in: targetForumIds } };
  }

  let posts: any[] = [];
  let totalMatches = 0;

  // Execute Search Only if there's a param or query
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
    <div className="forum-container fade-in">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href="/forum" className="back-button" title="Retour au forum" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 className="forum-title" style={{ margin: 0 }}>Recherche Avancée</h1>
          <p className="forum-description" style={{ marginTop: "0.5rem" }}>Trouvez exactement ce que vous cherchez parmi tous les forums.</p>
        </div>
      </header>

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
          <h2>Résultats pour votre recherche ({totalMatches} trouvé{totalMatches > 1 ? 's' : ''})</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
            {posts.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "12px", color: "#888" }}>
                Aucun résultat ne correspond à vos filtres. Essayez d'élargir votre recherche.
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }} className="hover:border-primary/50">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                        <Link href={`/forum/topic/${post.topicId}#${post.id}`} style={{ color: "white", textDecoration: "none" }} className="hover:text-primary transition-colors">
                          Sujet: {post.topic.title}
                        </Link>
                      </h3>
                      <div style={{ fontSize: "0.85rem", color: "#aaa", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>Dans <strong style={{color:"#ccc"}}>{post.topic.forum.name}</strong></span>
                        <span>•</span>
                        <span>Par <strong style={{color:"var(--primary)"}}>{post.author.name}</strong></span>
                        <span>•</span>
                        <span title={new Date(post.createdAt).toLocaleString("fr-FR")}>
                          Il y a {formatDistanceToNow(new Date(post.createdAt), { addSuffix: false, locale: fr })}
                        </span>
                      </div>
                    </div>
                    
                    <Link href={`/forum/topic/${post.topicId}#${post.id}`} className="bb-button primary" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                      Voir le message
                    </Link>
                  </div>
                  
                  <div style={{ 
                    padding: "1rem", 
                    background: "rgba(0,0,0,0.2)", 
                    borderRadius: "8px",
                    color: "#ddd",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                    borderLeft: "3px solid var(--primary)"
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: highlightKeyword(post.content, q) }} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination" style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "0.5rem" }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/forum/search?q=${q}&forumId=${forumId}&author=${authorQuery}&date=${dateStr}&sortBy=${sortBy}&page=${i + 1}`}
                  className={`page-link ${page === i + 1 ? "active" : ""}`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
