"use client";

/**
 * Onglets de la refonte.
 * - `Tabs*` : onglets dans la page (Radix Tabs, navigation au clavier par les flèches).
 * - `LinkTabs` : onglets qui sont des liens (paramètre `?tab=` gardé dans l'adresse, comme Profil, Modération,
 *   Administration). Sur téléphone, la rangée défile horizontalement au lieu de déborder de l'écran.
 */
import * as React from "react";
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

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn(rowClass, className)} {...props} />;
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
export function LinkTabs({ tabs, label, className, linkComponent: LinkComponent = "a" }: {
  tabs: LinkTab[];
  label: string;
  className?: string;
  linkComponent?: React.ElementType;
}) {
  return (
    <nav aria-label={label} className={cn(rowClass, className)}>
      {tabs.map((tab) => (
        <LinkComponent
          key={tab.href}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={cn(tabClass, tab.active && activeClass)}
        >
          {tab.icon}
          {tab.label}
          {tab.count ? <CountBadge count={tab.count} /> : null}
        </LinkComponent>
      ))}
    </nav>
  );
}
