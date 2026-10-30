"use client";

/**
 * Petit panneau qui s'ouvre sous un bouton (Radix Popover), pour l'ordinateur : fermeture par Échap ou par un clic
 * à côté, focus clavier dans le panneau. Sur téléphone, préférer le panneau qui monte du bas (`Sheet`).
 * Affiché dans un portail : il n'est jamais coupé par un parent `overflow: hidden`.
 */
import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "./cn";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverClose = PopoverPrimitive.Close;

export function PopoverContent({ className, align = "start", sideOffset = 6, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-[8001] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto rounded-bb-md border border-bb-border bg-bb-surface p-3 font-bb-sans text-bb-text shadow-bb outline-none",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
