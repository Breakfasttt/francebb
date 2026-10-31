"use client";

/**
 * Générateur d'avatar DiceBear (DiceBear est un service en ligne qui dessine un avatar à partir d'un mot, la
 * « graine », et d'un style). Partagé par l'inscription (`app/auth/onboarding/OnboardingForm.tsx`, carte 091) et
 * l'édition du profil (`app/profile/component/ProfileEdit.tsx`, carte 092), qui avaient chacune leur copie.
 *
 * - `AvatarGeneratorSheet` : panneau qui monte du bas sur téléphone, fenêtre centrée sur ordinateur. On choisit la
 *   graine et le style, l'aperçu se met à jour, puis « Confirmer » renvoie l'adresse de l'image au parent.
 * - `dicebearUrl` et `randomDicebearUrl` : l'adresse d'un avatar choisi, ou d'un avatar tiré au hasard (bouton
 *   « Aléatoire »).
 */
import { useState } from "react";
import { Button, DESKTOP_QUERY, Field, Input, Sheet, SheetContent, useMediaQuery } from "@bbfrance/ui";

export const DICEBEAR_STYLES = [
  { id: "adventurer", label: "Aventurier" },
  { id: "avataaars", label: "Moderne" },
  { id: "bottts", label: "Robot" },
  { id: "fun-emoji", label: "Smiley" },
  { id: "lorelei", label: "Lorelei" },
  { id: "open-peeps", label: "Minimaliste" },
  { id: "personas", label: "Humain" },
  { id: "pixel-art", label: "Pixel Art" },
];

/** Adresse de l'image DiceBear pour un style et une graine. */
export function dicebearUrl(style: string, seed: string): string {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
}

/** Adresse d'un avatar tiré au hasard : style et graine aléatoires. */
export function randomDicebearUrl(): string {
  const style = DICEBEAR_STYLES[Math.floor(Math.random() * DICEBEAR_STYLES.length)].id;
  const seed = Math.random().toString(36).substring(7);
  return dicebearUrl(style, seed);
}

export default function AvatarGeneratorSheet({
  open,
  onOpenChange,
  initialSeed,
  seedInputId,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Graine proposée à l'ouverture (le pseudo du membre). */
  initialSeed: string;
  /** Identifiant du champ « Graine », unique dans la page. */
  seedInputId: string;
  /** Reçoit l'adresse de l'avatar choisi ; le panneau se ferme ensuite. */
  onApply: (url: string) => void;
}) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [seed, setSeed] = useState(initialSeed);
  const [style, setStyle] = useState("avataaars");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Générateur d'avatar" side={isDesktop ? "center" : "bottom"}>
        <div className="flex flex-col gap-4 pt-2 pb-2">
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- image générée par le service DiceBear */}
            <img
              src={dicebearUrl(style, seed)}
              alt="Aperçu de l'avatar"
              width={120}
              height={120}
              className="size-[120px] rounded-bb-md bg-bb-surface-2"
            />
          </div>
          <Field label="Graine" htmlFor={seedInputId} hint="Un mot ou un nom : la même graine donne toujours le même avatar.">
            <Input id={seedInputId} type="text" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="Ex : Grumbly" />
          </Field>
          <div role="group" aria-label="Style de l'avatar" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DICEBEAR_STYLES.map((s) => (
              <Button
                key={s.id}
                type="button"
                variant="secondary"
                size="tap"
                aria-pressed={style === s.id}
                onClick={() => setStyle(s.id)}
                className={style === s.id ? "border-bb-accent-text bg-bb-accent-soft" : ""}
              >
                {s.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-2 lg:flex-row-reverse">
            <Button
              type="button"
              variant="primary"
              size="tap"
              className="w-full lg:w-auto"
              onClick={() => {
                onApply(dicebearUrl(style, seed));
                onOpenChange(false);
              }}
            >
              Confirmer
            </Button>
            <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
