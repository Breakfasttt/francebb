"use client";

/**
 * Explique pourquoi la page « Modifier » ne s'est pas ouverte (paramètre d'adresse `?modification=<raison>`, posé par
 * app/forum/post/[id]/edit/page.tsx) : une notification, puis le paramètre est retiré de l'adresse, ancre du message
 * gardée. Monté sur la page d'un sujet.
 */
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@bbfrance/ui";

export type EditRefusal = "not-author" | "deleted" | "moderated" | "forum-locked" | "archived" | "locked";

const MESSAGES: Record<EditRefusal, string> = {
  "not-author": "Seul l'auteur de ce message peut le modifier.",
  deleted: "Ce message a été supprimé : il ne se modifie plus.",
  moderated: "Ce message a été masqué par la modération : il ne se modifie plus.",
  "forum-locked": "Ce forum est verrouillé : tu ne peux plus modifier tes messages.",
  archived: "Ce sujet est archivé : tu ne peux plus modifier tes messages.",
  locked: "Ce sujet est verrouillé : tu ne peux plus modifier tes messages.",
};

export default function EditRefusedNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams.get("modification");

  useEffect(() => {
    if (!reason) return;
    const message = MESSAGES[reason as EditRefusal];
    if (message) toast.error(message);
    const params = new URLSearchParams(window.location.search);
    params.delete("modification");
    const query = params.toString();
    router.replace(`${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`, { scroll: false });
  }, [reason, router]);

  return null;
}
