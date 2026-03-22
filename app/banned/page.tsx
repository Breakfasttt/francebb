import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Ban } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BannedPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isBanned: true, banReason: true }
  });

  if (!user?.isBanned) {
    redirect("/");
  }

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="premium-card" style={{ maxWidth: '600px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '50%', color: '#ef4444' }}>
            <Ban size={48} />
          </div>
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#f87171' }}>Compte Banni</h1>
        <p style={{ fontSize: '1.1rem', color: '#aaa', marginBottom: '2rem' }}>
          Votre compte a été suspendu par l'équipe de modération. Vous ne pouvez plus accéder aux fonctionnalités du site.
        </p>
        
        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'left' }}>
          <h3 style={{ marginTop: 0, marginBottom: '0.8rem', color: '#eee', fontSize: '1rem' }}>Raison du bannissement :</h3>
          <p style={{ margin: 0, color: '#ffaaaa', fontStyle: 'italic', lineHeight: 1.6 }}>
            "{user.banReason || "Raison non spécifiée."}"
          </p>
        </div>

        <Link 
          href="/"
          className="submit-button"
          style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
