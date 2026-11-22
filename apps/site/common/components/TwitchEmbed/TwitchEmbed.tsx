"use client";

/**
 * Lecteur Twitch avec accord préalable (RGPD) : à la place du lecteur, un cadre 16/9 dit que le contenu est diffusé
 * par Twitch, qui dépose ses propres cookies. Le lecteur ne se charge qu'après « Afficher » ; la case « Toujours
 * afficher les contenus Twitch » garde l'accord 6 mois dans le navigateur et l'applique à tous les cadres de la page.
 * Ne rien faire vaut refus : le lien « Voir sur Twitch » reste disponible. Règles et adresses : `lib/twitchEmbed.ts`.
 * Utilisé par la page `/media` et par la balise BBCode `[twitch]` (élément `bb-twitch` monté par `BBCodeContent`).
 */
import { useEffect, useState } from "react";
import { ExternalLink, Twitch } from "lucide-react";
import { Button, cn } from "@bbfrance/ui";
import {
  TWITCH_CONSENT_EVENT, TWITCH_CONSENT_KEY, isTwitchConsentValid, twitchPageUrl, twitchPlayerUrl, type TwitchTarget,
} from "@/lib/twitchEmbed";

const KIND_LABEL = { channel: "Direct", video: "Vidéo", clip: "Clip" } as const;

function readConsent(): boolean {
  try {
    return isTwitchConsentValid(window.localStorage.getItem(TWITCH_CONSENT_KEY));
  } catch {
    return false;
  }
}

/** Enregistre ou retire l'accord « Toujours afficher » et prévient les autres cadres de la page. */
export function setTwitchConsent(always: boolean) {
  try {
    if (always) window.localStorage.setItem(TWITCH_CONSENT_KEY, new Date().toISOString());
    else window.localStorage.removeItem(TWITCH_CONSENT_KEY);
  } catch {
    // Stockage bloqué (navigation privée) : l'accord vaut pour cet affichage seulement
  }
  window.dispatchEvent(new Event(TWITCH_CONSENT_EVENT));
}

export default function TwitchEmbed({
  target,
  title,
  showPageLink = true,
  className,
}: {
  target: TwitchTarget;
  title?: string;
  /** Faux quand la page affiche déjà son propre lien vers Twitch (cartes de `/media`). */
  showPageLink?: boolean;
  /** Classes du cadre (par exemple sans bordure ni arrondi dans une carte). */
  className?: string;
}) {
  const [shown, setShown] = useState(false);
  const [always, setAlways] = useState(false);

  useEffect(() => {
    const sync = () => {
      if (readConsent()) setShown(true);
    };
    sync();
    window.addEventListener(TWITCH_CONSENT_EVENT, sync);
    return () => window.removeEventListener(TWITCH_CONSENT_EVENT, sync);
  }, []);

  const name = title ?? `${KIND_LABEL[target.kind]} Twitch : ${target.id}`;

  if (shown) {
    return (
      <div className={cn("relative aspect-video w-full overflow-hidden rounded-bb-md bg-bb-surface-2", className)}>
        <iframe
          src={twitchPlayerUrl(target, window.location.hostname)}
          title={name}
          className="absolute inset-0 size-full border-0"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={cn("flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-bb-md border border-bb-border bg-bb-surface-2 p-4 text-center font-bb-sans text-bb-text", className)}>
      <Twitch size={28} aria-hidden="true" className="text-bb-text-muted" />
      <p className="m-0 font-semibold">{name}</p>
      <p className="m-0 max-w-sm text-sm text-bb-text-muted">
        Ce contenu est diffusé par Twitch, qui dépose ses propres cookies quand il s&apos;affiche.
      </p>
      <Button
        type="button"
        variant="secondary"
        size="tap"
        onClick={() => {
          if (always) setTwitchConsent(true);
          setShown(true);
        }}
      >
        Afficher le contenu Twitch
      </Button>
      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-bb-text-muted">
        <input type="checkbox" checked={always} onChange={(event) => setAlways(event.target.checked)} className="size-4 accent-[var(--bb-accent)]" />
        Toujours afficher les contenus Twitch
      </label>
      {showPageLink && <a href={twitchPageUrl(target)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-bb-accent-text">
        Voir sur Twitch <ExternalLink size={14} aria-hidden="true" />
      </a>}
    </div>
  );
}
