/**
 * Page de validation des suggestions de questions (Modération).
 */
import { getActiveSession } from "@/lib/authGuard";
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
  const session = await getActiveSession();

  if (!isModerator(session?.user?.role)) {
    redirect("/bbquizz");
  }

  const suggestions = await getQuizSuggestions();

  return (
    <div className="valider-page-wrapper">
      <PageHeader 
        title="Validation des questions" 
        subtitle="Modération des propositions de la communauté"
      />

      <main className="container">

      <div className="valider-page-layout">
        <ValiderContent initialSuggestions={suggestions} />
      </div>
      </main>
    </div>
  );
}
