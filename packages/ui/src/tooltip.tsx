"use client";

/**
 * Info-bulle (Radix Tooltip) : affichée dans un portail, elle n'est jamais coupée par un parent `overflow: hidden`.
 * Sur écran tactile elle ne s'ouvre pas au survol : ne jamais y mettre une information indispensable.
 */
import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

export function Tooltip({ content, children, side = "top" }: {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className="z-[9000] max-w-64 rounded-bb-sm border border-bb-border bg-bb-surface-2 px-2.5 py-1.5 font-bb-sans text-sm text-bb-text shadow-bb"
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
