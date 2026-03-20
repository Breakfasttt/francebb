import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="container">
      <div className="premium-card" style={{ padding: '3rem', maxWidth: '600px', margin: '2rem auto' }}>
        <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Mon Compte</h1>
        <ProfileForm user={session.user} />
      </div>
    </main>
  );
}
