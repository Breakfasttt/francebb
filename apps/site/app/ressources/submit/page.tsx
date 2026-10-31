/**
 * Proposition d'une ressource `/ressources/submit` (refonte, carte 096) : écran de rédaction plein écran sur téléphone
 * (`ComposeScreen`, sans la barre de navigation du bas), avec la barre d'envoi collée en bas de l'écran.
 * La ressource proposée reste invisible jusqu'à sa validation par la modération. Comme avant la refonte, la page
 * s'ouvre sans connexion ; c'est l'action serveur `submitResource` qui refuse l'envoi d'un visiteur.
 */
import ComposeScreen from "@/app/forum/component/ComposeScreen";
import ResourceForm from "@/app/ressources/component/ResourceForm";

export default function SubmitResourcePage() {
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
