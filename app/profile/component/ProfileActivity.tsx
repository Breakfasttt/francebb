"use client";

import { parseInlineBBCode } from "@/lib/bbcode";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight, Clock, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";

interface ProfileActivityProps {
  activities: any[];
  userName: string;
}

export default function ProfileActivity({ activities, userName }: ProfileActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="premium-card activity-empty">
        <p>Aucune activité récente trouvée pour {userName}.</p>
      </div>
    );
  }

  return (
    <div className="premium-card profile-activity-card-global fade-in">
      <div className="activity-box-header">
        <MessageSquare size={20} className="header-icon" />
        <h3 className="activity-box-title">Activité récente du forum</h3>
      </div>

      <div className="profile-activity-list">
        {activities.map((post) => (
          <Link
            key={post.id}
            href={`/forum/topic/${post.topicId}#post-${post.id}`}
            className="premium-card activity-item"
          >
            <div className="activity-header">
              <div className="activity-icon-container">
                <FileText size={16} />
              </div>
              <div className="activity-meta">
                <div className="activity-type">A posté dans</div>
                <h4 className="activity-topic" dangerouslySetInnerHTML={{ __html: parseInlineBBCode(post.topic.title) }} />
              </div>
              <div className="activity-time">
                <Clock size={12} />
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}</span>
              </div>
            </div>

            <div className="activity-content-preview">
              {post.content.length > 200 ? post.content.substring(0, 200) + "..." : post.content}
            </div>

            <div className="view-more">
              <span>Voir le message <ArrowRight size={14} /></span>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .profile-activity-card-global {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .activity-box-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--glass-border);
        }
        .header-icon {
          color: var(--primary);
        }
        .activity-box-title {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 800;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .profile-activity-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .activity-item {
          padding: 2.2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          text-decoration: none;
          color: inherit;
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.25s ease;
        }
        .activity-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--primary);
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }
        .activity-header {
          display: flex;
          align-items: center; /* Centering icon with text block */
          gap: 1.8rem;
          padding: 0.8rem 1.25rem 0; /* Detaching from top and left borders */
        }
        .activity-icon-container {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(255, 255, 255, 0.03);
          color: #888;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .activity-meta {
          flex: 1;
        }
        .activity-type {
          font-size: 0.70rem;
          text-transform: uppercase;
          color: #666;
          font-weight: 800;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }
        .activity-topic {
          margin: 0;
          font-size: 1.1rem;
          color: #fff;
          font-weight: 600;
          line-height: 1.4;
        }
        .activity-time {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #555;
          white-space: nowrap;
          margin-right: 1.5rem; /* Detaching from right border */
        }
        .activity-content-preview {
          font-size: 0.95rem;
          color: #bbb;
          line-height: 1.7;
          padding-left: 5rem; /* Aligning with the meta section start */
          padding-right: 2rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-style: italic;
          opacity: 0.8;
        }
        .view-more {
          display: flex;
          justify-content: flex-end;
          padding-left: 3.75rem;
        }
        .view-more span {
          font-size: 0.8rem;
          color: var(--primary);
          font-weight: 800;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0;
          transition: all 0.2s;
        }
        .activity-item:hover .view-more span {
          opacity: 1;
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
