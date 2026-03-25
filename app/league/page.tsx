import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default async function LeaguesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login?callback=/league");

  return (
    <main className="container">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href="/" className="back-button" title="Retour à l'accueil" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield size={32} className="text-secondary" />
          <h1 style={{ margin: 0 }}>Ligues</h1>
        </div>
      </header>

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
