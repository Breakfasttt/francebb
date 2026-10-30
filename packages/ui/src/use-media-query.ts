"use client";

/**
 * Suit une requête média CSS (par exemple « (min-width: 1024px) »). Côté serveur et au premier rendu, la valeur est
 * `false` : le rendu part de la version téléphone (mobile d'abord), puis se corrige dès que le navigateur répond.
 */
import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Seuil unique du site (skill mobile-ux) : téléphone jusqu'à 1024 px inclus, ordinateur à partir de 1025 px. */
export const DESKTOP_QUERY = "(min-width: 1025px)";
