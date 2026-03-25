"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getRolePower, ROLE_POWER } from "@/lib/roles";

export async function resetDatabase(phrase: string) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!userRole || getRolePower(userRole) < ROLE_POWER.SUPERADMIN) {
    throw new Error("Accès refusé. Seul un SUPERADMIN peut détruire le site.");
  }
  
  if (phrase !== "JE COMPRENDS LES RISQUES") {
    return { success: false, error: "Phrase de sécurité invalide." };
  }

  try {
    await prisma.$transaction([
      prisma.postReaction.deleteMany(),
      prisma.mention.deleteMany(),
      prisma.topicView.deleteMany(),
      prisma.privateMessage.deleteMany(),
      prisma.conversation.deleteMany(),
      prisma.post.deleteMany(),
      prisma.topic.deleteMany(),
      prisma.forum.deleteMany(),
      prisma.category.deleteMany(),
      prisma.tournament.deleteMany(),
      prisma.user.deleteMany({
        where: { role: { not: "SUPERADMIN" } }
      })
    ]);

    // On recrée la structure minimale pour que le front ne crash pas
    const defaultCat = await prisma.category.create({
      data: { name: "Archives d'un Monde Déchu", order: 1 }
    });
    
    await prisma.forum.create({
      data: { name: "Vestiges", categoryId: defaultCat.id, description: "Survivre après l'apocalypse." }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Factory Reset Error:", error);
    return { success: false, error: error.message || "Erreur critique de la BDD." };
  }
}

export async function searchCoaches(query: string = "") {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      name: { contains: query }
    },
    take: 50,
    orderBy: { name: "asc" }
  });

  return users;
}

export async function updateCoachRole(targetUserId: string, newRole: string) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!userRole || getRolePower(userRole) < ROLE_POWER.MODERATOR) {
    return { success: false, error: "Non autorisé." };
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId }});
  if (!targetUser) return { success: false, error: "Utilisateur inconnu." };

  const targetRolePower = getRolePower(targetUser.role);
  const myPower = getRolePower(userRole);
  const newRolePower = getRolePower(newRole);

  // Vérifications
  if (myPower <= targetRolePower && userRole !== "SUPERADMIN") {
    return { success: false, error: "Impossible de modifier un utilisateur de rang supérieur ou égal." };
  }
  if (myPower <= newRolePower && userRole !== "SUPERADMIN") {
    return { success: false, error: "Vous ne pouvez pas donner un rôle supérieur ou égal au vôtre." };
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole }
  });

  return { success: true };
}
