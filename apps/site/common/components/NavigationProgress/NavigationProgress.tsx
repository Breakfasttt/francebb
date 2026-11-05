"use client";

/**
 * Barre de progression de la navigation (carte 188) : une fine barre colorée en haut de l'écran, qui montre que
 * l'appui sur un lien a bien été pris en compte pendant que le serveur prépare la page suivante.
 *
 * Pourquoi pas des écrans de chargement (`loading.tsx`) : avec eux, Next.js envoie le début de la page avant d'avoir
 * fini les contrôles. Une page introuvable répondait alors « OK » au lieu de 404, et un renvoi vers une autre page
 * (`redirect()`) se faisait dans le navigateur, avec une erreur React. La barre, elle, ne change rien à la réponse du
 * serveur.
 *
 * Fonctionnement : un écouteur de clics repère un lien interne vers une autre adresse et lance la barre. La barre se
 * termine quand l'adresse affichée change (`usePathname`, `useSearchParams`). Elle n'apparaît qu'au bout de
 * 150 millisecondes, pour ne pas clignoter quand la page arrive tout de suite, et s'arrête d'elle-même au bout de
 * 15 secondes si la navigation n'aboutit pas (lien vers un fichier, erreur réseau).
 */
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/** Délai avant d'afficher la barre : une navigation plus rapide ne montre rien. */
const SHOW_DELAY_MS = 150;
/** Durée au bout de laquelle la barre s'arrête d'elle-même. */
const GIVE_UP_MS = 15_000;
/** Durée de l'animation de fin (barre pleine, puis disparition). */
const FINISH_MS = 300;

/** idle : rien ; pending : clic reçu, barre pas encore visible ; loading : barre qui avance ; finishing : barre pleine qui s'efface. */
type Phase = "idle" | "pending" | "loading" | "finishing";

/** Le clic vise-t-il une autre page du site, ouverte dans le même onglet ? */
function isInternalNavigation(event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const link = (event.target as Element | null)?.closest?.("a");
  if (!link || !link.href) return false;
  if (link.target && link.target !== "_self") return false;
  if (link.hasAttribute("download")) return false;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  // Même page (seule l'ancre « # » change) : pas de navigation
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const location = `${pathname}?${searchParams.toString()}`;
  const [phase, setPhase] = useState<Phase>("idle");
  const [shownLocation, setShownLocation] = useState(location);

  // Nouvelle adresse affichée : la navigation est terminée. L'état est ajusté pendant le rendu, comme le conseille
  // React, plutôt que dans un effet qui provoquerait un second rendu.
  if (location !== shownLocation) {
    setShownLocation(location);
    if (phase === "loading") setPhase("finishing");
    else if (phase === "pending") setPhase("idle");
  }

  // Clic sur un lien interne : la navigation commence
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (isInternalNavigation(event)) setPhase("pending");
    };
    // Phase de capture : le clic est vu avant que Next.js ne lance la navigation
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Minuteries de chaque étape : affichage différé, abandon, puis disparition après l'animation de fin
  useEffect(() => {
    if (phase === "idle") return;
    const timer =
      phase === "pending"
        ? window.setTimeout(() => setPhase("loading"), SHOW_DELAY_MS)
        : phase === "loading"
          ? window.setTimeout(() => setPhase("idle"), GIVE_UP_MS)
          : window.setTimeout(() => setPhase("idle"), FINISH_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // Barre décorative : l'état de la page est déjà annoncé par le navigateur aux lecteurs d'écran
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[9000] h-[3px]">
      <div
        data-testid="navigation-progress"
        className={
          "h-full origin-left bg-bb-accent shadow-[0_0_8px_var(--bb-accent)] motion-reduce:transition-none " +
          (phase === "loading"
            ? "scale-x-[0.8] opacity-100 transition-transform duration-[8000ms] ease-out"
            : phase === "finishing"
              ? "scale-x-100 opacity-0 transition-[transform,opacity] duration-300 ease-out"
              : "scale-x-0 opacity-0")
        }
      />
    </div>
  );
}
