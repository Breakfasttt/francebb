"use client";

/**
 * Notifications du site (sonner). `toast.success("…")`, `toast.error("…")`, `toast("…")`.
 * Le Toaster est monté une fois dans le layout ; son apparence suit les variables du thème actif.
 */
import { Toaster as Sonner, toast } from "sonner";

export { toast };

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--card-bg)",
          color: "var(--foreground)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(10px)",
        },
      }}
    />
  );
}
