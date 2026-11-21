"use server";

/**
 * Actions de l'onglet « Structure » de l'administration (administrateurs) : catégories et forums.
 * Depuis la carte 199, la création, la modification et la suppression d'un forum passent par `lib/forumStructure.ts`,
 * partagé avec l'écran du forum : mêmes règles des deux côtés, et `/forum` est rafraîchi tout de suite après chaque
 * changement (avant, il fallait attendre 60 secondes). Les actions sur les catégories et l'ordre des forums
 * rafraîchissent aussi les pages du forum.
 */
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/authGuard";
import { getRolePower, ROLE_POWER } from "@/lib/roles";
import {
  createForumRecord, deleteForumRecord, readForumStructure, updateForumRecord, type StructureCategory,
} from "@/lib/forumStructure";
import { refreshForumStructure } from "@/lib/pageRefresh";

/** Membre administrateur connecté, ou rien. */
async function adminSession() {
  const session = await getActiveSession();
  if (!session || getRolePower(session.user.role) < ROLE_POWER.ADMIN) return null;
  return session;
}

export async function getForumStructure(): Promise<StructureCategory[]> {
  if (!(await adminSession())) return [];
  return readForumStructure();
}

// ---------------- CATEGORY ACTIONS ----------------

export async function createCategory(data: { name: string, description: string, allowedRoles: string }) {
  const session = await getActiveSession();
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
  refreshForumStructure();
  return { success: true };
}

export async function updateCategory(id: string, data: { name: string, description: string, allowedRoles: string }) {
  const session = await getActiveSession();
  if (getRolePower((session?.user as any)?.role) < ROLE_POWER.ADMIN) return { success: false, error: "Non autorisé." };

  // Rule: au moins une catégorie "ALL"
  if (data.allowedRoles !== "ALL") {
    const publicCats = await prisma.category.count({ where: { allowedRoles: "ALL", id: { not: id } } });
    if (publicCats === 0) return { success: false, error: "Impossible : tu dois garder au moins UNE catégorie ouverte à 'ALL'." };
  }

  await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      allowedRoles: data.allowedRoles
    }
  });
  refreshForumStructure();
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await getActiveSession();
  if (getRolePower((session?.user as any)?.role) < ROLE_POWER.ADMIN) return { success: false, error: "Non autorisé." };

  const cat = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { forums: true } } } });
  if (!cat) return { success: false, error: "Catégorie introuvable." };

  if (cat.allowedRoles === "ALL") {
    const publicCats = await prisma.category.count({ where: { allowedRoles: "ALL", id: { not: id } } });
    if (publicCats === 0) return { success: false, error: "Impossible de supprimer la dernière catégorie publique ('ALL')." };
  }

  if (cat._count.forums > 0) return { success: false, error: "La catégorie n'est pas vide (déplace d'abord ses forums)." };

  await prisma.category.delete({ where: { id } });
  refreshForumStructure();
  return { success: true };
}

export async function reorderCategories(orderedIds: string[]) {
  const session = await getActiveSession();
  if (getRolePower((session?.user as any)?.role) < ROLE_POWER.ADMIN) return { success: false, error: "Non autorisé." };

  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.category.update({
      where: { id },
      data: { order: index }
    }))
  );
  refreshForumStructure();
  return { success: true };
}

// ---------------- FORUM ACTIONS ----------------

export async function createForum(data: { name: string, description: string, allowedRoles: string, categoryId?: string, parentForumId?: string }) {
  const session = await adminSession();
  if (!session) return { success: false, error: "Non autorisé." };
  return createForumRecord(session.user.id, data);
}

export async function updateForum(id: string, data: { name: string, description: string, allowedRoles: string }) {
  const session = await adminSession();
  if (!session) return { success: false, error: "Non autorisé." };
  return updateForumRecord(session.user.id, id, data);
}

export async function deleteForum(id: string) {
  const session = await adminSession();
  if (!session) return { success: false, error: "Non autorisé." };
  return deleteForumRecord(session.user.id, id);
}

export async function reorderForums(containerId: string, isCategory: boolean, orderedIds: string[]) {
  const session = await getActiveSession();
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
  refreshForumStructure();
  return { success: true };
}
