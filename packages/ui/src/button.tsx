/**
 * Bouton shadcn pour le nouveau code (variantes sur les tokens de thème). Les wrappers historiques
 * (`ClassicButton`, `CTAButton`…) du site restent la référence tant que leurs usages ne sont pas migrés.
 */
import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

export const buttonVariants = cva(
  // border-0, bg-transparent et la police héritée remplacent le reset (preflight) absent tant que le CSS historique existe
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-transparent [font-family:inherit] font-bold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline: "border border-border bg-card text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        destructive: "bg-destructive text-white hover:opacity-90",
        // Variantes de la refonte (ADR 0006), sur les variables v2 :
        primary: "bg-bb-accent text-bb-on-accent hover:bg-bb-accent-hover focus-visible:outline-bb-focus",
        secondary: "border border-bb-border bg-bb-surface-2 text-bb-text hover:border-bb-text-muted focus-visible:outline-bb-focus",
        quiet: "text-bb-text-muted hover:bg-bb-surface-2 hover:text-bb-text focus-visible:outline-bb-focus",
        danger: "bg-bb-danger text-bb-on-danger hover:opacity-90 focus-visible:outline-bb-focus",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-6 py-3 text-[0.95rem]",
        icon: "size-9",
        // Tailles tactiles de la refonte : au moins 44 px de haut (règle « mobile impeccable »)
        tap: "min-h-11 rounded-bb-md px-4 text-[0.95rem]",
        "tap-icon": "size-11 rounded-bb-md",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot.Root : "button";
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
