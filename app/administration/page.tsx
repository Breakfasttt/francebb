import { auth } from "@/auth";
import { getRolePower, ROLE_POWER } from "@/lib/roles";
import { redirect } from "next/navigation";
import "./page.css";

export const dynamic = "force-dynamic";

export default async function AdministrationPage() {
  const session = await auth();
  if (!session?.user?.role || getRolePower(session.user.role) < ROLE_POWER.ADMIN) {
    redirect("/");
  }

  return (
    <main className="container admin-container">
      <header className="page-header">
        <h1>Panneau d'<span>Administration</span></h1>
      </header>
      <div className="admin-content">
        <p>Bienvenue dans l'espace d'administration. Les fonctionnalités arriveront bientôt.</p>
      </div>
    </main>
  );
}
