/**
 * États d'attente et d'absence de contenu : liste vide (EmptyState) et forme grise pendant un chargement (Skeleton).
 */
import * as React from "react";
import { cn } from "./cn";

/**
 * État vide (DESIGN.md, « Logiques communes ») : une phrase qui dit ce qui se passe, une précision discrète et, s'il
 * y en a une, l'action qui le change. Aligné à gauche, sans grande icône : `icon` est gardé pour compatibilité mais
 * n'est plus affiché (une icône géante au centre est un signe d'interface générée).
 */
export function EmptyState({ title, children, action, className }: {
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-1.5 px-4 py-5", className)}>
      <p className="text-base font-semibold text-bb-text">{title}</p>
      {children ? <div className="max-w-[65ch] text-sm text-bb-text-muted">{children}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-bb-md bg-bb-surface-2", className)} {...props} />;
}
