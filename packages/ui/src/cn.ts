/**
 * Fusion de classes CSS (shadcn) : clsx pour les conditions, tailwind-merge pour dédoublonner les utilitaires Tailwind.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
