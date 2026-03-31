"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getRolePower, ROLE_POWER } from "@/lib/roles";

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
              subForums: true // on va jusqu'à 3 niveaux pour être tranquille, bien que la spec dise "5 max" en enfants.
            }
          }
        }
      }
    }
  });

  return categories;
}

// ---------------- CATEGORY ACTIONS ----------------

export async function createCategory(data: { name: string, description: string, allowedRoles: string }) {
  const session = await auth();
  if (getRolePower((session?.user as any)?.role) < ROLE_POWER.ADMIN) return { success: false, error: "Non autorisé." };

  const lastOrder = await prisma.category.findFirst({ orderBy: { order: 'desc' }, select: { order: true } });
  const newOrder = lastOrder ? lastOrder.order + 1 : 0;

  await prisma.category.create({
    data: {
      name: data.name,
      description: data.description,
      allowedRoles: data.allowedRoles,
      order: newOrder
    }
  });
  return { success: true };
}

export async function updateCategory(id: string, data: { name: string, description: string, allowedRoles: string }) {
  const session = await auth();
  if (getRolePower((session?.user as any)?.role) < ROLE_POWER.ADMIN) return { success: false, error: "Non autorisé." };

  // Rule: au moins une catégorie "ALL"
  if (data.allowedRoles !== "ALL") {
    const publicCats = await prisma.category.count({ where: { allowedRoles: "ALL", id: { not: id } } });
    if (publicCats === 0) return { success: false, error: "Impossible: Vous devez garder au moins UNE catégorie ouverte à 'ALL'." };
  }

  await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      allowedRoles: data.allowedRoles
    }
  });
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (getRolePower((session?.user as any)?.role) < ROLE_POWER.ADMIN) return { success: false, error: "Non autorisé." };

  const cat = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { forums: true } } } });
  if (!cat) return { success: false, error: "Catégorie introuvable." };

  if (cat.allowedRoles === "ALL") {
    const publicCats = await prisma.category.count({ where: { allowedRoles: "ALL", id: { not: id } } });
    if (publicCats === 0) return { success: false, error: "Impossible de supprimer la dernière catégorie publique ('ALL')." };
  }

  if (cat._count.forums > 0) return { success: false, error: "La catégorie n'est pas vide (déplacez d'abord ses forums)." };

  await prisma.category.delete({ where: { id } });
  return { success: true };
}

export async function reorderCategories(orderedIds: string[]) {
  const session = await auth();
  if (getRolePower((session?.user as any)?.role) < ROLE_POWER.ADMIN) return { success: false, error: "Non autorisé." };

  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.category.update({
      where: { id },
      data: { order: index }
    }))
  );
  return { success: true };
}

// ---------------- FORUM ACTIONS ----------------

const PROTECTED_FORUM_NAME = "Les tournois";

export async function createForum(data: { name: string, description: string, allowedRoles: string, categoryId?: string, parentForumId?: string }) {
  const session = await auth();
  if (getRolePower((session?.user as any)?.role) < ROLE_POWER.ADMIN) return { success: false, error: "Non autorisé." };

  if (!data.categoryId && !data.parentForumId) return { success: false, error: "Un forum doit appartenir à une catégorie ou un forum parent." };
  
  // Rule: 5 sub-forums max per forum
  if (data.parentForumId) {
    const siblingCount = await prisma.forum.count({ where: { parentForumId: data.parentForumId } });
    if (siblingCount >= 5) return { success: false, error: "Impossible: La limite de 5 sous-forums est atteinte pour ce forum." };
  }

  const condition = data.categoryId ? { categoryId: data.categoryId, parentForumId: null } : { parentForumId: data.parentForumId };
  const lastOrder = await prisma.forum.findFirst({ where: condition, orderBy: { order: 'desc' }, select: { order: true } });
  const newOrder = lastOrder ? lastOrder.order + 1 : 0;

  await prisma.forum.create({
    data: {
      name: data.name,
      description: data.description,
      allowedRoles: data.allowedRoles,
      categoryId: data.categoryId || null,
      parentForumId: data.parentForumId || null,
      isTournamentForum: false, // On ne peut plus taguer manuellement un forum tournoi
      order: newOrder
    }
  });

  return { success: true };
}

export async function updateForum(id: string, data: { name: string, description: string, allowedRoles: string }) {
  const session = await auth();
  if (getRolePower((session?.user as any)?.role) < ROLE_POWER.ADMIN) return { success: false, error: "Non autorisé." };

  if (data.allowedRoles !== "ALL") {
    // Only check if it's a root forum in a category (public forum must be root)
    const forum = await prisma.forum.findUnique({ where: { id } });
    if (forum && forum.allowedRoles === "ALL") {
      const publicForums = await prisma.forum.count({ where: { allowedRoles: "ALL", id: { not: id } } });
      if (publicForums === 0) return { success: false, error: "Impossible: Vous devez garder au moins UN forum ouvert à 'ALL'." };
    }
  }

  const forum = await prisma.forum.findUnique({ where: { id } });
  if (forum?.name === PROTECTED_FORUM_NAME && data.name !== PROTECTED_FORUM_NAME) {
    return { success: false, error: `Le forum "${PROTECTED_FORUM_NAME}" ne peut pas être renommé.` };
  }

  await prisma.forum.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      allowedRoles: data.allowedRoles
    }
  });
  return { success: true };
}

export async function deleteForum(id: string) {
  const session = await auth();
  if (getRolePower((session?.user as any)?.role) < ROLE_POWER.ADMIN) return { success: false, error: "Non autorisé." };

  const forum = await prisma.forum.findUnique({ where: { id }, include: { _count: { select: { subForums: true, topics: true } } } });
  if (!forum) return { success: false, error: "Forum introuvable." };

  if (forum.name === PROTECTED_FORUM_NAME) {
    return { success: false, error: `Le forum "${PROTECTED_FORUM_NAME}" est protégé et ne peut pas être supprimé.` };
  }

  if (forum.allowedRoles === "ALL") {
    const publicForums = await prisma.forum.count({ where: { allowedRoles: "ALL", id: { not: id } } });
    if (publicForums === 0) return { success: false, error: "Impossible de supprimer le dernier forum public ('ALL')." };
  }

  if (forum._count.subForums > 0) return { success: false, error: "Ce forum contient des sous-forums (supprimez-les d'abord)." };
  if (forum._count.topics > 0) return { success: false, error: "Ce forum contient des sujets (déplacez-les ou supprimez-les d'abord)." };

  await prisma.forum.delete({ where: { id } });
  return { success: true };
}

export async function reorderForums(containerId: string, isCategory: boolean, orderedIds: string[]) {
  const session = await auth();
  if (getRolePower((session?.user as any)?.role) < ROLE_POWER.ADMIN) return { success: false, error: "Non autorisé." };

  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.forum.update({
      where: { id },
      data: { 
        order: index,
        ...(isCategory ? { categoryId: containerId, parentForumId: null } : { parentForumId: containerId, categoryId: null })
      }
    }))
  );
  return { success: true };
}
