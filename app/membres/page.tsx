import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isModerator, UserRole } from "@/lib/roles";
import MembersTable from "@/app/membres/component/MembersTable";
import Link from "next/link";
import BackButton from "@/common/components/BackButton/BackButton";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { ArrowLeft, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const session = await auth();

  // 1. Authentification
  if (!session?.user) redirect("/auth/login?callback=/membres");

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
      <PageHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Users size={32} className="text-secondary" />
            <span>Membres</span>
          </div>
        }
        backHref="/"
        backTitle="Retour à l'accueil"
      />

      <MembersTable users={allUsers} currentUserRole={me.role as UserRole} currentUserId={session.user.id} />
    </main>
  );
}
