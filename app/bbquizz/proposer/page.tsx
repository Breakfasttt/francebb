/**
 * Page de proposition de question pour le Quizz.
 */
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import ProposerContent from "./ProposerContent";
import "./page.css";
import "./page-mobile.css";

export const metadata = {
  title: "Proposer une question - Quizz Blood Bowl",
};

export default async function ProposerPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin?callbackUrl=/bbquizz/proposer");
  }

  return (
    <main className="container">
      <PageHeader 
        title="Proposer une question" 
        subtitle="Contribuez à l'encyclopédie du Quizz Blood Bowl"
        backHref="/bbquizz"
      />

      <div className="proposer-page-layout">
        <ProposerContent />
      </div>
    </main>
  );
}
