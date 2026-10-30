"use client";

/**
 * Bandeau « Nouveau look » (ADR 0006, carte 083) : tous les membres sont passés au thème Vestiaire. Celui qui avait
 * un autre thème voit ce bandeau une fois, avec un bouton pour retrouver son ancien thème en un clic.
 * Le choix (garder ou revenir) est mémorisé dans le navigateur ; le thème reste modifiable à tout moment
 * depuis « Plus », le menu du compte ou Profil > Éditer.
 */
import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { Button, toast } from "@bbfrance/ui";
import { getPreviousTheme, updateTheme } from "@/app/profile/actions";
import { useTheme } from "@/common/components/ThemeProvider/ThemeProvider";
import { SITE_THEMES } from "@/lib/themes";

const STORAGE_KEY = "bb-nouveau-look-vu";

function alreadySeen(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Navigation privée ou stockage bloqué : le bandeau reviendra, ce n'est pas grave
  }
}

export default function NewLookBanner({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [previous, setPrevious] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { setTheme } = useTheme();
  const { update: refreshSession } = useSession();

  useEffect(() => {
    if (!isLoggedIn || alreadySeen()) return;
    let active = true;
    getPreviousTheme().then((theme) => {
      if (active) setPrevious(theme);
    });
    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  if (!previous) return null;
  const label = SITE_THEMES.find((t) => t.id === previous)?.label ?? previous;

  const keep = () => {
    markSeen();
    setPrevious(null);
  };

  const goBack = () => {
    const target = previous;
    startTransition(async () => {
      const result = await updateTheme(target);
      if (!result.success) {
        toast.error("Le thème n'a pas pu être changé.");
        return;
      }
      setTheme(target);
      await refreshSession();
      markSeen();
      setPrevious(null);
      toast.success(`Thème « ${label} » rétabli.`);
    });
  };

  return (
    <section
      role="region"
      aria-label="Nouveau look du site"
      className="mx-auto mt-3 flex w-[calc(100%-1.5rem)] max-w-[1232px] flex-wrap items-center gap-3 rounded-bb-lg border border-bb-border bg-bb-surface px-4 py-3 font-bb-sans text-bb-text"
    >
      <Sparkles size={22} className="shrink-0 text-bb-accent-text" aria-hidden="true" />
      <p className="m-0 min-w-0 flex-[1_1_240px] text-[0.95rem] leading-snug">
        <strong>BBFrance fait peau neuve.</strong> Le site passe au thème « Vestiaire ». Vous préférez votre ancien thème, « {label} » ?
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="tap" onClick={goBack} disabled={isPending}>
          Revenir à « {label} »
        </Button>
        <Button type="button" variant="primary" size="tap" onClick={keep} disabled={isPending}>
          Garder le nouveau look
        </Button>
      </div>
    </section>
  );
}
