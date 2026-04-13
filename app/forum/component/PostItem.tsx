"use client";

import { parseBBCode } from "@/lib/bbcode";
import { Mail, MapPin, Shield, Trophy, User, Eye, EyeOff, Info, ShieldAlert, Ban } from "lucide-react";
import Link from "next/link";
import React, { useState } from 'react';
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import MarkUnreadAction from "./MarkUnreadAction";
import PostActions from "./PostActions";
import SharePostButton from "./SharePostButton";
import ReportPostButton from "./ReportPostButton";
import ClassicButton from "@/common/components/Button/ClassicButton";
import BadgeButton from "@/common/components/Button/BadgeButton";
import UserAvatar from "@/common/components/UserAvatar/UserAvatar";

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
  const isBannedAuthor = post.author.isBanned;

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
        <UserAvatar 
          image={post.author.image}
          name={post.author.name}
          postCount={post.author._count?.posts || 0}
          size={90}
          isBanned={isBannedAuthor}
          selectedRank={post.author.avatarFrame}
        />

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

          {currentUserId && (
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1.2rem', justifyContent: 'center' }}>
              <BadgeButton 
                href={`/spy/${post.author.id}`}
                icon={User}
              >
                PROFIL
              </BadgeButton>
              {post.author.id !== currentUserId && (
                <BadgeButton 
                  href={`/profile?tab=pm&recipientId=${post.author.id}`}
                  icon={Mail}
                >
                  MP
                </BadgeButton>
              )}
            </div>
          )}
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
        ) : (isBlocked || isBannedAuthor) && !isRevealed ? (
          <div style={{
            background: isBannedAuthor ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.02)',
            border: isBannedAuthor ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--glass-border)',
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
              {isBannedAuthor ? <Ban size={180} color="#ef4444" /> : <ShieldAlert size={180} />}
            </div>

            <div style={{ 
              padding: '1.2rem', 
              borderRadius: '50%', 
              background: isBannedAuthor ? 'rgba(239, 68, 68, 0.2)' : 'rgba(var(--primary-rgb), 0.1)', 
              color: isBannedAuthor ? '#ef4444' : 'var(--primary)',
              boxShadow: isBannedAuthor ? '0 0 30px rgba(239, 68, 68, 0.2)' : '0 0 30px rgba(var(--primary-rgb), 0.15)',
              border: isBannedAuthor ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--primary-transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isBannedAuthor ? <Ban size={32} strokeWidth={2.5} /> : <EyeOff size={32} strokeWidth={2.5} />}
            </div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h4 style={{ 
                margin: 0, 
                fontWeight: 800, 
                color: isBannedAuthor ? '#ef4444' : 'var(--foreground)', 
                fontSize: '1.2rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em' 
              }}>
                {isBannedAuthor ? `Coach banni : ${post.author.name}` : `Utilisateur bloqué : ${post.author.name}`}
              </h4>
              <p style={{ 
                margin: '0.8rem 0 0 0', 
                fontSize: '0.95rem', 
                color: 'var(--text-muted)', 
                lineHeight: 1.6,
                maxWidth: '500px'
              }}>
                {isBannedAuthor 
                  ? "Ce membre a été banni de la plateforme BBFrance. Ses messages sont masqués par défaut pour protéger la sérénité du forum."
                  : "Ce contenu est masqué car vous avez bloqué cet utilisateur. Vous pouvez le gérer dans votre gestion de compte."
                }
              </p>
            </div>

            <ClassicButton 
              onClick={() => setIsRevealed(true)}
              icon={Eye}
              style={{ width: 'auto', padding: '0.8rem 2.2rem' }}
            >
              Afficher le message
            </ClassicButton>
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
                {(isBlocked || isBannedAuthor) && isRevealed && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: isBannedAuthor ? '#ef4444' : 'var(--primary)', 
                    marginBottom: '1rem', 
                    padding: '0.4rem 0.8rem', 
                    background: isBannedAuthor ? 'rgba(239, 68, 68, 0.1)' : 'rgba(var(--primary-rgb), 0.1)', 
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 700
                  }}>
                    <Info size={12} /> {isBannedAuthor ? "AFFICHAGE TEMPORAIRE (COACH BANNI)" : "AFFICHAGE TEMPORAIRE (UTILISATEUR BLOQUÉ)"}
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
