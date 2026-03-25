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

// ---- CUSTOM ROLES MANAGEMENT ----

export async function getAllRoles() {
  const roles = await prisma.roleConfig.findMany({
    orderBy: { power: "desc" },
    include: {
      _count: { select: { users: true } }
    }
  });
  return roles;
}

export async function createCustomRole(data: { name: string, label: string, power: number }) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const myPower = getRolePower(userRole);

  if (!userRole || myPower < ROLE_POWER.ADMIN) {
    return { success: false, error: "Non autorisé." };
  }

  if (data.power >= myPower && userRole !== "SUPERADMIN") {
    return { success: false, error: "Vous ne pouvez pas créer un rôle plus puissant ou égal au vôtre." };
  }

  // Format ID from name
  const safeName = data.name.toUpperCase().replace(/[^A-Z0-9_]/g, "_");

  const exists = await prisma.roleConfig.findUnique({ where: { name: safeName } });
  if (exists) return { success: false, error: "Ce rôle existe déjà." };

  await prisma.roleConfig.create({
    data: {
      name: safeName,
      label: data.label,
      power: data.power,
      isBaseRole: false
    }
  });

  return { success: true };
}

export async function deleteCustomRole(roleName: string) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) {
    return { success: false, error: "Non autorisé." };
  }

  const roleConfig = await prisma.roleConfig.findUnique({ 
    where: { name: roleName },
    include: { _count: { select: { users: true } } }
  });

  if (!roleConfig) return { success: false, error: "Role introuvable." };
  if (roleConfig.isBaseRole) return { success: false, error: "Impossible de supprimer un rôle de base." };

  const myPower = getRolePower(userRole);
  if (roleConfig.power >= myPower && userRole !== "SUPERADMIN") {
    return { success: false, error: "Impossible de supprimer un rôle de rang supérieur ou égal." };
  }

  // Re-assign users to COACH
  if (roleConfig._count.users > 0) {
    await prisma.user.updateMany({
      where: { role: roleName },
      data: { role: "COACH" }
    });
  }

  await prisma.roleConfig.delete({ where: { name: roleName } });

  return { success: true };
}
