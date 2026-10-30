"use client";

/**
 * Bouton « Marquer ce sujet comme lu » d'une ligne de la liste des non-lus (refonte, carte 085) : une coche de
 * 44 pixels. Le sujet quitte la liste dès que la page est rafraîchie.
 */
import { useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@bbfrance/ui";
import { markTopicAsRead } from "@/app/forum/actions";
import { useRouter } from "next/navigation";

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
    <Button
      type="button"
      variant="quiet"
      size="tap-icon"
      onClick={handleMarkAsRead}
      disabled={isPending}
      aria-label="Marquer ce sujet comme lu"
      title="Marquer ce sujet comme lu"
      className="shrink-0 hover:text-bb-success-text"
    >
      <Check size={20} aria-hidden="true" />
    </Button>
  );
}
