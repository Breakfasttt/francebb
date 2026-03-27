"use client";

import { parseInlineBBCode } from "@/lib/bbcode";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight, Clock, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import EmptyState from "@/common/components/EmptyState/EmptyState";

interface ProfileActivityProps {
  activities: any[];
  userName: string;
}

export default function ProfileActivity({ activities, userName }: ProfileActivityProps) {
  return (
    <PremiumCard className="profile-activity-card-global fade-in">
      <div className="activity-box-header">
        <MessageSquare size={20} className="header-icon" />
        <h3 className="activity-box-title">Activité récente du forum</h3>
      </div>

      <div className="profile-activity-list">
        {activities.length === 0 ? (
          <EmptyState 
            variant="ghost"
            icon={<FileText size={32} />}
            title="Aucune activité"
            description={`Aucune activité récente trouvée pour ${userName}.`}
          />
        ) : activities.map((post) => (
          <PremiumCard
            as={Link}
            key={post.id}
            href={`/forum/topic/${post.topicId}#post-${post.id}`}
            className="activity-item"
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
              <span>Voir le sujet <ArrowRight size={14} /></span>
            </div>
          </PremiumCard>
        ))}
      </div>
    </PremiumCard>
  );
}
