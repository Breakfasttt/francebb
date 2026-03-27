import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { redirect } from "next/navigation";
import "./page.css";
import PageHeader from "@/common/components/PageHeader/PageHeader";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const session = await auth();
  if (!session?.user?.role || !isModerator(session.user.role)) {
    redirect("/");
  }

  return (
    <main className="container moderation-container">
      <PageHeader
        title={<>Panneau de <span>Modération</span></>}
      />
      <div className="moderation-content">
        <p>Bienvenue dans l'espace de modération. Les fonctionnalités arriveront bientôt.</p>
      </div>
    </main>
  );
}
