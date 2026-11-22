"use client";

/**
 * Retirer l'accord « Toujours afficher les contenus Twitch » (mentions légales, section Cookies). Le choix est gardé
 * dans ce navigateur seulement : le bouton dit s'il est donné, et le retire. Les cadres Twitch déjà affichés sur une
 * autre page redemanderont l'accord à leur prochain affichage.
 */
import { useEffect, useState } from "react";
import { Button, toast } from "@bbfrance/ui";
import { TWITCH_CONSENT_EVENT, TWITCH_CONSENT_KEY, isTwitchConsentValid } from "@/lib/twitchEmbed";
import { setTwitchConsent } from "@/common/components/TwitchEmbed/TwitchEmbed";

export default function TwitchConsentReset() {
  const [given, setGiven] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        setGiven(isTwitchConsentValid(window.localStorage.getItem(TWITCH_CONSENT_KEY)));
      } catch {
        setGiven(false);
      }
    };
    read();
    window.addEventListener(TWITCH_CONSENT_EVENT, read);
    return () => window.removeEventListener(TWITCH_CONSENT_EVENT, read);
  }, []);

  if (!given) {
    return <p>Tu n&apos;as pas demandé l&apos;affichage automatique des contenus Twitch sur ce navigateur.</p>;
  }
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <p className="!mb-0">Les contenus Twitch s&apos;affichent automatiquement sur ce navigateur.</p>
      <Button
        type="button"
        variant="secondary"
        size="tap"
        onClick={() => {
          setTwitchConsent(false);
          toast.success("Les contenus Twitch te demanderont de nouveau ton accord.");
        }}
      >
        Ne plus afficher Twitch automatiquement
      </Button>
    </div>
  );
}
