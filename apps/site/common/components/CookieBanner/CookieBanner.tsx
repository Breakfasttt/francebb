"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie, X, Check } from "lucide-react";
import { Button } from "@bbfrance/ui";
import { isComposePath } from "@/common/components/AppShell/navItems";

/**
 * Bandeau d'information sur les cookies (RGPD). Il apparaît 1,5 seconde après l'arrivée si le visiteur n'a pas encore
 * répondu ; « Accepter » est mémorisé dans le navigateur, la croix le ferme pour la session.
 *
 * Placement (carte 101) : sur téléphone, il se pose juste au-dessus de la barre de navigation basse et d'une
 * éventuelle barre d'actions de la page, sans les couvrir. Tant qu'il est affiché, il publie sa hauteur dans la
 * variable CSS --app-cookie-space : la coquille ajoute cette place en bas de la page (on peut faire défiler les
 * dernières actions au-dessus du bandeau) et les notifications montent d'autant.
 *
 * Carte 190 : sur téléphone, le bandeau tient sur deux lignes à 360 pixels de large (phrase courte, lien « En savoir
 * plus » vers les mentions légales, bouton « Accepter » et croix sur la même rangée) ; le titre n'est affiché que sur
 * ordinateur. Il ne s'affiche pas sur les écrans de rédaction (isComposePath), où il recouvrait la barre
 * « Annuler / Publier » : il revient sur la page suivante.
 */
export default function CookieBanner() {
  const [visibleState, setIsVisible] = useState(false);
  const pathname = usePathname();
  // Écran de rédaction : le bandeau attend la page suivante (voir plus haut)
  const isVisible = visibleState && !isComposePath(pathname);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Vérifier si le consentement a déjà été donné
    const consent = localStorage.getItem("bbfrance_cookie_consent");
    if (!consent) {
      // Petit délai pour l'effet d'apparition
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Hauteur du bandeau publiée pour la coquille (voir AppShell.css), retirée quand il disparaît
  useEffect(() => {
    const el = bannerRef.current;
    if (!isVisible || !el) return;
    const root = document.documentElement;
    const update = () => root.style.setProperty("--app-cookie-space", `${Math.ceil(el.getBoundingClientRect().height) + 8}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--app-cookie-space");
    };
  }, [isVisible]);

  const handleAccept = () => {
    localStorage.setItem("bbfrance_cookie_consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label="Respect de la vie privée"
      className="bb-fade-in fixed inset-x-2 bottom-[calc(var(--app-bottom-nav-space,0px)+var(--app-page-bar-space,0px)+0.5rem)] z-[var(--z-index-fab)] flex items-center gap-2 rounded-bb-lg border border-bb-border bg-bb-surface py-2 pr-2 pl-3 font-bb-sans text-bb-text shadow-bb lg:right-auto lg:bottom-14 lg:left-6 lg:max-w-[600px] lg:gap-4 lg:p-5"
    >
      <Cookie size={24} aria-hidden="true" className="hidden shrink-0 text-bb-accent-text lg:block" />
      <div className="min-w-0 flex-1">
        <h2 className="m-0 hidden text-[0.95rem] font-bold lg:block">Respect de la vie privée</h2>
        <p className="m-0 text-sm leading-snug text-bb-text-muted lg:mt-0.5">
          Cookies techniques seulement.{" "}
          {/* Le remplissage vertical, compensé par une marge négative, porte la zone d'appui à 44 pixels sans
              agrandir la ligne */}
          <Link href="/mentions-legales" className="-my-3.5 inline-block py-3.5 font-semibold text-bb-accent-text underline underline-offset-2">
            En savoir plus
          </Link>
        </p>
      </div>
      <Button type="button" variant="primary" size="tap" className="shrink-0 px-3 lg:px-4" onClick={handleAccept}>
        <Check size={16} aria-hidden="true" className="max-lg:hidden" /> Accepter
      </Button>
      <Button
        type="button"
        variant="quiet"
        size="tap-icon"
        className="-mr-1 shrink-0 lg:m-0"
        title="Fermer pour cette session"
        aria-label="Fermer pour cette session"
        onClick={() => setIsVisible(false)}
      >
        <X size={20} aria-hidden="true" />
      </Button>
    </div>
  );
}
