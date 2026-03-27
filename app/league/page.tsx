import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import BackButton from "@/common/components/BackButton/BackButton";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { ArrowLeft, Shield } from "lucide-react";

export default async function LeaguesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login?callback=/league");

  return (
    <main className="container">
      <PageHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={32} className="text-secondary" />
            <span>Ligues</span>
          </div>
        }
        backHref="/"
        backTitle="Retour à l'accueil"
      />

      <div className="premium-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Espace Ligues</h2>
        <p style={{ color: '#888' }}>
          Cette section est en cours de développement.<br/>
          Bientôt, vous pourrez gérer vos ligues, voir les classements et organiser vos matchs ici !
        </p>
      </div>
    </main>
  );
}
