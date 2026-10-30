"use client";

/**
 * Menu « ⋯ » des actions secondaires (ADR 0006) : sur téléphone, un panneau qui monte du bas avec de grandes lignes
 * faciles à toucher ; sur ordinateur, une liste déroulante Radix (navigation au clavier, Échap pour fermer).
 * Les actions principales (Citer, Répondre…) ne vont jamais ici : elles restent visibles.
 */
import * as React from "react";
import { DropdownMenu } from "radix-ui";
import { cn } from "./cn";
import { Button } from "./button";
import { Sheet, SheetContent } from "./sheet";
import { useMediaQuery, DESKTOP_QUERY } from "./use-media-query";

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  /** Action déclenchée au choix ; le menu se ferme d'abord. */
  onSelect?: () => void;
  /** Lien : rendu en <a href>, pour une navigation simple. */
  href?: string;
  /** Action destructrice (supprimer…), affichée en couleur de danger. */
  danger?: boolean;
  /** Masque l'entrée (droits insuffisants) sans avoir à filtrer la liste. */
  hidden?: boolean;
}

export interface ActionMenuProps {
  /** Nom du bouton, lu par les lecteurs d'écran (« Plus d'actions sur ce message »). */
  label: string;
  /** Titre du panneau sur téléphone. */
  title?: string;
  items: ActionMenuItem[];
  /** Contenu du bouton : par défaut, trois points. */
  trigger?: React.ReactNode;
  triggerClassName?: string;
  /** Composant de lien pour les entrées `href` (le site passe `next/link`) ; par défaut, un simple <a>. */
  linkComponent?: React.ElementType;
}

const dots = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="5" cy="12" r="1.2" />
    <circle cx="12" cy="12" r="1.2" />
    <circle cx="19" cy="12" r="1.2" />
  </svg>
);

const triggerBase =
  "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-bb-md border-0 bg-transparent [font-family:inherit] text-bb-text-muted hover:bg-bb-surface-2 hover:text-bb-text focus-visible:outline-2 focus-visible:outline-bb-focus";

export function ActionMenu({ label, title, items, trigger = dots, triggerClassName, linkComponent: LinkComponent = "a" }: ActionMenuProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [open, setOpen] = React.useState(false);
  const visible = items.filter((item) => !item.hidden);
  if (visible.length === 0) return null;

  const select = (item: ActionMenuItem) => {
    setOpen(false);
    item.onSelect?.();
  };

  if (isDesktop) {
    return (
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger aria-label={label} className={cn(triggerBase, triggerClassName)}>
          {trigger}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-[8001] min-w-56 rounded-bb-md border border-bb-border bg-bb-surface p-1 font-bb-sans text-bb-text shadow-bb"
          >
            {visible.map((item) => (
              <DropdownMenu.Item
                key={item.label}
                asChild={!!item.href}
                onSelect={item.href ? undefined : () => select(item)}
                className={cn(
                  "flex min-h-10 cursor-pointer items-center gap-2 rounded-bb-sm px-3 text-[0.95rem] outline-none data-[highlighted]:bg-bb-surface-2",
                  item.danger && "text-bb-danger-text"
                )}
              >
                {item.href ? (
                  <LinkComponent href={item.href}>
                    {item.icon}
                    {item.label}
                  </LinkComponent>
                ) : (
                  <>
                    {item.icon}
                    {item.label}
                  </>
                )}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  }

  const rowClass = (item: ActionMenuItem) =>
    cn(
      "flex min-h-12 w-full cursor-pointer items-center gap-3 border-b border-bb-border px-1 text-left text-base last:border-b-0",
      item.danger ? "text-bb-danger-text" : "text-bb-text"
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button type="button" variant="quiet" aria-label={label} aria-haspopup="dialog" onClick={() => setOpen(true)} className={cn(triggerBase, "p-0", triggerClassName)}>
        {trigger}
      </Button>
      <SheetContent title={title ?? label}>
        <ul className="m-0 list-none p-0">
          {visible.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <LinkComponent href={item.href} className={rowClass(item)} onClick={() => setOpen(false)}>
                  {item.icon}
                  {item.label}
                </LinkComponent>
              ) : (
                <Button type="button" variant="quiet" className={cn(rowClass(item), "justify-start rounded-none font-normal hover:bg-transparent")} onClick={() => select(item)}>
                  {item.icon}
                  {item.label}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
