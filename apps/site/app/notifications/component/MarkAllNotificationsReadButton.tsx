"use client";

/**
 * Bouton « Tout marquer comme lu » de la page des notifications (carte 167). Pas de confirmation : l'action est sans
 * risque (les notifications restent dans la liste, seulement marquées lues). La page est ensuite rafraîchie, ce qui
 * remet aussi à jour la pastille de la cloche dans la barre du site.
 */
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { Button, toast } from "@bbfrance/ui";
import { markAllNotificationsRead } from "../actions";

export default function MarkAllNotificationsReadButton({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (result.success) router.refresh();
      else toast.error(result.error || "Une erreur est survenue.");
    });
  };

  return (
    <Button type="button" variant="secondary" size="tap" onClick={handleClick} disabled={isPending} className={className}>
      <CheckCheck size={18} aria-hidden="true" /> Tout marquer comme lu
    </Button>
  );
}
