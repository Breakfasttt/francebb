"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Cookie, X, Check } from "lucide-react";
import { Button } from "@bbfrance/ui";

/**
 * Bandeau d'information sur les cookies (RGPD). Il apparaît 1,5 seconde après l'arrivée si le visiteur n'a pas encore
 * répondu ; « Accepter » est mémorisé dans le navigateur, la croix le ferme pour la session.
 *
 * Placement (carte 101) : sur téléphone, il se pose juste au-dessus de la barre de navigation basse et d'une
 * éventuelle barre d'actions de la page, sans les couvrir. Tant qu'il est affiché, il publie sa hauteur dans la
 * variable CSS --app-cookie-space : la coquille ajoute cette place en bas de la page (on peut faire défiler les
 * dernières actions au-dessus du bandeau) et les notifications montent d'autant.
 */
export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
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
      className="bb-fade-in fixed inset-x-2 bottom-[calc(var(--app-bottom-nav-space,0px)+var(--app-page-bar-space,0px)+0.5rem)] z-[var(--z-index-fab)] flex items-start gap-3 rounded-bb-lg border border-bb-border bg-bb-surface p-3 font-bb-sans text-bb-text shadow-bb lg:right-auto lg:bottom-14 lg:left-6 lg:max-w-[600px] lg:items-center lg:gap-4 lg:p-5"
    >
      <Cookie size={24} aria-hidden="true" className="mt-0.5 hidden shrink-0 text-bb-accent-text sm:block lg:mt-0" />
      <div className="min-w-0 flex-1">
        <h2 className="m-0 text-[0.95rem] font-bold">Respect de la vie privée</h2>
        <p className="m-0 mt-0.5 text-sm leading-snug text-bb-text-muted">
          Ce site utilise uniquement des cookies techniques nécessaires à son bon fonctionnement
          (authentification, thèmes). Aucune donnée n&apos;est revendue à des tiers.
          En savoir plus sur nos{" "}
          <Link href="/mentions-legales" className="font-semibold text-bb-accent-text underline underline-offset-2">
            mentions légales
          </Link>
          .
        </p>
        <Button type="button" variant="primary" size="tap" className="mt-2 lg:hidden" onClick={handleAccept}>
          <Check size={16} aria-hidden="true" /> Accepter
        </Button>
      </div>
      <Button type="button" variant="primary" size="tap" className="hidden shrink-0 lg:inline-flex" onClick={handleAccept}>
        <Check size={16} aria-hidden="true" /> Accepter
      </Button>
      <Button
        type="button"
        variant="quiet"
        size="tap-icon"
        className="-mt-1 -mr-1 shrink-0 lg:m-0"
        title="Fermer pour cette session"
        aria-label="Fermer pour cette session"
        onClick={() => setIsVisible(false)}
      >
        <X size={20} aria-hidden="true" />
      </Button>
    </div>
  );
}
