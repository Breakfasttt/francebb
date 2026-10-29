/*
 * BbQuizz main page
 * Entry point for the Blood Bowl Quiz minigame.
 */
import { getActiveSession } from "@/lib/authGuard";
import { redirect } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import QuizEngine from "./component/QuizEngine/QuizEngine";
import QuizLeaderboard from "./component/QuizLeaderboard/QuizLeaderboard";
import "./page.css";
import "./page-mobile.css";

export const metadata = {
  title: "Quizz Blood Bowl - BBFrance",
  description: "Testez vos connaissances sur l'univers de Blood Bowl.",
};

export default async function QuizPage() {
  const session = await getActiveSession();

  if (!session) {
    redirect("/auth/login?callbackUrl=/bbquizz");
  }

  return (
    <div className="bbquizz-page">
      <PageHeader 
        title="Quizz Blood Bowl" 
        subtitle="Devenez une encyclopédie vivante de la NAF"
      />

      <main className="container">

      <div className="quiz-page-layout">
        <section className="quiz-main-section">
          <QuizEngine userRole={session.user.role} />
        </section>

        <aside className="quiz-sidebar">
          <div className="sidebar-header">
            <h2>Classement</h2>
          </div>
          <QuizLeaderboard />
        </aside>
      </div>
    </main>
    </div>
  );
}
