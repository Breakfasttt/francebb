/**
 * Gestion des questions du quizz `/bbquizz/editer` (refonte, carte 098), réservée à la modération : la liste des
 * questions avec une recherche, « Éditer » et « Supprimer ». `?edit=<identifiant>` ouvre le formulaire de modification
 * de cette question (adresse inchangée par la refonte) ; un identifiant inconnu ramène à la liste.
 * Les deux vues sont des écrans plein écran sur téléphone (`ComposeScreen`, sans la barre de navigation du bas : voir
 * `isComposePath`, qui ne lit que le chemin de l'adresse et ne peut donc pas distinguer la liste du formulaire).
 */
import { getActiveSession } from "@/lib/authGuard";
import { redirect } from "next/navigation";
import { isModerator } from "@/lib/roles";
import ComposeScreen from "@/app/forum/component/ComposeScreen";
import EditerContent from "./EditerContent";
import EditQuestion from "./EditQuestion";
import { getAllQuizQuestions } from "../actions";

export const metadata = {
  title: "Gestion Quizz - BBFrance",
};

export default async function EditerPage(props: { searchParams: Promise<{ edit?: string }> }) {
  const searchParams = await props.searchParams;
  const editId = searchParams.edit;
  const session = await getActiveSession();

  if (!isModerator(session?.user?.role)) {
    redirect("/bbquizz");
  }

  const questions = await getAllQuizQuestions();
  const editing = editId ? questions.find((question) => question.id === editId) : undefined;

  if (editing) {
    return (
      <ComposeScreen
        title="Modifier une question"
        subtitle="La modification compte dès la prochaine partie."
        backHref="/bbquizz/editer"
        backTitle="Retour à la liste des questions"
      >
        <EditQuestion
          key={editing.id}
          question={{
            id: editing.id,
            category: editing.category,
            question: editing.question,
            options: JSON.parse(editing.options),
            correctIndex: editing.correctIndex,
            explanation: editing.explanation || "",
          }}
        />
      </ComposeScreen>
    );
  }

  return (
    <ComposeScreen
      title="Gestion des questions"
      subtitle={`${questions.length} question${questions.length > 1 ? "s" : ""} dans le quizz : recherche, modification et suppression.`}
      backHref="/bbquizz"
      backTitle="Retour au quizz"
    >
      <EditerContent
        initialQuestions={questions.map((question) => ({ id: question.id, category: question.category, question: question.question }))}
      />
    </ComposeScreen>
  );
}
