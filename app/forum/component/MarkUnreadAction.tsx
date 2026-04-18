"use client";

import { EyeOff } from "lucide-react";
import { useTransition } from "react";
import { markTopicAsUnreadFrom } from "@/app/forum/actions";
import { useRouter } from "next/navigation";
import Tooltip from "@/common/components/Tooltip/Tooltip";

interface MarkUnreadActionProps {
  topicId: string;
  postId: string;
}

export default function MarkUnreadAction({ topicId, postId }: MarkUnreadActionProps) {
  const [isPending, startTransition] = useTransition();
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
    <>
      <Tooltip text="Marquer comme non lu">
        <button
          onClick={handleMarkAsUnread}
          disabled={isPending}
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
      </Tooltip>

      <style jsx>{`
        .unread-post-btn:hover {
          color: var(--accent) !important;
          background: var(--glass-bg) !important;
        }
      `}</style>
    </>
  );
}
