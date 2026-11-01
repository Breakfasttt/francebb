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
      // Sur téléphone, au-dessus de la barre de navigation basse, d'une éventuelle barre d'actions collée en bas par la
      // page et du bandeau des cookies (variables posées par la coquille du site et par le bandeau)
      mobileOffset={{ bottom: "calc(var(--app-bottom-nav-space, 0px) + var(--app-page-bar-space, 0px) + var(--app-cookie-space, 0px) + 16px)" }}
      toastOptions={{
        style: {
          background: "var(--bb-surface)",
          color: "var(--bb-text)",
          border: "1px solid var(--bb-border)",
          boxShadow: "var(--bb-shadow)",
          fontFamily: "var(--bb-font-sans)",
        },
      }}
    />
  );
}
