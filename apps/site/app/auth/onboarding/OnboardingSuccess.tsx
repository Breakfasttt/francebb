"use client";
import { useSession } from "next-auth/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, Card } from "@bbfrance/ui";

/**
 * Écran affiché quand l'inscription est déjà terminée. Refonte (carte 091) : carte et bouton de packages/ui ;
 * la mise à jour de la session et le cookie `onboarding_sync` n'ont pas changé.
 * `callbackUrl` : page où envoyer le membre, déjà vérifiée par la page (adresse du site uniquement, carte 133).
 */
export default function OnboardingSuccess({ callbackUrl }: { callbackUrl: string }) {
  const { update } = useSession();

  const handleEntry = async () => {
    // On force une mise à jour de la session pour être sûr que le JWT a le bon flag
    await update({ hasFinishedOnboarding: true });

    // On pose un cookie temporaire pour aider le middleware à passer outre le JWT obsolète
    document.cookie = "onboarding_sync=true; path=/; max-age=60"; // 60 secondes suffisent

    window.location.href = callbackUrl;
  };

  return (
    <Card className="flex flex-col items-center gap-4 p-6 text-center lg:p-8">
      <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-bb-accent-soft text-bb-success-text">
        <CheckCircle2 size={36} />
      </span>
      <p className="m-0 text-bb-text">Votre profil est configuré avec succès.</p>
      <Button type="button" variant="primary" size="tap" className="w-full sm:w-auto" onClick={handleEntry}>
        Entrer sur le site <ArrowRight size={18} aria-hidden="true" />
      </Button>
    </Card>
  );
}
