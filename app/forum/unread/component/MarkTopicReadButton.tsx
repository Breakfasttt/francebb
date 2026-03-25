"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { markTopicAsRead } from "@/app/forum/actions";
import { useRouter } from "next/navigation";
import Tooltip from "@/common/components/Tooltip/Tooltip";

interface MarkTopicReadButtonProps {
  topicId: string;
}

export default function MarkTopicReadButton({ topicId }: MarkTopicReadButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await markTopicAsRead(topicId);
        router.refresh();
      } catch (error) {
        console.error("Error marking topic as read:", error);
      }
    });
  };

  return (
    <Tooltip text="Marquer ce sujet comme lu">
      <button
        onClick={handleMarkAsRead}
        disabled={isPending}
        className="mark-topic-read-btn"
        style={{
          background: 'none',
          border: 'none',
          padding: '8px',
          color: '#666',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          opacity: isPending ? 0.5 : 1,
          borderRadius: '8px'
        }}
      >
        <Check size={18} />
      </button>
      <style jsx>{`
        .mark-topic-read-btn:hover {
          color: #22c55e !important;
          background: rgba(34, 197, 94, 0.1) !important;
        }
      `}</style>
    </Tooltip>
  );
}
