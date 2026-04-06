"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getRolePower, ROLE_POWER } from "@/lib/roles";
import { logModerationAction } from "@/app/moderation/actions";

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

export async function searchCoaches(query: string = "", page: number = 1, pageSize: number = 20) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) {
    return { users: [], totalPages: 0 };
  }

  const skip = (page - 1) * pageSize;

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: {
        name: { contains: query }
      },
      take: pageSize,
      skip,
      orderBy: { name: "asc" }
    }),
    prisma.user.count({ 
      where: { name: { contains: query } } 
    })
  ]);

  return { 
    users, 
    totalPages: Math.ceil(totalCount / pageSize) 
  };
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

  await logModerationAction(
    "USER_ROLE_CHANGED",
    targetUserId,
    "USER",
    `Changement de rôle : ${targetUser.role} -> ${newRole}`
  );

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

export async function createCustomRole(data: { name: string, label: string, color: string, power: number }) {
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
      color: data.color || "#888888",
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

export async function reorderRoles(orderedNames: string[]) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) {
    return { success: false, error: "Non autorisé." };
  }

  // Interdire explicitement tout changement d'ordre des rôles de base, on se base sur eux comme ancres.
  const roles = await prisma.roleConfig.findMany();
  
  // Organiser en map pour un accès rapide
  const roleMap = new Map(roles.map(r => [r.name, r]));

  // Recréer une liste complète des rôles dans le bon ordre en insérant les manquants à la fin par défaut
  let validOrder = orderedNames.map(n => roleMap.get(n)).filter(Boolean) as any[];

  // Validation: aucun rôle custom ne peut être au-dessus de MODERATOR dans la nouvelle liste.
  // Modérateur a le power 70. RTC a le power 50.
  let modIndex = validOrder.findIndex(r => r.name === "MODERATOR");
  if (modIndex !== -1) {
    const customRolesAboveMod = validOrder.slice(0, modIndex).filter(r => !r.isBaseRole);
    if (customRolesAboveMod.length > 0) {
      return { success: false, error: "Impossible de déplacer un rôle personnalisé au dessus de Modérateur." };
    }
  }

  // Redistribution des puissances (powers).
  // On trouve les intervalles entre les rôles de base, et on répartit la puissance des rôles customs.
  const updates = [];
  
  let currentBasePower = 100; // Power initial absurde avant SUPERADMIN
  let currentGroupCustoms: string[] = [];
  
  // On itère du haut vers le bas (descendant)
  for (let i = 0; i < validOrder.length; i++) {
    const role = validOrder[i];
    
    if (role.isBaseRole) {
      // On vient de taper un rôle de base. 
      // Si on avait des customs en attente d'attribution de power, on doit les étaler entre currentBasePower et role.power
      if (currentGroupCustoms.length > 0) {
        const span = currentBasePower - role.power;
        const step = Math.floor(span / (currentGroupCustoms.length + 1));
        
        for (let j = 0; j < currentGroupCustoms.length; j++) {
          const newPower = currentBasePower - (step * (j + 1));
          updates.push({ name: currentGroupCustoms[j], power: newPower });
        }
        currentGroupCustoms = [];
      }
      currentBasePower = role.power;
    } else {
      currentGroupCustoms.push(role.name);
    }
  }

  // S'il reste des customs en dessous du dernier rôle de base (COACH = 10)
  if (currentGroupCustoms.length > 0) {
    const span = currentBasePower - 0; // Puissance minimum absolue = 0
    const step = Math.floor(span / (currentGroupCustoms.length + 1));
    for (let j = 0; j < currentGroupCustoms.length; j++) {
      const newPower = currentBasePower - (step * (j + 1));
      updates.push({ name: currentGroupCustoms[j], power: Math.max(0, newPower) });
    }
  }

  // Appliquer les changements
  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map(u => prisma.roleConfig.update({
        where: { name: u.name },
        data: { power: u.power }
      }))
    );
  }

  return { success: true };
}

// ---- FORUM STRUCTURE MANAGEMENT ----

export async function getForumStructure() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) return [];

  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      forums: {
        where: { parentForumId: null }, // Only root forums of this category
        orderBy: { order: 'asc' },
        include: {
          subForums: {
            orderBy: { order: 'asc' },
            include: {
              subForums: { orderBy: { order: 'asc' } } // Fetch deep enough (depth 5 limit as requetsed)
            }
          }
        }
      }
    }
  });

  return categories;
}

export async function createReferenceData(data: { group: string, key: string, label: string, order: number }) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) {
    return { success: false, error: "Non autorisé." };
  }

  try {
    await prisma.referenceData.create({
      data: {
        group: data.group.toUpperCase().replace(/\s+/g, '_'),
        key: data.key,
        label: data.label,
        order: data.order,
        isActive: true
      }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Erreur lors de la création (couple groupe/clé déjà existant)." };
  }
}

export async function updateReferenceData(id: string, data: { group: string, key: string, label: string, order: number, isActive: boolean }) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) {
    return { success: false, error: "Non autorisé." };
  }

  try {
    await prisma.referenceData.update({
      where: { id },
      data: {
        group: data.group.toUpperCase().replace(/\s+/g, '_'),
        key: data.key,
        label: data.label,
        order: data.order,
        isActive: data.isActive
      }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Erreur lors de la mise à jour." };
  }
}

export async function deleteReferenceData(id: string) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) {
    return { success: false, error: "Non autorisé." };
  }

  await prisma.referenceData.delete({ where: { id } });

  return { success: true };
}

export async function getAllReferenceDataAdmin() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) {
    return [];
  }

  return await prisma.referenceData.findMany({
    orderBy: [
      { group: 'asc' },
      { order: 'asc' }
    ]
  });
}

// ---- SITE SETTINGS MANAGEMENT ----

export async function getSiteSetting(key: string) {
  const setting = await prisma.siteSetting.findUnique({
    where: { key }
  });
  return setting?.value || null;
}

export async function updateSiteSetting(key: string, value: string) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) {
    return { success: false, error: "Non autorisé." };
  }

  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });

  return { success: true };
}

export async function getHowToPlaySettings() {
  const keys = [
    "how_to_play_what_is_bb",
    "how_to_play_platforms",
    "how_to_play_community",
    "how_to_play_tournaments",
    "how_to_play_naf_cdf_rtc",
    "how_to_play_challenges"
  ];
  
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: keys } }
  });

  const result: Record<string, string> = {};
  keys.forEach(k => result[k] = "");
  settings.forEach(s => result[s.key] = s.value);
  
  return result;
}

export async function updateHowToPlaySettings(settings: Record<string, string>) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) {
    return { success: false, error: "Non autorisé." };
  }

  const entries = Object.entries(settings);
  
  await prisma.$transaction(
    entries.map(([key, value]) => prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    }))
  );

  return { success: true };
}
