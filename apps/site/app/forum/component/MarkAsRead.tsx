"use client";

import { useEffect } from "react";
import { markTopicAsRead } from "@/app/forum/actions";

/**
 * Enregistre la lecture d'une page de sujet (carte 166) : la position de lecture avance jusqu'au dernier message
 * affiché (`shownPostId`), à chaque affichage de la page. Avant, une mémoire gardée dans l'onglet empêchait de
 * marquer lu un sujet déjà ouvert une fois : y revenir sans recharger la page le laissait non lu.
 * La mémoire de l'onglet ne sert plus qu'au compteur de vues d'un visiteur non connecté (carte 169) : il compte une vue
 * la première fois que l'onglet ouvre le sujet. Pour un membre, le serveur décide seul (une vue par visite).
 */

/** Vrai la première fois que cet onglet ouvre ce sujet ; la mémoire de l'onglet peut être refusée (navigation privée). */
function isFirstViewInTab(topicId: string): boolean {
  const key = `bbf-topic-viewed-${topicId}`;
  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return false;
  }
}
export default function MarkAsRead({ topicId, shownPostId }: { topicId: string; shownPostId?: string }) {
  useEffect(() => {
    markTopicAsRead(topicId, shownPostId, isFirstViewInTab(topicId));

    // Force scroll to hash if present with robust retry logic
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace("#", "");
      let attempts = 0;
      const maxAttempts = 20; // 2 seconds total

      const scrollInterval = setInterval(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "auto", block: "start" });
          clearInterval(scrollInterval);
        }
        attempts++;
        if (attempts >= maxAttempts) clearInterval(scrollInterval);
      }, 100);

      return () => clearInterval(scrollInterval);
    }
  }, [topicId, shownPostId]);

  return null;
}
