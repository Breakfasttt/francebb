"use client";

import { useTransition } from "react";
import { Lock, Unlock } from "lucide-react";
import { toggleForumLock, toggleTopicLock } from "@/app/forum/actions";
import { useRouter } from "next/navigation";
import { Button, toast } from "@bbfrance/ui";

interface LockButtonProps {
  id: string;
  type: "forum" | "topic";
  isLocked: boolean;
  /** Appelée après un changement réussi : les outils du sujet s'en servent pour fermer leur panneau (carte 168). */
  onDone?: () => void;
}

/** Bouton « Verrouiller » ou « Déverrouiller » un forum ou un sujet, dans les outils des modérateurs. */
export default function LockButton({ id, type, isLocked, onDone }: LockButtonProps) {
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
        onDone?.();
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
      }
    });
  };

  const label = isLocked ? "Déverrouiller" : "Verrouiller";

  const Icon = isLocked ? Unlock : Lock;
  return (
    <Button type="button" variant="secondary" size="tap" className="w-full justify-start" onClick={handleToggle} disabled={isPending}>
      <Icon size={18} aria-hidden="true" /> {label} {type === "forum" ? "le forum" : "le sujet"}
    </Button>
  );
}
