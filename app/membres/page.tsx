import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isModerator, UserRole } from "@/lib/roles";
import MembersTable from "@/app/membres/component/MembersTable";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const session = await auth();

  // 1. Authentification
  if (!session?.user) redirect("/");

  // 2. Récupérer le rôle complet depuis la DB
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isBanned: true }
  });

  if (!me) {
    redirect("/");
  }

  if (me.isBanned) {
    redirect("/banned");
  }

  // 3. Vérification des permissions
  const showBanned = isModerator(me.role as UserRole);

  // 4. Récupérer tous les utilisateurs
  const allUsers = await prisma.user.findMany({
    where: showBanned ? undefined : { isBanned: false },
    orderBy: { name: 'asc' }
  });

  return (
    <main className="container">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href="/" className="back-button" title="Retour à l'accueil" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Users size={32} className="text-secondary" />
          <h1 style={{ margin: 0 }}>Membres</h1>
        </div>
      </header>

      <MembersTable users={allUsers} currentUserRole={me.role as UserRole} currentUserId={session.user.id} />
    </main>
  );
}
