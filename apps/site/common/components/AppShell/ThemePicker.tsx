"use client";

/**
 * Choix du thème (ADR 0006, cartes 081, 083, 213 et 218), dans le panneau « Plus », le menu du compte, l'inscription
 * et Profil > Éditer. Le thème s'applique tout de suite, puis il est enregistré dans le profil du membre connecté
 * (updateTheme) ; pour un visiteur, il est seulement mémorisé dans le navigateur.
 *
 * Une liste simple : une ligne d'au moins 44 pixels par thème, avec un aperçu de ses couleurs (fond de page, carte
 * et couleur d'accent, lues dans la liste générée, `swatch`). Ces couleurs sont écrites en ligne (`style`) : chaque
 * aperçu montre un autre thème que le thème actif, il ne peut donc pas utiliser les variables du thème affiché
 * (exception prévue par le skill ui).
 */
import { useTransition } from "react";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";
import { cn, toast } from "@bbfrance/ui";
import { updateTheme } from "@/app/profile/actions";
import { useTheme } from "@/common/components/ThemeProvider/ThemeProvider";
import { SITE_THEMES } from "@/lib/themes";

/** Aperçu d'un thème : son fond de page, une carte et sa couleur d'accent. */
function Swatch({ swatch }: { swatch: { bg: string; surface: string; accent: string } }) {
  return (
    <span
      aria-hidden="true"
      className="relative size-7 shrink-0 overflow-hidden rounded-bb-sm border border-bb-border"
      style={{ background: swatch.bg }}
    >
      <span className="absolute inset-x-1 top-1 h-2.5 rounded-[3px]" style={{ background: swatch.surface }} />
      <span className="absolute right-1 bottom-1 left-1 h-2 rounded-[3px]" style={{ background: swatch.accent }} />
    </span>
  );
}

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
      else toast.error("Le thème n'a pas pu être enregistré dans ton profil.");
    });
  };

  return (
    <div role="radiogroup" aria-label="Thème du site" aria-busy={isPending} className="flex flex-col overflow-hidden rounded-bb-md border border-bb-border bg-bb-bg">
      {SITE_THEMES.map((t) => {
        const checked = t.id === theme;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => choose(t.id)}
            className={cn(
              "flex min-h-11 w-full cursor-pointer items-center gap-3 border-0 border-b border-bb-border bg-transparent px-3 text-left font-bb-sans text-sm font-semibold text-bb-text last:border-b-0 hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus",
              checked && "bg-bb-accent-soft"
            )}
          >
            <Swatch swatch={t.swatch} />
            <span className="min-w-0 flex-1">{t.label}</span>
            {checked && <Check size={18} aria-hidden="true" className="shrink-0 text-bb-accent-text" />}
          </button>
        );
      })}
    </div>
  );
}
