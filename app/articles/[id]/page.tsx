import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { parseBBCode } from "@/lib/bbcode";
import UserAvatar from "@/common/components/UserAvatar/UserAvatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Edit3, ShieldAlert, Flag, Clock, Calendar, User as UserIcon, Tag as TagIcon } from "lucide-react";
import ArticleReactions from "@/app/articles/[id]/component/ArticleReactions";
import DeleteArticleButton from "@/app/articles/[id]/component/DeleteArticleButton";
import Link from "next/link";
import { isModerator } from "@/lib/roles";
import "./page.css";

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const sessionUser = session?.user as any;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: true,
      tags: true,
      reactions: {
        include: { user: { select: { name: true } } }
      },
      moderator: { select: { name: true } }
    }
  });

  if (!article) notFound();

  const isAuthor = sessionUser?.id === article.authorId;
  const isMod = isModerator(sessionUser?.role);
  const canEdit = isAuthor || isMod;

  const createdAt = new Date(article.createdAt);
  const formattedDate = format(createdAt, "d MMMM yyyy 'à' HH:mm", { locale: fr });

  return (
    <main className="container article-detail-container">
      <PageHeader 
        title={article.title} 
        backHref="/articles" 
        backTitle="Retour aux articles"
      />

      <div className="article-layout">
        <aside className="article-sidebar">
          <div className="sidebar-section author-card">
            <UserAvatar image={article.author.image} name={article.author.name} size={80} />
            <div className="author-details">
              <span className="author-label">Écrit par</span>
              <Link href={`/profile?id=${article.authorId}`} className="author-name">
                {article.author.name}
              </Link>
              <div className="author-meta">
                <Calendar size={14} /> Membre depuis 2024
              </div>
            </div>
          </div>

          <div className="sidebar-section article-info">
            <div className="info-item">
              <Clock size={16} />
              <span>Publié le {formattedDate}</span>
            </div>
            {article.tags.length > 0 && (
              <div className="info-item tags-list">
                <TagIcon size={16} />
                <div className="tags-container">
                  {article.tags.map((tag: any) => (
                    <span key={tag.id} className="detail-tag">{tag.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="sidebar-section article-actions">
            {canEdit && (
              <>
                <Link href={`/articles/edit/${article.id}`} className="action-button edit">
                  <Edit3 size={18} /> Modifier l'article
                </Link>
                <DeleteArticleButton articleId={article.id} />
              </>
            )}
            
            {isMod && (
              <Link href={`/articles/moderate/${article.id}`} className="action-button moderate">
                <ShieldAlert size={18} /> Modérer
              </Link>
            )}

            {sessionUser && !isAuthor && (
              <button className="action-button report">
                <Flag size={18} /> Signaler l'article
              </button>
            )}
          </div>
        </aside>

        <article className="article-content-wrapper">
          {article.isModerated && (
            <div className="moderation-notice">
              <div className="notice-header">
                <ShieldAlert size={20} />
                <span>Message de la modération</span>
              </div>
              <div className="notice-body">
                {article.moderationReason || "Cet article a été modéré par un membre de l'équipe."}
                {article.moderator && <div className="moderator-sig">Par {article.moderator.name}</div>}
              </div>
            </div>
          )}

          <div 
            className="article-body bbcode-content" 
            dangerouslySetInnerHTML={{ __html: parseBBCode(article.content) }} 
          />

          <ArticleReactions 
            articleId={article.id} 
            reactions={article.reactions} 
            currentUserId={sessionUser?.id} 
          />
        </article>
      </div>
    </main>
  );
}
