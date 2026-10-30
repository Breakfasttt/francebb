"use client";

import { useEffect, useState } from "react";

/**
 * Seuil unique entre l'affichage téléphone et l'affichage ordinateur (carte 055) :
 * jusqu'à 1024 pixels de large, le site s'affiche en mode téléphone (menu latéral global,
 * colonnes latérales déplacées dans ce menu, filtres derrière le bouton flottant).
 * Les feuilles de style ne peuvent pas lire une constante JavaScript dans un `@media` :
 * elles écrivent la même valeur, `@media (max-width: 1024px)`, et `(min-width: 1025px)` pour l'inverse.
 */
export const MOBILE_BREAKPOINT = 1024;

/** Vrai quand la fenêtre mesure au plus `breakpoint` pixels de large (le seuil commun par défaut). */
export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Fallback if window is not defined (should not happen in useEffect, but safe check)
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [breakpoint]);

  // Return false during SSR/hydration to avoid mismatch
  if (!isMounted) return false;

  return isMobile;
}
