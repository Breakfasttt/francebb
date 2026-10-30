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
      // Sur téléphone, au-dessus de la barre de navigation basse (variable posée par la coquille du site)
      mobileOffset={{ bottom: "calc(var(--app-bottom-nav-space, 0px) + 16px)" }}
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
