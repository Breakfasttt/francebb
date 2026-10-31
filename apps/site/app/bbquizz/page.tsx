/*
 * Page du jeu BBQuizz `/bbquizz` (refonte, carte 098, ADR 0006) : le quizz Blood Bowl et son classement.
 * Réservée aux membres connectés : un visiteur est envoyé vers la connexion, puis ramené ici.
 * L'affichage (accueil du jeu, partie, écran de fin, emplacement du classement) est dans QuizEngine.
 */
import { getActiveSession } from "@/lib/authGuard";
import { redirect } from "next/navigation";
import QuizEngine from "./component/QuizEngine";
import QuizLeaderboard from "./component/QuizLeaderboard";

export const metadata = {
  title: "Quizz Blood Bowl - BBFrance",
  description: "Testez vos connaissances sur l'univers de Blood Bowl.",
};

export default async function QuizPage() {
  const session = await getActiveSession();

  if (!session) {
    redirect("/auth/login?callbackUrl=/bbquizz");
  }

  return <QuizEngine userRole={session.user.role} leaderboard={<QuizLeaderboard />} />;
}
