/**
 * Badges de la refonte : étiquette courte (statut, rang, rôle) et pastille de compteur (non-lus, en attente).
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

export const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1 rounded-bb-sm border px-1.5 py-0.5 text-xs leading-none font-bold whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "border-bb-border bg-bb-surface-2 text-bb-text-muted",
        accent: "border-transparent bg-bb-accent text-bb-on-accent",
        outline: "border-bb-accent-text bg-transparent text-bb-accent-text",
        rank: "border-bb-rank bg-transparent text-bb-rank",
        unread: "border-transparent bg-bb-unread text-bb-bg",
        danger: "border-bb-danger-text bg-transparent text-bb-danger-text",
        success: "border-bb-success-text bg-transparent text-bb-success-text",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/** Pastille ronde de compteur ; au-delà de `max`, affiche « max+ ». Ne rend rien si le compte est nul. */
export function CountBadge({ count, max = 9, className, ...props }: React.ComponentProps<"span"> & { count: number; max?: number }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-bb-accent px-1.5 text-xs leading-none font-bold text-bb-on-accent",
        className
      )}
      {...props}
    >
      {count > max ? `${max}+` : count}
    </span>
  );
}
