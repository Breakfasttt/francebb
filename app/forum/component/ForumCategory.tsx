"use client";

import { useState } from "react";
import { Hash, Folder, Bell, ChevronDown, ChevronUp, Trophy, Lock as LockIcon } from "lucide-react";
import Link from "next/link";
import { parseInlineBBCode } from "@/lib/bbcode";

interface CategoryProps {
  category: any;
  categoryHasNew: boolean;
}

export default function ForumCategory({ category, categoryHasNew }: CategoryProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className={`forum-category ${!isExpanded ? 'collapsed' : ''}`}>
      <div 
        className="category-header accordion-header" 
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          borderColor: categoryHasNew ? 'var(--unread-marker)' : 'var(--glass-border)',
          cursor: 'pointer',
          background: isHovered ? 'var(--category-hover-bg)' : 'var(--category-header-bg)',
          padding: '1.2rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Hash size={20} style={{ color: categoryHasNew ? 'var(--unread-marker)' : 'var(--header-foreground)' }} />
          <h2 style={{ 
            color: 'var(--header-foreground)', 
            margin: 0,
            textShadow: categoryHasNew ? '0 0 10px rgba(var(--unread-marker-rgb, 194, 29, 29), 0.5)' : 'none'
          }}>
            {category.name}
          </h2>
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="forums-list animate-fade-in">
          {category.forums.map((forum: any) => {
            const lastTopic = forum.topics[0];
            const directUnread = forum.topics.some((topic: any) => {
              const view = topic.topicViews[0];
              return !view || topic.updatedAt > view.lastViewedAt;
            });
            const subUnread = forum.subForums.some((sub: any) =>
              sub.topics.some((topic: any) => {
                const view = topic.topicViews[0];
                return !view || topic.updatedAt > view.lastViewedAt;
              })
            );
            const forumHasNew = directUnread || subUnread;

            return (
              <Link key={forum.id} href={`/forum/${forum.id}`} className={`forum-item ${forumHasNew ? 'has-new' : ''}`}>
                <div className="forum-info">
                  <h3 style={{ color: forumHasNew ? 'var(--unread-marker)' : 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {forum.isTournamentForum ? (
                      <Trophy size={18} style={{ color: forumHasNew ? 'var(--accent)' : 'var(--foreground)', opacity: forumHasNew ? 1 : 0.6 }} />
                    ) : (
                      <Folder size={18} style={{ color: forumHasNew ? 'var(--unread-marker)' : 'var(--text-secondary)' }} />
                    )}
                    <span dangerouslySetInnerHTML={{ __html: parseInlineBBCode(forum.name) }} />
                    {forum.isLocked && <LockIcon size={14} style={{ color: 'var(--primary)', opacity: 0.8 }} />}
                    {forumHasNew && <Bell size={14} fill="var(--unread-marker)" color="var(--unread-marker)" className="animate-pulse-subtle" />}
                  </h3>
                  {forum.description && <p>{forum.description}</p>}
                </div>

                <div className="forum-stats">
                  <div><span className="stat-val">{forum._count.topics}</span> sujets</div>
                </div>

                <div className="forum-last-post">
                  {lastTopic ? (
                    <>
                      <span className="last-post-title" style={{ 
                        color: forumHasNew ? 'var(--unread-marker)' : 'var(--foreground)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}>
                        {lastTopic.tournamentId && <Trophy size={12} style={{ color: forumHasNew ? 'var(--accent)' : 'var(--foreground)', opacity: forumHasNew ? 1 : 0.6 }} />}
                        {lastTopic.title}
                      </span>
                      <span className="last-post-meta">
                        Par <strong>{lastTopic.author.name}</strong>
                        <br />
                        {new Date(lastTopic.updatedAt).toLocaleDateString("fr-FR")}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Aucun sujet</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
