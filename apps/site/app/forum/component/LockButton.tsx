"use client";

import { useTransition } from "react";
import { Lock, Unlock } from "lucide-react";
import { toggleForumLock, toggleTopicLock } from "@/app/forum/actions";
import { useRouter } from "next/navigation";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import { Button, toast } from "@bbfrance/ui";
import AdminButton from "@/common/components/Button/AdminButton";

interface LockButtonProps {
  id: string;
  type: "forum" | "topic";
  isLocked: boolean;
  /** Apparence de la refonte (ADR 0006), pour les écrans déjà refaits ; sinon, le bouton historique. */
  refonte?: boolean;
}

export default function LockButton({ id, type, isLocked, refonte = false }: LockButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const res = type === "forum" ? await toggleForumLock(id) : await toggleTopicLock(id);
        if (!res.success) {
          toast.error(res.error || "Une erreur est survenue");
          return;
        }
        toast.success(isLocked ? `${type === "forum" ? "Forum" : "Sujet"} déverrouillé` : `${type === "forum" ? "Forum" : "Sujet"} verrouillé`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
      }
    });
  };

  const label = isLocked ? "Déverrouiller" : "Verrouiller";

  if (refonte) {
    const Icon = isLocked ? Unlock : Lock;
    return (
      <Button type="button" variant="secondary" size="tap" className="w-full justify-start" onClick={handleToggle} disabled={isPending}>
        <Icon size={18} aria-hidden="true" /> {label} {type === "forum" ? "le forum" : "le sujet"}
      </Button>
    );
  }

  return (
    <Tooltip text={`${label} ce ${type === "forum" ? "forum" : "sujet"}`}>
      <AdminButton
        onClick={handleToggle}
        isLoading={isPending}
        icon={isLocked ? Unlock : Lock}
        fullWidth
      >
        {label}
      </AdminButton>
    </Tooltip>
  );
}
