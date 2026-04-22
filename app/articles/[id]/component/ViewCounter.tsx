"use client";

import { useEffect } from "react";
import { incrementArticleViews } from "../../actions";

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
      incrementArticleViews(articleId).then((res) => {
        if (res.success) {
          sessionStorage.setItem(storageKey, "true");
        }
      });
    }
  }, [articleId]);

  return null; // Composant invisible
}
