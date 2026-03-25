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

  return (
    <section className={`forum-category ${!isExpanded ? 'collapsed' : ''}`}>
      <div 
        className="category-header accordion-header" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          borderColor: categoryHasNew ? '#ffd700' : 'white',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Hash size={20} style={{ color: categoryHasNew ? '#ffd700' : 'white' }} />
          <h2 style={{ color: categoryHasNew ? '#ffd700' : 'white', margin: 0 }}>
            {category.name}
          </h2>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)' }}>
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
                  <h3 style={{ color: forumHasNew ? '#ffd700' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {forum.isTournamentForum ? (
                      <Trophy size={18} style={{ color: forumHasNew ? 'var(--accent)' : 'white', opacity: forumHasNew ? 1 : 0.6 }} />
                    ) : (
                      <Folder size={18} style={{ color: forumHasNew ? '#ffd700' : '#888' }} />
                    )}
                    <span dangerouslySetInnerHTML={{ __html: parseInlineBBCode(forum.name) }} />
                    {forum.isLocked && <LockIcon size={14} style={{ color: '#ef4444', opacity: 0.8 }} />}
                    {forumHasNew && <Bell size={14} fill="#ffd700" color="#ffd700" className="animate-pulse-subtle" />}
                  </h3>
                  {forum.description && <p>{forum.description}</p>}
                </div>

                <div className="forum-stats">
                  <div><span className="stat-val">{forum._count.topics}</span> sujets</div>
                </div>

                <div className="forum-last-post">
                  {lastTopic ? (
                    <>
                      <span className="last-post-title" style={{ color: forumHasNew ? '#ffd700' : 'white' }}>{lastTopic.title}</span>
                      <span className="last-post-meta">
                        Par <strong>{lastTopic.author.name}</strong>
                        <br />
                        {new Date(lastTopic.updatedAt).toLocaleDateString("fr-FR")}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: '#444' }}>Aucun sujet</span>
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
