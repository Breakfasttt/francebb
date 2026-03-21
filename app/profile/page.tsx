import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const session = await auth();
  const { id } = await searchParams;

  let user = null;
  let isOwnProfile = false;

  if (id) {
    user = await prisma.user.findUnique({ where: { id } });
    isOwnProfile = session?.user?.id === id;
  } else if (session?.user) {
    user = session.user;
    isOwnProfile = true;
  }

  if (!user) {
    if (!session) redirect("/");
    user = session.user;
    isOwnProfile = true;
  }

  return (
    <main className="container">
      <div className="premium-card" style={{ padding: '3rem', maxWidth: '600px', margin: '2rem auto' }}>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
          <Link href="/" className="back-button" title="Retour à l'accueil" style={{ position: 'absolute', left: 0 }}>
            <ArrowLeft size={24} />
          </Link>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>
            {isOwnProfile ? "Mon Compte" : `Profil de ${user.name}`}
          </h1>
        </div>

        {isOwnProfile ? (
          <ProfileForm user={user} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            {user.image && (
              <img 
                src={user.image} 
                alt={user.name || ""} 
                style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid var(--primary)', padding: '4px' }} 
              />
            )}
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>{user.name}</h2>
              <p style={{ color: '#aaa', margin: 0 }}>Membre de BBFrance</p>
              <div style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                Rôle: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{user.role || "COACH"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
