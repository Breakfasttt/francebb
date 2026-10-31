/**
 * Annuaire des membres `/membres` (refonte, carte 092, ADR 0006), réservé aux membres connectés. La page serveur lit
 * les membres (bannis compris pour un modérateur), les ligues, les régions et les libellés des rôles ; la recherche,
 * les filtres, le tri et la pagination se font dans le navigateur (`MembersTable`), comme avant la refonte.
 */
import MembersTable from "@/app/membres/component/MembersTable";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { getRoleLabelMap } from "@/lib/roleLabels";
import { isModerator, UserRole } from "@/lib/roles";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const session = await getActiveSession();

  // 1. Authentification
  if (!session?.user) redirect("/auth/login?callbackUrl=/membres");

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

  // 4. Récupérer tous les utilisateurs avec leurs ligues et région
  const allUsers = await prisma.user.findMany({
    where: showBanned ? undefined : { isBanned: false },
    include: {
      ligues: { select: { id: true, name: true, acronym: true } }
    },
    orderBy: { name: 'asc' }
  });

  // 5. Récupérer les données de filtrage et les libellés lisibles des rôles (rôles personnalisés compris)
  const [allLigues, allRegions, roleLabels] = await Promise.all([
    prisma.ligue.findMany({
      select: { id: true, name: true, acronym: true },
      orderBy: { acronym: 'asc' }
    }),
    prisma.referenceData.findMany({
      where: { group: 'COACH_REGION', isActive: true },
      orderBy: { order: 'asc' }
    }),
    getRoleLabelMap(),
  ]);

  return (
    <div className="mx-auto w-full max-w-[1232px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ForumListHeader
        title="Membres"
        subtitle={`Annuaire des coachs de la communauté : ${allUsers.length} membre${allUsers.length > 1 ? "s" : ""}`}
        backHref="/"
        backTitle="Retour à l'accueil"
      />

      <MembersTable
        users={allUsers.map((u) => ({ ...u, name: u.name ?? "" }))}
        currentUserRole={me.role as UserRole}
        currentUserId={session.user.id}
        allLigues={allLigues}
        allRegions={allRegions}
        roleLabels={roleLabels}
      />
    </div>
  );
}
