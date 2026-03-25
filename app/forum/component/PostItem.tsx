import React from 'react';
import { User, Trophy, MapPin, Shield, Mail } from "lucide-react";
import Link from "next/link";
import { parseBBCode } from "@/lib/bbcode";
import PostActions from "./PostActions";
import MarkUnreadAction from "./MarkUnreadAction";
import SharePostButton from "./SharePostButton";

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
  isFirstPostAlwaysVisible = false
}) => {
  return (
    <div 
      id={`post-${post.id}`} 
      className={`premium-card forum-post-card ${isFirstPostAlwaysVisible ? 'first-post-highlight' : ''}`} 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: '200px 1fr', 
        minHeight: '200px', 
        padding: 0, 
        overflow: 'hidden',
        border: isFirstPostAlwaysVisible ? '1px solid rgba(255, 215, 0, 0.3)' : undefined,
        background: isFirstPostAlwaysVisible ? 'rgba(255, 215, 0, 0.02)' : undefined
      }}
    >
      {/* Sidebar Auteur */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid var(--glass-border)',
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
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={45} color="#888" />
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
            border: '2px solid #1a1a20'
          }}></div>
        </div>
        
        <div style={{ width: '100%' }}>
          <div style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem', wordBreak: 'break-word' }}>{post.author.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', marginTop: '0.2rem', fontWeight: 600 }}>
            {post.author.role || 'COACH'}
          </div>

          {(post.author.nafNumber || post.author.region || post.author.league) && (
            <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {post.author.nafNumber && (
                <div style={{ fontSize: '0.7rem', color: '#999', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                  <Trophy size={12} color="#eab308" /> 
                  <a 
                    href={`https://member.thenaf.net/index.php?module=NAF&type=coachpage&coach=${post.author.nafNumber}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: '#eee', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}
                  >
                    {post.author.nafNumber}
                  </a>
                </div>
              )}
              {post.author.region && (
                <div style={{ fontSize: '0.7rem', color: '#999', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                  <MapPin size={12} color="#3b82f6" /> {regionLabels[post.author.region] || post.author.region}
                </div>
              )}
              {post.author.league && (
                <div style={{ fontSize: '0.7rem', color: '#999', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                  <Shield size={12} color="#22c55e" /> {post.author.league}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1.2rem', justifyContent: 'center' }}>
            <Link 
              href={`/spy/${post.author.id}`}
              style={{ 
                padding: '0.35rem 0.6rem', 
                background: 'rgba(59, 130, 246, 0.1)', 
                border: '1px solid rgba(59, 130, 246, 0.2)', 
                borderRadius: '4px', 
                color: '#60a5fa', 
                fontSize: '0.65rem', 
                textDecoration: 'none',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <User size={10} /> PROFIL
            </Link>
            {post.author.id !== currentUserId && (
              <Link 
                href={`/profile?tab=pm&recipientId=${post.author.id}`}
                style={{ 
                  padding: '0.35rem 0.6rem', 
                  background: 'rgba(34, 197, 94, 0.1)', 
                  border: '1px solid rgba(34, 197, 94, 0.2)', 
                  borderRadius: '4px', 
                  color: '#4ade80', 
                  fontSize: '0.65rem', 
                  textDecoration: 'none',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <Mail size={10} /> MP
              </Link>
            )}
          </div>
        </div>
      </div>
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#666' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span>Posté le {new Date(post.createdAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            {post.updatedAt.getTime() > post.createdAt.getTime() + 1000 && (
              <span style={{ color: '#555' }}>• modifié le : {new Date(post.updatedAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>#{index + 1}</span>
              {currentUserId && <MarkUnreadAction topicId={topicId} postId={post.id} />}
              <SharePostButton postId={post.id} topicId={topicId} page={safeCurrentPage} />
            </div>
        </div>

        {/* Message Content */}
        {post.isDeleted ? (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid var(--glass-border)', 
            borderRadius: '12px', 
            padding: '2rem', 
            marginBottom: '1rem',
            color: '#888',
            fontSize: '1rem',
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            Ce message a été supprimé par son auteur
          </div>
        ) : (
          <>
            {post.isModerated && (
              <div style={{ 
                background: 'rgba(194, 29, 29, 0.1)', 
                border: '1px solid rgba(194, 29, 29, 0.3)', 
                borderRadius: '8px', 
                padding: '1rem', 
                marginBottom: '1.5rem',
                color: '#ff8888',
                fontSize: '0.95rem',
                fontStyle: 'italic'
              }}>
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
                <div 
                  style={{ 
                    color: post.isModerated ? '#888' : '#ddd', 
                    lineHeight: '1.6', 
                    fontSize: '1.1rem', 
                    flex: 1, 
                    wordBreak: 'break-word',
                    opacity: post.isModerated ? 0.6 : 1
                  }}
                  dangerouslySetInnerHTML={{ __html: parseBBCode(post.content, quoteStatusMap) }}
                />

                {post.author.signature && (
                  <div style={{ 
                    marginTop: '2.5rem', 
                    paddingTop: '1rem', 
                    borderTop: '1px solid rgba(255,255,255,0.05)', 
                    fontSize: '0.85rem', 
                    color: '#777',
                    fontStyle: 'italic',
                    maxWidth: '100%',
                    overflow: 'hidden'
                  }} dangerouslySetInnerHTML={{ __html: parseBBCode(post.author.signature) }} />
                )}
              </div>
            ) : (
              <div style={{ color: '#666', fontStyle: 'italic', padding: '1rem 0' }}>
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
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PostItem;
