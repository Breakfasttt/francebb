/**
 * Proposition d'une ressource `/ressources/submit` (refonte, carte 096) : écran de rédaction plein écran sur téléphone
 * (`ComposeScreen`, sans la barre de navigation du bas), avec la barre d'envoi collée en bas de l'écran.
 * La ressource proposée reste invisible jusqu'à sa validation par la modération.
 * Carte 141 : un visiteur non connecté est envoyé vers la connexion (avec l'adresse de retour dans `callbackUrl`)
 * avant de remplir le formulaire ; l'action serveur `submitResource` refuse toujours, elle aussi, l'envoi d'un visiteur.
 */
import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/authGuard";
import ComposeScreen from "@/app/forum/component/ComposeScreen";
import ResourceForm from "@/app/ressources/component/ResourceForm";

export default async function SubmitResourcePage() {
  const session = await getActiveSession();
  if (!session) redirect(`/auth/login?callbackUrl=${encodeURIComponent("/ressources/submit")}`);

  return (
    <ComposeScreen
      title="Soumettre une ressource"
      subtitle="Partagez un outil, un guide ou une aide de jeu avec la communauté."
      backHref="/ressources"
      backTitle="Retour aux ressources"
    >
      <ResourceForm />
    </ComposeScreen>
  );
}
