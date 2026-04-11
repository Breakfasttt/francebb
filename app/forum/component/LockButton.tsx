"use client";

import { useTransition } from "react";
import { Lock, Unlock } from "lucide-react";
import { toggleForumLock, toggleTopicLock } from "@/app/forum/actions";
import { useRouter } from "next/navigation";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import toast from "react-hot-toast";
import AdminButton from "@/common/components/Button/AdminButton";

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
      <AdminButton
        onClick={handleToggle}
        isLoading={isPending}
        icon={isLocked ? Unlock : Lock}
        fullWidth
        style={{ 
          background: isLocked ? 'var(--success)' : 'var(--danger)',
          borderColor: isLocked ? 'var(--success)' : 'var(--danger)',
        }}
      >
        {label}
      </AdminButton>
    </Tooltip>
  );
}
