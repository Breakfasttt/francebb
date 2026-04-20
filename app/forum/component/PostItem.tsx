"use client";

import BadgeButton from "@/common/components/Button/BadgeButton";
import ClassicButton from "@/common/components/Button/ClassicButton";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import UserAvatar from "@/common/components/UserAvatar/UserAvatar";
import { parseBBCode } from "@/lib/bbcode";
import { Ban, Eye, EyeOff, Info, Mail, MapPin, Shield, ShieldAlert, Trophy, User } from "lucide-react";
import Link from "next/link";
import React, { useState } from 'react';
import MarkUnreadAction from "./MarkUnreadAction";
import PostActions from "./PostActions";
import ReportPostButton from "./ReportPostButton";
import SharePostButton from "./SharePostButton";
import BBCodeContent from "@/common/components/BBCodeContent/BBCodeContent";

import { isModerator } from "@/lib/roles";

import Tooltip from "@/common/components/Tooltip/Tooltip";

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
        borderColor: isFirstPostAlwaysVisible ? 'var(--accent)' : undefined,
        background: isFirstPostAlwaysVisible ? 'var(--admin-bg)' : undefined,
      }}
    >
      {/* Sidebar Auteur */}
      <div className="post-author-sidebar">
        <UserAvatar
          image={post.author.image}
          name={post.author.name}
          postCount={post.author._count?.posts || 0}
          size={90}
          isBanned={isBannedAuthor}
          selectedRank={post.author.avatarFrame}
          isModerator={isModerator(post.author.role)}
        />

        <div className="post-author-info">
          <div className="author-name">{post.author.name}</div>
          <div className="author-role">
            {post.author.role || 'COACH'}
          </div>

          {(post.author.nafNumber || post.author.region || (post.author.ligues && post.author.ligues.length > 0) || post.author.ligueCustom || post.author.equipe) && (
            <div className="author-stats-container">
              {post.author.nafNumber && (
                <div className="author-stat-item naf">
                  <Trophy size={12} color="var(--unread-marker)" />
                  <a
                    href={`https://member.thenaf.net/index.php?module=NAF&type=coachpage&coach=${post.author.nafNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {post.author.nafNumber}
                  </a>
                </div>
              )}
              {post.author.equipe && (
                <div className="author-stat-item team">
                  <Trophy size={11} color="var(--accent)" /> {post.author.equipe}
                </div>
              )}
              {post.author.region && (
                <div className="author-stat-item region">
                  <MapPin size={12} color="#3b82f6" /> {regionLabels[post.author.region] || post.author.region}
                </div>
              )}
              {((post.author.ligues && post.author.ligues.length > 0) || post.author.ligueCustom) && (
                <div className="author-stat-item leagues">
                  <Shield size={12} color="#22c55e" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div className="leagues-list">
                    {post.author.ligues?.map((ligue: any) => (
                      <Tooltip key={ligue.id} text={ligue.name}>
                        <Link
                          href={`/ligue/${ligue.id}`}
                          className="league-link"
                        >
                          {ligue.acronym || ligue.name}
                        </Link>
                      </Tooltip>
                    ))}
                    {post.author.ligueCustom && (
                      <span className="custom-league">{post.author.ligueCustom}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentUserId && (
            <div className="author-actions">
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

      <div className="post-main-content">
        <div className="post-header-meta">
          <div className="post-date">
            <span>Posté le {new Date(post.createdAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            {post.updatedAt.getTime() > post.createdAt.getTime() + 1000 && (
              <span className="edit-date">• modifié le : {new Date(post.updatedAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
          <div className="post-index-actions">
            <span className="post-index">#{index + 1}</span>
            {currentUserId && <MarkUnreadAction topicId={topicId} postId={post.id} />}
            <SharePostButton postId={post.id} topicId={topicId} page={safeCurrentPage} />
            {currentUserId && currentUserId !== post.authorId && (
              <ReportPostButton postId={post.id} authorName={post.author.name} />
            )}
          </div>
        </div>

        {/* Message Content */}
        {post.isDeleted ? (
          <div className="post-deleted-placeholder">
            Ce message a été supprimé par son auteur
          </div>
        ) : (isBlocked || isBannedAuthor) && !isRevealed ? (
          <div className={`post-blocked-placeholder ${isBannedAuthor ? 'banned' : ''}`}>
            {/* Background Icon Watermark */}
            <div className="watermark">
              {isBannedAuthor ? <Ban size={180} color="#ef4444" /> : <ShieldAlert size={180} />}
            </div>

            <div className="placeholder-icon">
              {isBannedAuthor ? <Ban size={32} strokeWidth={2.5} /> : <EyeOff size={32} strokeWidth={2.5} />}
            </div>

            <div className="placeholder-text">
              <h4>
                {isBannedAuthor ? `Coach banni : ${post.author.name}` : `Utilisateur bloqué : ${post.author.name}`}
              </h4>
              <p>
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
          <div className="post-actual-content-wrapper">
            {post.isModerated && (
              <div className="post-moderation-banner">
                <Shield size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Ce message a été modéré par {post.moderator?.name || "un modérateur"}, raison : {post.moderationReason}
              </div>
            )}

            {(!post.isModerated || isUserModerator || currentUserId === post.authorId) ? (
              <div className="post-content-inner">
                {post.isModerated && (
                  <div className="moderator-view-hint">
                    [Contenu original visible par vous seul et les modérateurs]
                  </div>
                )}
                {(isBlocked || isBannedAuthor) && isRevealed && (
                  <div className={`revealed-hint ${isBannedAuthor ? 'banned' : ''}`}>
                    <Info size={12} /> {isBannedAuthor ? "AFFICHAGE TEMPORAIRE (COACH BANNI)" : "AFFICHAGE TEMPORAIRE (UTILISATEUR BLOQUÉ)"}
                    <button
                      onClick={() => setIsRevealed(false)}
                      className="rehide-btn"
                    >
                      Masquer à nouveau
                    </button>
                  </div>
                )}
                <BBCodeContent 
                  content={post.content}
                  quoteStatusMap={quoteStatusMap}
                  currentUserId={currentUserId}
                  className={post.isModerated ? 'moderated-content' : ''}
                />

                {post.author.signature && (
                  <BBCodeContent 
                    content={post.author.signature}
                    currentUserId={currentUserId}
                    className="post-signature"
                  />
                )}
              </div>
            ) : (
              <div className="post-moderated-content-placeholder">
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
          </div>
        )}
      </div>
    </PremiumCard>
  );
};

export default PostItem;
