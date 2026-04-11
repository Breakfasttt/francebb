/**
 * Page de validation des suggestions de questions (Modération).
 */
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isModerator } from "@/lib/roles";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import ValiderContent from "./ValiderContent";
import { getQuizSuggestions } from "../actions";
import "./page.css";
import "./page-mobile.css";

export const metadata = {
  title: "Validation Quizz - BBFrance",
};

export default async function ValiderPage() {
  const session = await auth();

  if (!isModerator(session?.user?.role)) {
    redirect("/bbquizz");
  }

  const suggestions = await getQuizSuggestions();

  return (
    <main className="container">
      <PageHeader 
        title="Validation des questions" 
        subtitle="Modération des propositions de la communauté"
        backHref="/bbquizz"
      />

      <div className="valider-page-layout">
        <ValiderContent initialSuggestions={suggestions} />
      </div>
    </main>
  );
}
