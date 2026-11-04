/**
 * Validation des questions proposées `/bbquizz/valider` (refonte, carte 098), réservée à la modération : chaque
 * proposition en attente montre sa question, ses quatre réponses (la bonne est marquée) et son explication, avec
 * « Approuver » (la question entre dans le jeu) et « Rejeter ».
 */
import { getActiveSession } from "@/lib/authGuard";
import { redirect } from "next/navigation";
import { isModerator } from "@/lib/roles";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import ValiderContent from "./ValiderContent";
import { getQuizSuggestions } from "../actions";

export const metadata = {
  title: "Validation Quizz - BBFrance",
};

export default async function ValiderPage() {
  const session = await getActiveSession();

  if (!isModerator(session?.user?.role)) {
    redirect("/bbquizz");
  }

  const suggestions = await getQuizSuggestions();

  return (
    <div className="mx-auto w-full max-w-[900px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ForumListHeader
        title="Validation des questions"
        subtitle="Les questions proposées par la communauté, en attente de relecture."
        backHref="/bbquizz"
        backTitle="Retour au quizz"
      />
      <ValiderContent
        initialSuggestions={suggestions.map((s) => ({
          id: s.id,
          category: s.category,
          question: s.question,
          options: JSON.parse(s.options) as string[],
          correctIndex: s.correctIndex,
          explanation: s.explanation,
          authorName: s.author.name,
          createdAt: s.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
