"use client";

/**
 * Choix rapide du thème (ADR 0006, cartes 081 et 083), dans le panneau « Plus » et le menu du compte.
 * Même logique que Profil > Éditer : le thème s'applique tout de suite, puis il est enregistré dans le profil
 * du membre connecté (updateTheme) ; pour un visiteur, il est seulement mémorisé dans le navigateur.
 */
import { useTransition } from "react";
import { useSession } from "next-auth/react";
import { Button, toast } from "@bbfrance/ui";
import { updateTheme } from "@/app/profile/actions";
import { useTheme } from "@/common/components/ThemeProvider/ThemeProvider";
import { SITE_THEMES } from "@/lib/themes";
import "./ThemePicker.css";

export default function ThemePicker({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { theme, setTheme } = useTheme();
  const { update: refreshSession } = useSession();
  const [isPending, startTransition] = useTransition();

  const choose = (id: string) => {
    if (id === theme) return;
    setTheme(id);
    if (!isLoggedIn) return;
    startTransition(async () => {
      const result = await updateTheme(id);
      if (result.success) await refreshSession();
      else toast.error("Le thème n'a pas pu être enregistré dans votre profil.");
    });
  };

  return (
    <div role="radiogroup" aria-label="Thème du site" aria-busy={isPending} className="flex flex-wrap gap-2">
      {SITE_THEMES.map((t) => {
        const checked = t.id === theme;
        return (
          <Button
            key={t.id}
            type="button"
            variant="quiet"
            role="radio"
            aria-checked={checked}
            onClick={() => choose(t.id)}
            className={`min-h-11 gap-2 rounded-full border-2 bg-bb-bg py-0 pr-3 pl-2 text-sm font-semibold text-bb-text hover:bg-bb-surface-2 ${
              checked ? "border-bb-accent-text" : "border-bb-border"
            }`}
          >
            <span aria-hidden="true" className="theme-swatch size-[22px] rounded-full" data-swatch={t.id} />
            {t.label}
          </Button>
        );
      })}
    </div>
  );
}
