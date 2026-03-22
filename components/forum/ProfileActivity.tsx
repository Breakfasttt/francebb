"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare, Clock, ArrowRight } from "lucide-react";

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
    <div className="profile-activity-list">
      {activities.map((post) => (
        <Link 
          key={post.id} 
          href={`/forum/topic/${post.topicId}#post-${post.id}`}
          className="premium-card activity-item fade-in"
        >
          <div className="activity-header">
            <div className="activity-icon">
              <MessageSquare size={16} />
            </div>
            <div className="activity-meta">
              <span className="activity-type">A posté dans</span>
              <h4 className="activity-topic">{post.topic.title}</h4>
            </div>
            <div className="activity-time">
              <Clock size={14} />
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}</span>
            </div>
          </div>
          
          <div className="activity-content-preview">
             {post.content.length > 200 ? post.content.substring(0, 200) + "..." : post.content}
          </div>

          <div className="activity-footer">
            <span className="view-link">Voir le message <ArrowRight size={14} /></span>
          </div>
        </Link>
      ))}

      <style jsx>{`
        .profile-activity-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .activity-empty {
          padding: 4rem 2rem;
          text-align: center;
          color: #666;
        }
        .activity-item {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s;
        }
        .activity-item:hover {
          transform: translateX(5px);
          border-color: var(--primary);
        }
        .activity-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .activity-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(194, 29, 29, 0.1);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .activity-meta {
          flex: 1;
        }
        .activity-type {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: #555;
          font-weight: 800;
          display: block;
        }
        .activity-topic {
          margin: 0;
          font-size: 1rem;
          color: #eee;
        }
        .activity-time {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #666;
        }
        .activity-content-preview {
          font-size: 0.9rem;
          color: #aaa;
          line-height: 1.5;
          padding-left: 2.8rem;
          border-left: 2px solid rgba(255,255,255,0.03);
        }
        .activity-footer {
          padding-left: 2.8rem;
          display: flex;
          justify-content: flex-end;
        }
        .view-link {
          font-size: 0.8rem;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .activity-item:hover .view-link {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
