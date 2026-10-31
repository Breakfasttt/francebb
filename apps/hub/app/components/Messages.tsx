/**
 * Messages courts des pages du hub (carte 128) : texte secondaire, erreur, succès. Couleurs du thème (packages/ui).
 */
import { cn } from "@bbfrance/ui";

export function Muted({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("m-0 text-sm text-bb-text-muted", className)} {...props} />;
}

export function ErrorMessage({ className, ...props }: React.ComponentProps<"p">) {
  return <p role="alert" className={cn("m-0 text-bb-danger-text", className)} {...props} />;
}

export function SuccessMessage({ className, ...props }: React.ComponentProps<"p">) {
  return <p role="status" className={cn("m-0 text-bb-success-text", className)} {...props} />;
}
