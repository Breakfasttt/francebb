import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { parseBBCode } from "@/lib/bbcode";
import UserAvatar from "@/common/components/UserAvatar/UserAvatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Edit3, ShieldAlert, Flag, Clock, Calendar, Tag as TagIcon, Eye } from "lucide-react";
import ArticleReactions from "@/app/articles/[id]/component/ArticleReactions";
import DeleteArticleButton from "@/app/articles/[id]/component/DeleteArticleButton";
import ModerateArticleButton from "@/app/articles/[id]/component/ModerateArticleButton";
import ReportArticleButton from "@/app/articles/[id]/component/ReportArticleButton";
import Link from "next/link";
import { isModerator } from "@/lib/roles";
import ClassicButton from "@/common/components/Button/ClassicButton";
import AdminButton from "@/common/components/Button/AdminButton";
import DangerButton from "@/common/components/Button/DangerButton";
import "./page.css";
import "./page-mobile.css";


export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const sessionUser = session?.user as any;

  // Incrémenter le compteur de vues
  // On le fait avant de récupérer l'article pour avoir le chiffre à jour (ou presque)
  await prisma.article.update({
    where: { id },
    data: { views: { increment: 1 } }
  });

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
            <div className="info-item">
              <Eye size={16} />
              <span>Vu {article.views} fois</span>
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
                <ClassicButton href={`/articles/edit/${article.id}`} icon={Edit3} fullWidth>
                  Modifier
                </ClassicButton>
                <DeleteArticleButton articleId={article.id} />
              </>
            )}
            
            {isMod && (
              <ModerateArticleButton 
                articleId={article.id} 
                isModerated={article.isModerated} 
                authorName={article.author.name || "Inconnu"} 
              />
            )}

            {sessionUser && !isAuthor && (
              <ReportArticleButton articleId={article.id} articleTitle={article.title} />
            )}
          </div>
        </aside>

        <article className="article-content-wrapper">
          {article.isModerated && (
            <div className="moderation-notice" style={{ 
              background: 'rgba(var(--danger-rgb, 194, 29, 29), 0.1)', 
              border: '1px solid var(--danger)', 
              borderRadius: '12px', 
              padding: '1.5rem', 
              marginBottom: '2rem',
              color: 'var(--danger)'
            }}>
              <div className="notice-header" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                <ShieldAlert size={20} />
                <span>Article modéré par l'équipe</span>
              </div>
              <div className="notice-body" style={{ fontSize: '1rem', fontStyle: 'italic', fontVariant: 'normal' }}>
                Raison : {article.moderationReason || "Cet article a été modéré par un membre de l'équipe."}
                {article.moderator && <div className="moderator-sig" style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>Par {article.moderator.name}</div>}
              </div>
            </div>
          )}

          {(!article.isModerated || isMod || isAuthor) ? (
            <div style={{ position: 'relative' }}>
              {article.isModerated && (
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--primary)', 
                  marginBottom: '1rem', 
                  textTransform: 'uppercase', 
                  fontWeight: 700, 
                  background: 'rgba(var(--primary-rgb), 0.1)', 
                  padding: '4px 12px', 
                  borderRadius: '4px',
                  display: 'inline-block'
                }}>
                  [Contenu original visible par vous seul et les modérateurs]
                </div>
              )}
              <div 
                className="article-body bbcode-content" 
                style={{ 
                  opacity: article.isModerated ? 0.6 : 1,
                  filter: article.isModerated ? 'grayscale(0.5)' : 'none',
                  transition: 'all 0.3s'
                }}
                dangerouslySetInnerHTML={{ __html: parseBBCode(article.content, undefined, sessionUser?.id) }} 
              />
            </div>
          ) : (
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              border: '1px dashed var(--glass-border)', 
              borderRadius: '12px', 
              padding: '4rem 2rem', 
              textAlign: 'center', 
              color: 'var(--text-muted)', 
              fontStyle: 'italic',
              fontSize: '1.1rem'
            }}>
              Le contenu de cet article a été masqué par la modération.
            </div>
          )}

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
