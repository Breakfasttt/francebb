"use client";

import { useTransition } from "react";
import { Lock, Unlock } from "lucide-react";
import { toggleForumLock, toggleTopicLock } from "@/app/forum/actions";
import { useRouter } from "next/navigation";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import toast from "react-hot-toast";

interface LockButtonProps {
  id: string;
  type: "forum" | "topic";
  isLocked: boolean;
}

export default function LockButton({ id, type, isLocked }: LockButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        if (type === "forum") {
          await toggleForumLock(id);
        } else {
          await toggleTopicLock(id);
        }
        toast.success(isLocked ? `${type === "forum" ? "Forum" : "Sujet"} déverrouillé` : `${type === "forum" ? "Forum" : "Sujet"} verrouillé`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
      }
    });
  };

  const label = isLocked ? "Déverrouiller" : "Verrouiller";

  return (
    <Tooltip text={`${label} ce ${type === "forum" ? "forum" : "sujet"}`}>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="lock-toggle-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.7rem',
          width: '100%',
          padding: '0.8rem',
          background: 'var(--glass-bg)',
          color: isLocked ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${isLocked ? 'var(--success)' : 'var(--danger)'}`,
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '0.9rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          opacity: isPending ? 0.7 : 1
        }}
      >
        {isLocked ? <Unlock size={18} /> : <Lock size={18} />}
        <span>{label}</span>
      </button>
      <style jsx>{`
        .lock-toggle-btn:hover {
          background: var(--glass-bg) !important;
          border-color: ${isLocked ? 'var(--success)' : 'var(--danger)'} !important;
          filter: brightness(1.2);
          transform: translateY(-1px);
        }
      `}</style>
    </Tooltip>
  );
}
