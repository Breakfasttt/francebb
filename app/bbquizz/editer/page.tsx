/**
 * Page de gestion et édition des questions du Quizz.
 */
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isModerator } from "@/lib/roles";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import EditerContent from "./EditerContent";
import { getAllQuizQuestions } from "../actions";
import "./page.css";
import "./page-mobile.css";

export const metadata = {
  title: "Gestion Quizz - BBFrance",
};

export default async function EditerPage(props: { searchParams: Promise<{ edit?: string }> }) {
  const searchParams = await props.searchParams;
  const editId = searchParams.edit;
  const session = await auth();

  if (!isModerator(session?.user?.role)) {
    redirect("/bbquizz");
  }

  const questions = await getAllQuizQuestions();

  return (
    <main className="container">
      <PageHeader 
        title={editId ? "Édition de question" : "Gestion des questions"} 
        subtitle={editId ? "Modifiez les détails de la question" : "Mise à jour et suppression des questions du Quizz"}
        backHref={editId ? "/bbquizz/editer" : "/bbquizz"}
      />

      <div className="editer-page-layout">
        <EditerContent initialQuestions={questions} />
      </div>
    </main>
  );
}
