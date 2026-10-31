/**
 * Proposition d'une question `/bbquizz/proposer` (refonte, carte 098) : écran de saisie plein écran sur téléphone
 * (`ComposeScreen`, sans la barre de navigation du bas : voir `isComposePath`), avec la barre d'envoi collée en bas.
 * Réservée aux membres connectés ; la question proposée attend la validation d'un modérateur (`/bbquizz/valider`).
 */
import { getActiveSession } from "@/lib/authGuard";
import { redirect } from "next/navigation";
import ComposeScreen from "@/app/forum/component/ComposeScreen";
import ProposerContent from "./ProposerContent";

export const metadata = {
  title: "Proposer une question - Quizz Blood Bowl",
};

export default async function ProposerPage() {
  const session = await getActiveSession();

  if (!session) {
    redirect("/auth/login?callbackUrl=/bbquizz/proposer");
  }

  return (
    <ComposeScreen
      title="Proposer une question"
      subtitle="Contribuez au Quizz Blood Bowl : votre question sera relue par la modération."
      backHref="/bbquizz"
      backTitle="Retour au quizz"
    >
      <ProposerContent />
    </ComposeScreen>
  );
}
