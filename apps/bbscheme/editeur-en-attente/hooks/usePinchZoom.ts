"use client";

import { RefObject, useEffect, useLayoutEffect, useRef } from "react";

interface PinchZoomOptions {
  /** Valeur de zoom actuelle (la même que celle du curseur de zoom). */
  zoom: number;
  /** Bornes du zoom, identiques à celles du curseur. */
  min: number;
  max: number;
  /** Appelée avec la nouvelle valeur pendant le geste. */
  onZoomChange: (zoom: number) => void;
  /** Faux pour ignorer le geste (par exemple en lecture seule). */
  enabled?: boolean;
}

/** Point de l'écran à garder sous les doigts : sa position dans le contenu, en fraction de la largeur et de la hauteur. */
interface Anchor {
  fractionX: number;
  fractionY: number;
  screenX: number;
  screenY: number;
}

const distance = (a: Touch, b: Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

/**
 * Zoom « au pincement » : écarter deux doigts sur l'élément agrandit, les rapprocher réduit.
 *
 * L'élément visé est un cadre qui défile (`overflow: auto`) et dont le premier enfant est le contenu agrandi.
 * Le hook écoute les événements tactiles natifs du navigateur. Avec deux doigts posés, il annule le
 * comportement par défaut (`preventDefault`) pour que le navigateur ne zoome pas toute la page, puis
 * fait défiler le cadre pour garder le point situé entre les deux doigts au même endroit de l'écran.
 * Avec un seul doigt, il ne fait rien : le défilement et les clics restent ceux de la page.
 *
 * Pendant le geste, la classe `pinching` est posée sur l'élément, pour couper les animations de taille
 * qui retarderaient l'affichage.
 */
export function usePinchZoom(ref: RefObject<HTMLElement | null>, { zoom, min, max, onZoomChange, enabled = true }: PinchZoomOptions) {
  // Les écouteurs sont posés une seule fois : ils lisent les dernières valeurs dans ces références.
  const latest = useRef({ zoom, min, max, onZoomChange, enabled });
  useLayoutEffect(() => {
    latest.current = { zoom, min, max, onZoomChange, enabled };
  });

  const pendingAnchor = useRef<Anchor | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let startDistance = 0;
    let startZoom = 1;
    let pinching = false;

    const stop = () => {
      pinching = false;
      element.classList.remove("pinching");
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!latest.current.enabled || e.touches.length !== 2) return;
      const gap = distance(e.touches[0], e.touches[1]);
      if (gap === 0) return;
      pinching = true;
      startDistance = gap;
      startZoom = latest.current.zoom;
      element.classList.add("pinching");
      e.preventDefault();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pinching || e.touches.length !== 2) return;
      e.preventDefault();
      const { min: low, max: high, zoom: current, onZoomChange: change } = latest.current;
      const next = Math.min(high, Math.max(low, startZoom * (distance(e.touches[0], e.touches[1]) / startDistance)));
      if (Math.abs(next - current) < 0.001) return;

      const content = element.firstElementChild as HTMLElement | null;
      if (content) {
        const rect = content.getBoundingClientRect();
        const screenX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const screenY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        pendingAnchor.current = {
          fractionX: rect.width ? (screenX - rect.left) / rect.width : 0.5,
          fractionY: rect.height ? (screenY - rect.top) / rect.height : 0.5,
          screenX,
          screenY,
        };
      }
      change(next);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (pinching && e.touches.length < 2) stop();
    };

    // Safari sur iPhone envoie ses propres événements de zoom : on les bloque aussi sur le terrain.
    const blockGesture = (e: Event) => {
      if (latest.current.enabled) e.preventDefault();
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: false });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd);
    element.addEventListener("touchcancel", handleTouchEnd);
    element.addEventListener("gesturestart", blockGesture);
    element.addEventListener("gesturechange", blockGesture);
    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchEnd);
      element.removeEventListener("gesturestart", blockGesture);
      element.removeEventListener("gesturechange", blockGesture);
      element.classList.remove("pinching");
    };
  }, [ref]);

  // Une fois le nouveau zoom affiché, on fait défiler le cadre pour ramener sous les doigts le point qui y était.
  useLayoutEffect(() => {
    const anchor = pendingAnchor.current;
    const element = ref.current;
    const content = element?.firstElementChild as HTMLElement | null | undefined;
    if (!anchor || !element || !content) return;
    pendingAnchor.current = null;
    const rect = content.getBoundingClientRect();
    element.scrollLeft += rect.left + anchor.fractionX * rect.width - anchor.screenX;
    element.scrollTop += rect.top + anchor.fractionY * rect.height - anchor.screenY;
  }, [zoom, ref]);
}
