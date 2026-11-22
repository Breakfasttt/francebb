"use server";

/**
 * Actions de l'onglet « Structure » de l'administration (administrateurs) : catégories et forums.
 * Depuis la carte 199, la création, la modification et la suppression d'un forum passent par `lib/forumStructure.ts`,
 * partagé avec l'écran du forum : mêmes règles des deux côtés, et `/forum` est rafraîchi tout de suite après chaque
 * changement (avant, il fallait attendre 60 secondes). Les actions sur les catégories et l'ordre des forums
 * rafraîchissent aussi les pages du forum.
 */
import { prisma } from "@/lib/prisma";
import type { Rank } from "@/common/components/UserAvatar/UserAvatar";
import { getActiveSession } from "@/lib/authGuard";
import { getRolePower, ROLE_POWER, SYSTEM_ACCOUNT_IDS } from "@/lib/roles";
import {
  createForumRecord, deleteForumRecord, isKnownAccessRole, readForumStructure, updateForumRecord, type StructureCategory,
} from "@/lib/forumStructure";
import { refreshForumStructure } from "@/lib/pageRefresh";
import { logModerationAction } from "@/lib/moderationLog";

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
  const session = await adminSession();
  if (!session) return { success: false, error: "Non autorisé." };
  if (!(await isKnownAccessRole(data.allowedRoles))) return { success: false, error: "Accès inconnu." };

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
  await logModerationAction(session.user.id, "CATEGORY_CREATED", undefined, "CATEGORY", `${data.name} (accès ${data.allowedRoles})`);
  refreshForumStructure();
  return { success: true };
}

export async function updateCategory(id: string, data: { name: string, description: string, allowedRoles: string }) {
  const session = await adminSession();
  if (!session) return { success: false, error: "Non autorisé." };
  if (!(await isKnownAccessRole(data.allowedRoles))) return { success: false, error: "Accès inconnu." };

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
  await logModerationAction(session.user.id, "CATEGORY_UPDATED", id, "CATEGORY", `${data.name} (accès ${data.allowedRoles})`);
  refreshForumStructure();
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await adminSession();
  if (!session) return { success: false, error: "Non autorisé." };

  const cat = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { forums: true } } } });
  if (!cat) return { success: false, error: "Catégorie introuvable." };

  if (cat.allowedRoles === "ALL") {
    const publicCats = await prisma.category.count({ where: { allowedRoles: "ALL", id: { not: id } } });
    if (publicCats === 0) return { success: false, error: "Impossible de supprimer la dernière catégorie publique ('ALL')." };
  }

  if (cat._count.forums > 0) return { success: false, error: "La catégorie n'est pas vide (déplace d'abord ses forums)." };

  await prisma.category.delete({ where: { id } });
  await logModerationAction(session.user.id, "CATEGORY_DELETED", id, "CATEGORY", cat.name);
  refreshForumStructure();
  return { success: true };
}

export async function reorderCategories(orderedIds: string[]) {
  const session = await adminSession();
  if (!session) return { success: false, error: "Non autorisé." };

  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.category.update({
      where: { id },
      data: { order: index }
    }))
  );
  await logModerationAction(session.user.id, "CATEGORIES_REORDERED", undefined, "CATEGORY");
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
  const session = await adminSession();
  if (!session) return { success: false, error: "Non autorisé." };

  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.forum.update({
      where: { id },
      data: { 
        order: index,
        ...(isCategory ? { categoryId: containerId, parentForumId: null } : { parentForumId: containerId, categoryId: null })
      }
    }))
  );
  await logModerationAction(session.user.id, "FORUMS_REORDERED", containerId, isCategory ? "CATEGORY" : "FORUM");
  refreshForumStructure();
  return { success: true };
}

// ---------------- MODÉRATEURS D'UN FORUM (carte 225) ----------------

/** Modérateurs propres à un forum, pour la fiche du forum dans l'administration. Admin seulement. */
export async function getForumModerators(forumId: string) {
  if (!(await adminSession()) || typeof forumId !== "string") return [];
  const rows = await prisma.forumModerator.findMany({
    where: { forumId },
    orderBy: { createdAt: "asc" },
    select: { user: { select: { id: true, name: true, image: true, avatarFrame: true } } },
  });
  // Le cadre d'avatar est rangé en texte : UserSearch attend un rang connu (« auto » par défaut)
  return rows.map((row) => ({ ...row.user, avatarFrame: row.user.avatarFrame as Rank | null }));
}

/** Inscrit un membre comme modérateur de ce forum et de ses sous-forums. Ni banni, ni compte technique. */
export async function addForumModerator(forumId: string, userId: string) {
  const session = await adminSession();
  if (!session) return { success: false, error: "Non autorisé." };
  if (typeof forumId !== "string" || typeof userId !== "string") return { success: false, error: "Demande incomplète." };
  if (SYSTEM_ACCOUNT_IDS.includes(userId)) return { success: false, error: "Un compte technique ne modère pas." };
  const [forum, user] = await Promise.all([
    prisma.forum.findUnique({ where: { id: forumId }, select: { name: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, isBanned: true } }),
  ]);
  if (!forum) return { success: false, error: "Forum introuvable." };
  if (!user || user.isBanned) return { success: false, error: "Ce membre n'existe pas ou il est banni." };

  await prisma.forumModerator.upsert({ where: { forumId_userId: { forumId, userId } }, update: {}, create: { forumId, userId } });
  await logModerationAction(session.user.id, "FORUM_MODERATOR_ADDED", userId, "USER", `${user.name} modère le forum « ${forum.name} »`);
  refreshForumStructure(forumId);
  return { success: true };
}

/** Retire un membre des modérateurs de ce forum. */
export async function removeForumModerator(forumId: string, userId: string) {
  const session = await adminSession();
  if (!session) return { success: false, error: "Non autorisé." };
  if (typeof forumId !== "string" || typeof userId !== "string") return { success: false, error: "Demande incomplète." };
  const row = await prisma.forumModerator.findUnique({
    where: { forumId_userId: { forumId, userId } },
    select: { forum: { select: { name: true } }, user: { select: { name: true } } },
  });
  if (!row) return { success: true };
  await prisma.forumModerator.delete({ where: { forumId_userId: { forumId, userId } } });
  await logModerationAction(session.user.id, "FORUM_MODERATOR_REMOVED", userId, "USER", `${row.user.name} ne modère plus le forum « ${row.forum.name} »`);
  refreshForumStructure(forumId);
  return { success: true };
}
