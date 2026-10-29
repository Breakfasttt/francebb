/**
 * Page de proposition de question pour le Quizz.
 */
import { getActiveSession } from "@/lib/authGuard";
import { redirect } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import ProposerContent from "./ProposerContent";
import "./page.css";
import "./page-mobile.css";

export const metadata = {
  title: "Proposer une question - Quizz Blood Bowl",
};

export default async function ProposerPage() {
  const session = await getActiveSession();

  if (!session) {
    redirect("/auth/login?callbackUrl=/bbquizz/proposer");
  }

  return (
    <div className="proposer-page-wrapper">
      <PageHeader 
        title="Proposer une question" 
        subtitle="Contribuez à l'encyclopédie du Quizz Blood Bowl"
      />

      <main className="container">

      <div className="proposer-page-layout">
        <ProposerContent />
      </div>
    </main>
    </div>
  );
}
