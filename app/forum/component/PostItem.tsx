"use client";

import { parseBBCode } from "@/lib/bbcode";
import { Mail, MapPin, Shield, Trophy, User, Eye, EyeOff, Info, ShieldAlert } from "lucide-react";
import Link from "next/link";
import React, { useState } from 'react';
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import MarkUnreadAction from "./MarkUnreadAction";
import PostActions from "./PostActions";
import SharePostButton from "./SharePostButton";
import ReportPostButton from "./ReportPostButton";

interface PostItemProps {
  post: any;
  index: number;
  topicId: string;
  currentUserId?: string;
  isUserModerator: boolean;
  quoteStatusMap: any;
  safeCurrentPage: number;
  regionLabels: Record<string, string>;
  isFirstPostAlwaysVisible?: boolean;
  isTournament?: boolean;
  tournamentId?: string;
  firstPostId?: string;
  isBlocked?: boolean;
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  index,
  topicId,
  currentUserId,
  isUserModerator,
  quoteStatusMap,
  safeCurrentPage,
  regionLabels,
  isFirstPostAlwaysVisible = false,
  isTournament = false,
  tournamentId,
  firstPostId,
  isBlocked = false
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <PremiumCard
      id={`post-${post.id}`}
      className={`forum-post-card ${isFirstPostAlwaysVisible ? 'first-post-highlight' : ''}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        minHeight: '200px',
        padding: 0,
        position: 'relative',
        borderColor: isFirstPostAlwaysVisible ? 'var(--accent)' : undefined,
        background: isFirstPostAlwaysVisible ? 'var(--admin-bg)' : undefined
      }}
    >
      {/* Sidebar Auteur */}
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(5px)',
        borderRight: '1px solid var(--glass-border)',
        borderTopLeftRadius: '16px',
        borderBottomLeftRadius: '16px',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.2rem',
        textAlign: 'center'
      }}>
        <div style={{ position: 'relative' }}>
          {post.author.image ? (
            <img src={post.author.image} alt="" style={{ width: '90px', height: '90px', borderRadius: '50%', border: '2px solid var(--glass-border)', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={45} color="var(--text-muted)" />
            </div>
          )}
          <div style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            background: 'var(--primary)',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            border: '2px solid var(--background)'
          }}></div>
        </div>

        <div style={{ width: '100%' }}>
          <div style={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '1.1rem', wordBreak: 'break-word' }}>{post.author.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', marginTop: '0.2rem', fontWeight: 600 }}>
            {post.author.role || 'COACH'}
          </div>

          {(post.author.nafNumber || post.author.region || (post.author.ligues && post.author.ligues.length > 0) || post.author.ligueCustom || post.author.equipe) && (
            <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {post.author.nafNumber && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                  <Trophy size={12} color="var(--unread-marker)" />
                  <a
                    href={`https://member.thenaf.net/index.php?module=NAF&type=coachpage&coach=${post.author.nafNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--foreground)', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}
                  >
                    {post.author.nafNumber}
                  </a>
                </div>
              )}
              {post.author.equipe && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', fontWeight: 600 }}>
                  <Trophy size={11} color="var(--accent)" /> {post.author.equipe}
                </div>
              )}
              {post.author.region && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                  <MapPin size={12} color="#3b82f6" /> {regionLabels[post.author.region] || post.author.region}
                </div>
              )}
              {((post.author.ligues && post.author.ligues.length > 0) || post.author.ligueCustom) && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', justifyContent: 'center' }}>
                  <Shield size={12} color="#22c55e" style={{ marginTop: '2px', flexShrink: 0 }} /> 
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                    {post.author.ligues?.map((ligue: any) => (
                      <Link 
                        key={ligue.id} 
                        href={`/ligue/${ligue.id}`} 
                        title={ligue.name}
                        style={{ color: 'var(--foreground)', textDecoration: 'none', fontWeight: 600, background: 'rgba(34, 197, 94, 0.1)', padding: '0 4px', borderRadius: '4px' }}
                      >
                        {ligue.acronym || ligue.name}
                      </Link>
                    ))}
                    {post.author.ligueCustom && (
                      <span style={{ fontStyle: 'italic', opacity: 0.8 }}>{post.author.ligueCustom}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1.2rem', justifyContent: 'center' }}>
            <Link
              href={`/spy/${post.author.id}`}
              className="user-badge profil"
              style={{
                padding: '0.35rem 0.8rem',
                background: 'rgba(var(--accent-rgb, 255, 215, 0), 0.08)',
                border: '1.2px solid var(--accent)',
                borderRadius: '6px',
                color: 'var(--accent)',
                fontSize: '0.65rem',
                textDecoration: 'none',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent)';
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(var(--accent-rgb, 255, 215, 0), 0.08)';
                e.currentTarget.style.color = 'var(--accent)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <User size={11} strokeWidth={2.5} /> PROFIL
            </Link>
            {post.author.id !== currentUserId && (
              <Link
                href={`/profile?tab=pm&recipientId=${post.author.id}`}
                className="user-badge mp"
                style={{
                  padding: '0.35rem 0.8rem',
                  background: 'rgba(var(--success-rgb, 34, 197, 94), 0.08)',
                  border: '1.2px solid var(--success)',
                  borderRadius: '6px',
                  color: 'var(--success)',
                  fontSize: '0.65rem',
                  textDecoration: 'none',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.05em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--success)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(var(--success-rgb, 34, 197, 94), 0.08)';
                  e.currentTarget.style.color = 'var(--success)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Mail size={11} strokeWidth={2.5} /> MP
              </Link>
            )}
          </div>
        </div>
      </div>
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.8rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span>Posté le {new Date(post.createdAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            {post.updatedAt.getTime() > post.createdAt.getTime() + 1000 && (
              <span style={{ color: 'var(--text-muted)' }}>• modifié le : {new Date(post.updatedAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontWeight: 800, color: 'var(--accent)', marginRight: '0.5rem' }}>#{index + 1}</span>
            {currentUserId && <MarkUnreadAction topicId={topicId} postId={post.id} />}
            <SharePostButton postId={post.id} topicId={topicId} page={safeCurrentPage} />
            {currentUserId && currentUserId !== post.authorId && (
              <ReportPostButton postId={post.id} authorName={post.author.name} />
            )}
          </div>
        </div>

        {/* Message Content */}
        {post.isDeleted ? (
          <div style={{
            background: 'var(--glass-border)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '1rem',
            color: 'var(--text-muted)',
            fontSize: '1rem',
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
          Ce message a été supprimé par son auteur
          </div>
        ) : isBlocked && !isRevealed ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '3rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            boxShadow: 'var(--glass-shadow)',
            position: 'relative',
            overflow: 'hidden',
            margin: '1rem 0'
          }}>
            {/* Background Icon Watermark */}
            <div style={{ position: 'absolute', top: '-15%', right: '-10%', opacity: 0.03, transform: 'rotate(-15deg)', pointerEvents: 'none' }}>
              <ShieldAlert size={180} />
            </div>

            <div style={{ 
              padding: '1.2rem', 
              borderRadius: '50%', 
              background: 'rgba(var(--primary-rgb), 0.1)', 
              color: 'var(--primary)',
              boxShadow: '0 0 30px rgba(var(--primary-rgb), 0.15)',
              border: '1px solid var(--primary-transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <EyeOff size={32} strokeWidth={2.5} />
            </div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h4 style={{ 
                margin: 0, 
                fontWeight: 800, 
                color: 'var(--foreground)', 
                fontSize: '1.2rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em' 
              }}>
                Utilisateur bloqué : {post.author.name}
              </h4>
              <p style={{ 
                margin: '0.8rem 0 0 0', 
                fontSize: '0.95rem', 
                color: 'var(--text-muted)', 
                lineHeight: 1.6,
                maxWidth: '500px'
              }}>
                Ce contenu est masqué car vous avez bloqué cet utilisateur. <br/>
                Vous pouvez le gérer dans votre <Link href="/profile" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>gestion de compte</Link>.
              </p>
            </div>

            <button 
              onClick={() => setIsRevealed(true)}
              className="widget-button secondary-btn"
              style={{ 
                marginTop: '0.5rem', 
                width: 'auto', 
                padding: '0.8rem 2.2rem',
                fontSize: '0.8rem',
                fontWeight: 900,
                letterSpacing: '0.12em',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--foreground)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                textTransform: 'uppercase',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              <Eye size={18} /> <span>Afficher le message</span>
            </button>
          </div>
        ) : (
          <>
            {post.isModerated && (
              <div style={{
                background: 'rgba(var(--danger-rgb, 194, 29, 29), 0.1)',
                border: '1px solid var(--danger)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                color: 'var(--danger)',
                fontSize: '0.95rem',
                fontWeight: 600,
                fontStyle: 'italic'
              }}>
                <Shield size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Ce message a été modéré par {post.moderator?.name || "un modérateur"}, raison : {post.moderationReason}
              </div>
            )}

            {(!post.isModerated || isUserModerator || currentUserId === post.authorId) ? (
              <div style={{ position: 'relative' }}>
                {post.isModerated && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    [Contenu original visible par vous seul et les modérateurs]
                  </div>
                )}
                {isBlocked && isRevealed && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--primary)', 
                    marginBottom: '1rem', 
                    padding: '0.4rem 0.8rem', 
                    background: 'rgba(var(--primary-rgb), 0.1)', 
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 700
                  }}>
                    <Info size={12} /> AFFICHAGE TEMPORAIRE (UTILISATEUR BLOQUÉ)
                    <button 
                      onClick={() => setIsRevealed(false)} 
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.65rem' }}
                    >
                      Masquer à nouveau
                    </button>
                  </div>
                )}
                <div
                  style={{
                    color: post.isModerated ? 'var(--text-muted)' : 'var(--text-secondary)',
                    lineHeight: '1.6',
                    fontSize: '1.1rem',
                    flex: 1,
                    wordBreak: 'break-word',
                    opacity: post.isModerated ? 0.6 : 1
                  }}
                  dangerouslySetInnerHTML={{ __html: parseBBCode(post.content, quoteStatusMap, currentUserId) }}
                />

                {post.author.signature && (
                  <div style={{
                    marginTop: '2.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--glass-border)',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    maxWidth: '100%',
                    overflow: 'hidden'
                  }} dangerouslySetInnerHTML={{ __html: parseBBCode(post.author.signature, undefined, currentUserId) }} />
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem 0' }}>
                Le contenu de ce message a été masqué par la modération.
              </div>
            )}

            <PostActions
              postId={post.id}
              authorId={post.authorId}
              authorName={post.author.name || ""}
              content={post.content}
              initialReactions={post.reactions}
              currentUserId={currentUserId}
              isModerator={isUserModerator}
              topicId={topicId}
              isModerated={post.isModerated}
              isTournament={isTournament}
              tournamentId={tournamentId}
              isFirstPost={post.id === firstPostId}
            />
          </>
        )}
      </div>
    </PremiumCard>
  );
};

export default PostItem;
