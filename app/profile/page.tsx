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
    <main className="container" style={{ position: 'relative' }}>
      <Link href="/" className="back-button" title="Retour à l'accueil">
        <ArrowLeft size={24} />
      </Link>
      
      <div className="premium-card" style={{ padding: '3rem', maxWidth: '600px', margin: '2rem auto' }}>
        <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Mon Compte</h1>
        <ProfileForm user={session.user} />
      </div>
    </main>
  );
}
