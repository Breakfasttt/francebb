/**
 * États d'attente et d'absence de contenu : liste vide (EmptyState) et forme grise pendant un chargement (Skeleton).
 */
import * as React from "react";
import { cn } from "./cn";

export function EmptyState({ icon, title, children, action, className }: {
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2 px-4 py-10 text-center", className)}>
      {icon ? <div className="text-bb-text-muted" aria-hidden="true">{icon}</div> : null}
      <p className="m-0 text-base font-semibold text-bb-text">{title}</p>
      {children ? <div className="max-w-md text-sm text-bb-text-muted">{children}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-bb-md bg-bb-surface-2", className)} {...props} />;
}
