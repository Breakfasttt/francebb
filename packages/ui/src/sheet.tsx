"use client";

/**
 * Panneau qui monte du bas de l'écran (« bottom sheet », ADR 0006), construit sur la fenêtre Radix déjà présente :
 * fermeture par Échap, par la croix ou par un appui à côté, focus clavier gardé dans le panneau, défilement de la
 * page bloqué. Sur ordinateur, `side="right"` en fait un tiroir à droite ; `side="center"` une fenêtre centrée.
 * Le bas du panneau respecte la zone protégée de l'iPhone (safe area).
 */
import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "./cn";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const sides = {
  bottom: "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-[20px] border-t pb-[max(1rem,env(safe-area-inset-bottom))]",
  right: "inset-y-0 right-0 h-dvh w-[min(420px,100vw)] border-l pb-[env(safe-area-inset-bottom)]",
  center: "left-1/2 top-1/2 max-h-[85dvh] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-bb-lg border",
};

export interface SheetContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  /** Titre lu par les lecteurs d'écran et affiché en haut du panneau. */
  title: string;
  /** Masque visuellement le titre (il reste annoncé aux lecteurs d'écran). */
  hideTitle?: boolean;
  description?: string;
  side?: keyof typeof sides;
}

export function SheetContent({ title, hideTitle, description, side = "bottom", className, children, ...props }: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[8000] bg-bb-overlay" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-[8001] flex flex-col overflow-hidden border-bb-border bg-bb-surface font-bb-sans text-bb-text shadow-bb outline-none",
          sides[side],
          className
        )}
        {...props}
      >
        {side === "bottom" && <div aria-hidden="true" className="mx-auto mt-2 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-bb-border" />}
        <div className={cn("flex shrink-0 items-center gap-2 px-4 pt-2 pb-1", hideTitle && "sr-only")}>
          <DialogPrimitive.Title className="m-0 flex-1 text-lg font-bold text-bb-text normal-case not-italic">{title}</DialogPrimitive.Title>
          {/* border-0 et bg-transparent remplacent la remise à zéro du navigateur (preflight), absente pour l'instant */}
          <DialogPrimitive.Close
            aria-label="Fermer"
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-bb-md border-0 bg-transparent text-bb-text-muted hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:outline-bb-focus"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </DialogPrimitive.Close>
        </div>
        {description ? (
          <DialogPrimitive.Description className="px-4 pb-2 text-sm text-bb-text-muted">{description}</DialogPrimitive.Description>
        ) : (
          <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
