import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { redirect } from "next/navigation";
import "./page.css";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const session = await auth();
  if (!session?.user?.role || !isModerator(session.user.role)) {
    redirect("/");
  }

  return (
    <main className="container moderation-container">
      <header className="page-header">
        <h1>Panneau de <span>Modération</span></h1>
      </header>
      <div className="moderation-content">
        <p>Bienvenue dans l'espace de modération. Les fonctionnalités arriveront bientôt.</p>
      </div>
    </main>
  );
}
