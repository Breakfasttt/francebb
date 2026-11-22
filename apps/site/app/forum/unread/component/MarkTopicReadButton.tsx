"use client";

/**
 * Bouton « Marquer comme lu » d’une ligne de la liste des non-lus (refonte, carte 085, libellé visible depuis la revue 221) :
 * 44 pixels de haut. Le sujet quitte la liste dès que la page est rafraîchie.
 */
import { useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@bbfrance/ui";
import { markTopicAsRead } from "@/app/forum/actions";
import { useRouter } from "next/navigation";

interface MarkTopicReadButtonProps {
  topicId: string;
  className?: string;
}

export default function MarkTopicReadButton({ topicId, className = "" }: MarkTopicReadButtonProps) {
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
    <Button
      type="button"
      variant="quiet"
      size="tap"
      onClick={handleMarkAsRead}
      disabled={isPending}
      className={`shrink-0 gap-1.5 text-sm text-bb-text-muted hover:text-bb-text ${className}`}
    >
      <Check size={18} aria-hidden="true" />
      {/* Libellé visible « Marquer comme lu » ; les lecteurs d'écran entendent « Marquer ce sujet comme lu » */}
      <span>
        Marquer<span className="sr-only"> ce sujet</span> comme lu
      </span>
    </Button>
  );
}
