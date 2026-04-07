/**
 * Composant de carte d'article
 * Utilisé dans les listings (grille ou liste)
 */
import React from "react";
import Link from "next/link";
import { Clock, User, MessageCircle, AlertTriangle, Eye } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import UserAvatar from "@/common/components/UserAvatar/UserAvatar";
import { stripBBCode } from "@/lib/bbcode";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import "./ArticleCard.css";

interface ArticleCardProps {
  article: any;
  view?: "grid" | "list";
}

export default function ArticleCard({ article, view = "grid" }: ArticleCardProps) {
  const snippet = stripBBCode(article.content).substring(0, 160) + "...";
  const dateStr = formatDistanceToNow(new Date(article.createdAt), { addSuffix: true, locale: fr });

  if (view === "list") {
    return (
      <Link href={`/articles/${article.id}`} className="article-list-item">
        <div className="list-col-title-snippet">
          <div className="list-article-title">{article.title}</div>
          <div className="list-article-snippet">{snippet}</div>
        </div>
        
        <div className="list-col-author">
          <UserAvatar image={article.author.image} name={article.author.name} size={24} />
          <span className="article-author-name">{article.author.name}</span>
        </div>

        <div className="list-col-tags">
          {article.tags.slice(0, 2).map((tag: any) => (
            <span key={tag.id} className="article-tag">{tag.name}</span>
          ))}
          {article.tags.length > 2 && <span className="article-tag">+{article.tags.length - 2}</span>}
        </div>

        <div className="list-col-date">
          <div className="article-view-count" title="Nombre de vues">
            <Eye size={12} /> {article.views || 0}
          </div>
          {dateStr}
        </div>
      </Link>
    );
  }

  return (
    <PremiumCard 
      as={Link} 
      href={`/articles/${article.id}`} 
      className={`article-card clickable ${article.isModerated ? "moderated" : ""}`}
      hoverEffect={true}
    >
      <div className="article-header">
        <div className="article-badges">
          {article.tags.slice(0, 3).map((tag: any) => (
            <span key={tag.id} className="article-tag">{tag.name}</span>
          ))}
        </div>
        {article.isModerated && (
          <div className="moderation-icon" title="Cet article a été modéré">
            <AlertTriangle size={16} color="var(--warning)" />
          </div>
        )}
      </div>

      <h3 className="article-title">{article.title}</h3>
      
      <p className="article-snippet">{snippet}</p>

      <div className="article-footer">
        <div className="article-author-info">
          <UserAvatar image={article.author.image} name={article.author.name} size={32} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="article-author-name">{article.author.name}</span>
            <span className="article-date">
              <Clock size={12} /> {dateStr}
            </span>
          </div>
        </div>

        <div className="article-metrics">
          <div className="article-metric" title="Nombre de vues">
            <Eye size={14} />
            <span>{article.views || 0}</span>
          </div>
          {(article._count?.reactions > 0 || (article.reactions && article.reactions.length > 0)) && (
            <div className="article-metric" title="Nombre de réactions">
              <MessageCircle size={14} />
              <span>{article._count?.reactions || article.reactions?.length || 0}</span>
            </div>
          )}
        </div>
      </div>
    </PremiumCard>
  );
}
