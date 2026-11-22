"use client";

import { useEffect } from "react";

interface ViewCounterProps {
  articleId: string;
}

/**
 * Composant client pour incrémenter le compteur de vues de manière intelligente.
 * Utilise le sessionStorage pour éviter d'incrémenter à chaque rafraîchissement.
 */
export default function ViewCounter({ articleId }: ViewCounterProps) {
  useEffect(() => {
    const storageKey = `viewed_article_${articleId}`;
    const hasViewed = sessionStorage.getItem(storageKey);

    if (!hasViewed) {
      // Si l'utilisateur n'a pas encore vu l'article durant cette session
      // Le serveur ne compte qu'une lecture par visite (cookie, carte 221) ; le navigateur évite seulement l'appel.
      fetch(`/api/articles/${encodeURIComponent(articleId)}/view`, { method: "POST" })
        .then((res) => {
          if (res.ok) sessionStorage.setItem(storageKey, "true");
        })
        .catch(() => {});
    }
  }, [articleId]);

  return null; // Composant invisible
}
