"use client";

import { EyeOff } from "lucide-react";
import { useTransition, useState } from "react";
import { markTopicAsUnreadFrom } from "@/app/forum/actions";
import { useRouter } from "next/navigation";

interface MarkUnreadActionProps {
  topicId: string;
  postId: string;
}

export default function MarkUnreadAction({ topicId, postId }: MarkUnreadActionProps) {
  const [isPending, startTransition] = useTransition();
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();

  const handleMarkAsUnread = () => {
    startTransition(async () => {
      try {
        await markTopicAsUnreadFrom(topicId, postId);
        router.push("/forum");
      } catch (error) {
        alert(error instanceof Error ? error.message : "Une erreur est survenue");
      }
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleMarkAsUnread}
        disabled={isPending}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="unread-post-btn"
        style={{
          background: 'none',
          border: 'none',
          padding: '4px',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          opacity: isPending ? 0.5 : 1,
          borderRadius: '4px'
        }}
      >
        <EyeOff size={16} />
      </button>

      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '125%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--footer-bg)',
          color: 'var(--header-foreground)',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.7rem',
          whiteSpace: 'nowrap',
          zIndex: 100,
          pointerEvents: 'none',
          boxShadow: 'var(--glass-shadow)',
          border: '1px solid var(--glass-border)'
        }}>
          Marquer comme non lu
        </div>
      )}

      <style jsx>{`
        .unread-post-btn:hover {
          color: var(--accent) !important;
          background: var(--glass-bg) !important;
        }
      `}</style>
    </div>
  );
}
