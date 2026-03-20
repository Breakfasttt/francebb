import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="container">
      <div className="premium-card" style={{ padding: '3rem', maxWidth: '600px', margin: '2rem auto' }}>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
          <Link href="/" className="back-button" title="Retour à l'accueil" style={{ position: 'absolute', left: 0 }}>
            <ArrowLeft size={24} />
          </Link>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Mon Compte</h1>
        </div>
        <ProfileForm user={session.user} />
      </div>
    </main>
  );
}
