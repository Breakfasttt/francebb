"use client";

/**
 * Repères de défilement de l'accueil du membre, sur ordinateur seulement : une colonne de points à droite de l'écran,
 * un par bloc, reliés par un trait qui se remplit à mesure qu'on descend. Le bloc en cours est allumé ; son nom
 * s'affiche à côté du point, comme celui d'un autre point au survol ou au focus clavier. Un clic descend jusqu'au bloc
 * (sans animation avec le réglage « réduire les animations »).
 *
 * Ce sont de vrais liens vers les ancres des blocs (`#forum`…) : ils fonctionnent aussi avant le chargement du script.
 * Le bloc en cours est le dernier dont le haut a passé le tiers de l'écran, ou le dernier bloc en bas de page.
 */
import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "@bbfrance/ui";

export interface Waypoint {
  /** Identifiant de l'ancre du bloc (sans « # »). */
  id: string;
  label: string;
}

/** Hauteur de l'écran, depuis le haut, que le haut d'un bloc doit passer pour devenir le bloc en cours. */
const ACTIVE_LINE = 0.35;

export default function HomeWaypoints({ items }: { items: Waypoint[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) {
        setActive(items.length - 1);
        return;
      }
      const line = window.innerHeight * ACTIVE_LINE;
      let current = 0;
      items.forEach((item, index) => {
        const element = document.getElementById(item.id);
        if (element && element.getBoundingClientRect().top <= line) current = index;
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [items]);

  const goTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  };

  // Part du trait remplie : du premier point jusqu'au point en cours
  const progress = items.length > 1 ? active / (items.length - 1) : 0;

  return (
    <nav aria-label="Sections de l'accueil" className="fixed top-1/2 right-6 z-[var(--z-index-page-content)] hidden -translate-y-1/2 font-bb-sans lg:block">
      <div className="relative">
        {/* Trait de fond, puis sa partie remplie, d'un centre de point à l'autre (les points sont dans des lignes de 44 px) */}
        <span aria-hidden="true" className="absolute top-[22px] right-[21px] bottom-[22px] w-0.5 rounded-full bg-bb-border" />
        <span aria-hidden="true" className="absolute top-[22px] right-[21px] bottom-[22px] w-0.5">
          <span
            className="block w-full origin-top rounded-full bg-bb-accent motion-safe:transition-[height] motion-safe:duration-300 motion-safe:ease-out"
            style={{ height: `${progress * 100}%` }}
          />
        </span>
        <ul className="relative m-0 flex list-none flex-col p-0">
          {items.map((item, index) => {
            const isActive = index === active;
            const isPassed = index < active;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(event) => goTo(event, item.id)}
                  aria-current={isActive ? "location" : undefined}
                  className="group flex h-11 items-center justify-end gap-3 rounded-bb-md pl-3 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bb-focus"
                >
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-sm whitespace-nowrap motion-safe:transition-opacity motion-safe:duration-200",
                      isActive
                        ? // Entre 1025 et 1280 pixels, la marge est trop étroite pour un libellé permanent : il ne paraît qu'au survol
                          "bg-bb-accent-soft font-bold text-bb-accent-text opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 min-[1280px]:opacity-100"
                        : "border border-bb-border bg-bb-surface font-semibold text-bb-text opacity-0 shadow-bb group-hover:opacity-100 group-focus-visible:opacity-100"
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="flex size-11 shrink-0 items-center justify-center">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "block rounded-full border-2 motion-safe:transition-all motion-safe:duration-200",
                        isActive
                          ? "size-3.5 border-bb-accent bg-bb-accent"
                          : isPassed
                            ? "size-2.5 border-bb-accent bg-bb-bg group-hover:size-3"
                            : "size-2.5 border-bb-text-muted bg-bb-bg group-hover:size-3 group-hover:border-bb-text"
                      )}
                    />
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
