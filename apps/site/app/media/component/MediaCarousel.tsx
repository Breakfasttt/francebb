"use client";

/**
 * Tourniquet des directs de la page `/media` (onglets YouTube et Twitch), à la manière de Twitch : le direct du centre
 * joue (lancé seul, sans le son), ceux des côtés montrent leur image, plus petits et assombris. Défilement horizontal
 * aimanté (glissement du doigt sur téléphone), flèches sur ordinateur, appui sur une image pour l'amener au centre.
 * Seul l'élément du centre charge un lecteur : la page ne charge pas un lecteur par direct.
 * Centrage : deux cales invisibles (avant et après la rangée) de (100 % − largeur d'un élément) / 2, moins l'écart
 * entre éléments ; un retrait en pourcentage ne marchait pas, car la largeur des éléments se calculait sur la place
 * restante après ce retrait.
 */
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, cn } from "@bbfrance/ui";

export interface CarouselItem {
  key: string;
  /** Nom de la chaîne. */
  title: string;
  /** Titre du direct. */
  subtitle?: string;
  /** Ligne d'information : spectateurs, jeu… */
  meta?: string;
  thumbnail?: string;
  /** Image servie par le site (optimiseur, domaine autorisé dans next.config.ts) : le visiteur ne contacte pas l'hébergeur. */
  optimizeThumbnail?: boolean;
  /** Adresse du lecteur, chargé seulement quand l'élément est au centre. */
  playerSrc: string;
}

export default function MediaCarousel({ items, label }: { items: CarouselItem[]; label: string }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // L'élément le plus proche du centre de la rangée devient l'élément actif
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const center = row.scrollLeft + row.clientWidth / 2;
        let best = 0;
        let bestDistance = Infinity;
        Array.from(row.children).forEach((child, index) => {
          const el = child as HTMLElement;
          const distance = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center);
          if (distance < bestDistance) {
            bestDistance = distance;
            best = index;
          }
        });
        setActive(best);
      });
    };
    row.addEventListener("scroll", update, { passive: true });
    return () => {
      row.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, []);

  const goTo = (index: number) => {
    const row = rowRef.current;
    const el = row?.children[index] as HTMLElement | undefined;
    if (!row || !el) return;
    row.scrollTo({ left: el.offsetLeft + el.offsetWidth / 2 - row.clientWidth / 2, behavior: "smooth" });
  };

  const current = items[active];

  return (
    <section aria-label={label} aria-roledescription="carrousel" className="flex flex-col gap-3">
      <div className="relative">
        <div
          ref={rowRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:none] before:w-[calc(4%-0.75rem)] before:shrink-0 before:content-[''] after:w-[calc(4%-0.75rem)] after:shrink-0 after:content-[''] lg:gap-5 lg:before:w-[calc(18%-1.25rem)] lg:after:w-[calc(18%-1.25rem)]"
        >
          {items.map((item, index) => {
            const isActive = index === active;
            return (
              <div
                key={item.key}
                role="group"
                aria-roledescription="élément"
                aria-label={`${index + 1} sur ${items.length} : ${item.title}`}
                className={cn(
                  "relative aspect-video w-[92%] shrink-0 snap-center overflow-hidden rounded-bb-lg bg-bb-surface-2 transition-[opacity,transform] duration-200 lg:w-[64%]",
                  !isActive && "scale-[0.94] opacity-55"
                )}
              >
                {isActive ? (
                  <iframe
                    src={item.playerSrc}
                    title={`Direct de ${item.title}`}
                    className="absolute inset-0 size-full border-0"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <Button
                    type="button"
                    variant="quiet"
                    onClick={() => goTo(index)}
                    aria-label={`Voir le direct de ${item.title}`}
                    className="absolute inset-0 h-full w-full rounded-none border-0 bg-transparent p-0 hover:bg-transparent"
                  >
                    {item.thumbnail && <Image src={item.thumbnail} alt="" fill unoptimized={!item.optimizeThumbnail} sizes="64vw" className="object-cover" />}
                  </Button>
                )}
                {/* Sur l'élément actif, le lecteur affiche déjà son propre bandeau « direct » */}
                {!isActive && (
                  <span className="pointer-events-none absolute top-2 left-2 rounded-bb-sm bg-bb-danger px-1.5 py-0.5 text-xs font-bold text-bb-on-danger">
                    EN DIRECT
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {items.length > 1 && (
          <>
            <Button type="button" variant="secondary" size="tap-icon" aria-label="Direct précédent" disabled={active === 0} onClick={() => goTo(active - 1)} className="absolute top-1/2 left-2 hidden -translate-y-1/2 lg:inline-flex">
              <ChevronLeft size={22} aria-hidden="true" />
            </Button>
            <Button type="button" variant="secondary" size="tap-icon" aria-label="Direct suivant" disabled={active === items.length - 1} onClick={() => goTo(active + 1)} className="absolute top-1/2 right-2 hidden -translate-y-1/2 lg:inline-flex">
              <ChevronRight size={22} aria-hidden="true" />
            </Button>
          </>
        )}
      </div>

      {current && (
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mx-auto w-[92%] lg:w-[64%]" aria-live="polite">
          <div className="min-w-0">
            <p className="m-0 font-bold text-bb-text">{current.title}</p>
            {current.subtitle && <p className="m-0 line-clamp-2 text-sm text-bb-text-muted">{current.subtitle}</p>}
          </div>
          <p className="m-0 text-sm text-bb-text-muted">
            {current.meta ? `${current.meta} · ` : ""}
            {items.length > 1 ? `${active + 1} / ${items.length}` : "1 direct"}
          </p>
        </div>
      )}
    </section>
  );
}
