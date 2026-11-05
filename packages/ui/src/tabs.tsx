"use client";

/**
 * Onglets de la refonte.
 * - `Tabs*` : onglets dans la page (Radix Tabs, navigation au clavier par les flèches).
 * - `LinkTabs` : onglets qui sont des liens (paramètre `?tab=` gardé dans l'adresse, comme Profil, Modération,
 *   Administration). Sur téléphone, la rangée défile horizontalement au lieu de déborder de l'écran.
 *   `orientation="vertical"` (carte 099) les empile en colonne, pour une colonne latérale d'ordinateur quand les
 *   onglets sont trop nombreux pour tenir sur une ligne (modération, administration).
 * Rangée qui défile (carte 190) : quand les onglets ne tiennent pas sur la largeur, le bord du côté où il en reste
 * à voir s'estompe (fondu), pour montrer qu'on peut faire glisser la rangée ; et la rangée se place d'elle-même sur
 * l'onglet ouvert, pour qu'un onglet de la fin de la liste ne soit pas ouvert sans être visible.
 */
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "./cn";
import { CountBadge } from "./badge";

export const Tabs = TabsPrimitive.Root;
export const TabsContent = TabsPrimitive.Content;

const rowClass = "flex gap-1 overflow-x-auto overscroll-x-contain border-b border-bb-border [scrollbar-width:none]";
const tabClass =
  // border-x-0, border-t-0, bg-transparent et la police héritée remplacent la remise à zéro du navigateur (preflight),
  // absente pour l'instant : sans eux, l'onglet-bouton garde le fond et la bordure gris du navigateur (carte 089)
  "inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 border-x-0 border-t-0 border-b-2 border-transparent bg-transparent [font-family:inherit] px-3 text-[0.95rem] font-semibold whitespace-nowrap text-bb-text-muted hover:text-bb-text focus-visible:outline-2 focus-visible:outline-bb-focus";
const activeClass = "border-bb-accent-text text-bb-text";
// Colonne d'onglets : chaque onglet prend toute la largeur, l'onglet ouvert est marqué par un trait à gauche et un fond
const columnClass = "flex flex-col gap-0.5";
const columnTabClass =
  "flex min-h-11 w-full items-center gap-2.5 rounded-bb-md border-0 border-l-[3px] border-transparent px-3 text-[0.95rem] font-semibold text-bb-text-muted no-underline hover:bg-bb-surface-2 hover:text-bb-text focus-visible:outline-2 focus-visible:outline-bb-focus";
const columnActiveClass = "border-bb-accent-text bg-bb-surface-2 text-bb-text";

// Largeur du fondu posé sur un bord de la rangée. Le masque ne garde que la transparence du dégradé : la couleur
// écrite (black) n'est jamais affichée, ce qui le rend valable dans les 8 thèmes.
const FADE = "1.5rem";

/**
 * Indices de défilement d'une rangée d'onglets : renvoie la référence à poser sur la rangée, puis le style de son masque.
 * - Un fondu apparaît sur le bord gauche s'il reste des onglets à gauche, sur le bord droit s'il en reste à droite.
 * - Quand l'onglet ouvert change (attribut aria-current="page" d'un lien, ou data-state="active" d'un onglet Radix),
 *   la rangée défile pour le centrer, sans faire défiler la page.
 */
function useScrollableRow<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ start: false, end: false });
  const activeRef = useRef<Element | null>(null);

  useEffect(() => {
    const row = ref.current;
    if (!row) return;
    const update = () => {
      const hidden = row.scrollWidth - row.clientWidth;
      const start = row.scrollLeft > 1;
      const end = row.scrollLeft < hidden - 1;
      setEdges((previous) => (previous.start === start && previous.end === end ? previous : { start, end }));
    };
    update();
    row.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(row);
    return () => {
      row.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  // Sans liste de dépendances : vérifié à chaque affichage, mais la rangée ne bouge que si l'onglet ouvert a changé
  useEffect(() => {
    const row = ref.current;
    const active = row?.querySelector<HTMLElement>('[aria-current="page"], [data-state="active"]') ?? null;
    if (!row || !active || active === activeRef.current) return;
    activeRef.current = active;
    if (row.scrollWidth <= row.clientWidth) return;
    const rowBox = row.getBoundingClientRect();
    const tabBox = active.getBoundingClientRect();
    row.scrollLeft += tabBox.left - rowBox.left - (rowBox.width - tabBox.width) / 2;
  });

  let maskImage: string | undefined;
  if (edges.start || edges.end) {
    const from = edges.start ? `transparent, black ${FADE}` : "black";
    const to = edges.end ? `black calc(100% - ${FADE}), transparent` : "black";
    maskImage = `linear-gradient(to right, ${from}, ${to})`;
  }
  const style: React.CSSProperties | undefined = maskImage ? { maskImage, WebkitMaskImage: maskImage } : undefined;
  return [ref, style] as const;
}

export function TabsList({ className, style, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  const [rowRef, rowStyle] = useScrollableRow<HTMLDivElement>();
  return <TabsPrimitive.List ref={rowRef} className={cn(rowClass, className)} style={{ ...style, ...rowStyle }} {...props} />;
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger className={cn(tabClass, "data-[state=active]:border-bb-accent-text data-[state=active]:text-bb-text", className)} {...props} />;
}

export interface LinkTab {
  label: string;
  href: string;
  active?: boolean;
  count?: number;
  icon?: React.ReactNode;
}

/**
 * `linkComponent` permet au site de passer `next/link` (navigation sans rechargement) ; par défaut, un simple <a>.
 */
export function LinkTabs({ tabs, label, className, orientation = "horizontal", linkComponent: LinkComponent = "a" }: {
  tabs: LinkTab[];
  label: string;
  className?: string;
  orientation?: "horizontal" | "vertical";
  linkComponent?: React.ElementType;
}) {
  const vertical = orientation === "vertical";
  // Les indices de défilement ne servent qu'à la rangée ; une colonne ne défile pas de côté
  const [rowRef, rowStyle] = useScrollableRow<HTMLElement>();
  return (
    <nav ref={vertical ? undefined : rowRef} aria-label={label} className={cn(vertical ? columnClass : rowClass, className)} style={vertical ? undefined : rowStyle}>
      {tabs.map((tab) => (
        <LinkComponent
          key={tab.href}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={vertical ? cn(columnTabClass, tab.active && columnActiveClass) : cn(tabClass, tab.active && activeClass)}
        >
          {tab.icon}
          <span className={vertical ? "min-w-0 flex-1 truncate" : undefined}>{tab.label}</span>
          {tab.count ? <CountBadge count={tab.count} /> : null}
        </LinkComponent>
      ))}
    </nav>
  );
}
