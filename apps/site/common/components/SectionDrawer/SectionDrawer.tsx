"use client";

/**
 * Rubriques d'un écran sur téléphone (profil, classement, fiche d'un membre, modération, administration) : une barre
 * collée sous la barre du haut affiche la rubrique ouverte ; un appui ouvre un tiroir à gauche avec toutes les
 * rubriques. La barre reste à portée de pouce pendant le défilement : plus besoin de remonter en haut de la page,
 * et aucune rubrique n'est cachée hors de l'écran comme dans une rangée d'onglets qui glisse.
 * Sur ordinateur, ce composant n'affiche rien : les rubriques sont dans le panneau gauche de la page (`PanelLink`).
 * Une rubrique est un lien (`href`, l'adresse garde la rubrique ouverte) ou une vue de la page (`onSelect`, comme les
 * vues du classement).
 */
import { useState, type ElementType } from "react";
import Link from "next/link";
import { ChevronRight, Menu } from "lucide-react";
import { Button, Sheet, SheetContent, cn } from "@bbfrance/ui";
import { panelItemClass } from "@/common/components/SiteLayout/SiteLayout";

export interface SectionDrawerItem {
  label: string;
  /** Adresse de la rubrique ; sans adresse, `onSelect` change la vue dans la page. */
  href?: string;
  onSelect?: () => void;
  active?: boolean;
  /** Nombre affiché à droite de la rubrique (sujets suivis, signalements en attente…). */
  count?: number | string;
}

export default function SectionDrawer({
  title,
  items,
  linkComponent: LinkComponent = Link,
  scrollTargetId,
}: {
  /** Titre du tiroir : le nom de l'écran (« Mon compte », « Classement »). */
  title: string;
  items: SectionDrawerItem[];
  linkComponent?: ElementType;
  /** Élément ramené en haut de l'écran après un choix, si la page était défilée plus bas. */
  scrollTargetId?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = items.find((item) => item.active) ?? items[0];

  const choose = () => {
    setOpen(false);
    if (!scrollTargetId) return;
    // Après le changement de rubrique : si la barre était collée en haut, le début de la rubrique revient sous elle
    window.requestAnimationFrame(() => {
      const target = document.getElementById(scrollTargetId);
      if (target && target.getBoundingClientRect().top < 0) target.scrollIntoView({ block: "start" });
    });
  };

  return (
    <div className="sticky top-14 z-[var(--z-index-page-content)] -mx-3 border-b border-bb-border bg-bb-bg px-3 py-2 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <Button
          type="button"
          variant="secondary"
          size="tap"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="w-full justify-start gap-3 px-3 text-left"
        >
          <Menu size={20} aria-hidden="true" className="shrink-0 text-bb-text-muted" />
          <span className="min-w-0 flex-1">
            <span className="sr-only">{title} : </span>
            <span className="block truncate font-semibold">{current?.label}</span>
          </span>
          <span className="shrink-0 text-sm font-normal text-bb-text-muted">{items.length} rubriques</span>
          <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-bb-text-muted" />
        </Button>
        {/* Entre la barre du haut (56 px) et la barre basse, qui restent visibles : le tiroir descend jusqu'en bas de
            l'écran mais passe sous les barres du site (z-index des barres de page, sous celui des barres), qui le
            recouvrent exactement, sans écart. Sa liste garde une marge de la hauteur de la barre basse. */}
        <SheetContent
          side="left"
          title={title}
          className="top-14 bottom-0 z-[var(--z-index-page-bar)] h-auto pb-[var(--app-bottom-nav-space)]"
          overlayClassName="top-14 z-[var(--z-index-page-bar)]"
        >
          <nav aria-label={`Rubriques : ${title}`} className="flex flex-col overflow-y-auto pb-4">
            {items.map((item) => {
              const content = (
                <>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.count !== undefined && <span className="text-sm text-bb-text-muted tabular-nums">{item.count}</span>}
                </>
              );
              return item.href ? (
                <LinkComponent
                  key={item.href}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={panelItemClass(item.active)}
                  onClick={choose}
                >
                  {content}
                </LinkComponent>
              ) : (
                <Button
                  key={item.label}
                  type="button"
                  variant="quiet"
                  aria-current={item.active ? "page" : undefined}
                  onClick={() => {
                    item.onSelect?.();
                    choose();
                  }}
                  className={cn(panelItemClass(item.active), "h-auto justify-start rounded-none hover:bg-transparent", !item.active && "font-normal")}
                >
                  {content}
                </Button>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
