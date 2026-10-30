"use client";

/**
 * Interrupteur marche / arrêt (Radix Switch) : annoncé comme tel aux lecteurs d'écran, zone tactile de 44 px.
 */
import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "./cn";

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-bb-border bg-bb-surface-2 transition-colors",
        "before:absolute before:-inset-2 before:content-['']",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bb-focus",
        "data-[state=checked]:border-transparent data-[state=checked]:bg-bb-accent disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-1 rounded-full bg-bb-text shadow transition-transform data-[state=checked]:translate-x-6 data-[state=checked]:bg-bb-on-accent" />
    </SwitchPrimitive.Root>
  );
}
