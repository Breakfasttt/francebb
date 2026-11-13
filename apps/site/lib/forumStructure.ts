/**
 * Structure du forum : création, modification et suppression d'un forum (carte 199).
 *
 * Avant cette carte, l'écran du forum (`app/forum/actions.ts`) et l'onglet « Structure » de l'administration
 * (`app/administration/actionsStructure.ts`) avaient chacun leur version, qui avaient divergé : un modérateur pouvait
 * supprimer le forum « Les tournois » depuis l'écran du forum, et une modification faite dans l'administration
 * n'apparaissait sur `/forum` qu'au bout de 60 secondes. Les deux écrans appellent maintenant ces fonctions ; chacun
 * garde son propre contrôle de rôle (modérateur pour l'écran du forum, administrateur pour l'administration).
 *
 * Fichier volontairement PAS « use server » : ces fonctions ne sont appelées que par des actions serveur, après leur
 * contrôle de rôle, avec le membre qui agit en paramètre (règle de la carte 198). Elles valident (règles pures de
 * `lib/forumStructureRules.ts`), écrivent, notent l'action au journal de modération et rafraîchissent les pages
 * (`refreshForumStructure` de `lib/pageRefresh.ts`, carte 202).
 */
import type { Category, Forum } from "@/prisma/generated-client";
import { prisma } from "@/lib/prisma";
import { logModerationAction } from "@/lib/moderationLog";
import type { ActionResult } from "@/lib/actionResult";
import { refreshForumStructure } from "@/lib/pageRefresh";
import { PUBLIC_ACCESS, forumCreationRefusal, forumDeletionRefusal, forumUpdateRefusal } from "@/lib/forumStructureRules";

/** Forum de l'arbre de l'administration, avec ses sous-forums (deux niveaux sous un forum racine). */
export type StructureForum = Forum & { subForums?: StructureForum[] };
/** Catégorie de l'arbre de l'administration, avec ses forums racines. */
export type StructureCategory = Category & { forums: StructureForum[] };

/** Arbre complet des catégories et des forums, dans l'ordre d'affichage (onglet « Structure »). */
export async function readForumStructure(): Promise<StructureCategory[]> {
  return prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      forums: {
        where: { parentForumId: null },
        orderBy: { order: "asc" },
        include: {
          subForums: {
            orderBy: { order: "asc" },
            include: { subForums: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });
}

export interface ForumInput {
  name: string;
  description?: string | null;
  /** Rôles autorisés (`ALL` pour tous) ; un forum créé depuis l'écran du forum est ouvert à tous. */
  allowedRoles?: string;
  categoryId?: string | null;
  parentForumId?: string | null;
  /** Forum après lequel placer le nouveau (`START` : en tête) ; sans valeur, le forum est placé à la fin. */
  afterId?: string | null;
}

/** Crée un forum. Renvoie l'identifiant du nouveau forum, ou la raison du refus. */
export async function createForumRecord(actorId: string, input: ForumInput): Promise<ActionResult & { forumId?: string }> {
  const name = input.name.trim();
  const categoryId = input.parentForumId ? null : input.categoryId || null;
  const parentForumId = input.parentForumId || null;

  const [sameName, siblingSubForums] = await Promise.all([
    name ? prisma.forum.findUnique({ where: { name }, select: { id: true } }) : null,
    parentForumId ? prisma.forum.count({ where: { parentForumId } }) : null,
  ]);
  const refusal = forumCreationRefusal({ name, hasContainer: !!(categoryId || parentForumId), nameTaken: !!sameName, siblingSubForums });
  if (refusal) return { success: false, error: refusal };

  const container = categoryId ? { categoryId, parentForumId: null } : { parentForumId };
  // Place : juste après le forum choisi, en tête avec « START », sinon à la fin de son niveau
  let order: number;
  if (input.afterId === "START") {
    order = 0;
  } else if (input.afterId) {
    const previous = await prisma.forum.findUnique({ where: { id: input.afterId }, select: { order: true } });
    order = previous ? previous.order + 1 : 0;
  } else {
    const last = await prisma.forum.findFirst({ where: container, orderBy: { order: "desc" }, select: { order: true } });
    order = last ? last.order + 1 : 0;
  }

  const forum = await prisma.$transaction(async (tx) => {
    // Les forums placés après le nouveau descendent d'un rang
    await tx.forum.updateMany({ where: { ...container, order: { gte: order } }, data: { order: { increment: 1 } } });
    return tx.forum.create({
      data: {
        name,
        description: input.description?.trim() || null,
        allowedRoles: input.allowedRoles || PUBLIC_ACCESS,
        categoryId,
        parentForumId,
        order,
        // Un forum ne devient pas « forum de tournois » à la main
        isTournamentForum: false,
      },
    });
  });

  await logModerationAction(actorId, "FORUM_CREATED", forum.id, "FORUM", `Création du forum : ${name}`);
  refreshForumStructure(parentForumId);
  return { success: true, forumId: forum.id };
}

/** Modifie le nom, la description et l'accès d'un forum. */
export async function updateForumRecord(
  actorId: string,
  forumId: string,
  input: { name: string; description?: string | null; allowedRoles: string }
): Promise<ActionResult> {
  const forum = await prisma.forum.findUnique({ where: { id: forumId }, select: { name: true, allowedRoles: true, parentForumId: true } });
  if (!forum) return { success: false, error: "Forum introuvable." };

  const name = input.name.trim();
  const [sameName, otherPublicForums] = await Promise.all([
    name && name !== forum.name ? prisma.forum.findUnique({ where: { name }, select: { id: true } }) : null,
    prisma.forum.count({ where: { allowedRoles: PUBLIC_ACCESS, id: { not: forumId } } }),
  ]);
  const refusal = forumUpdateRefusal({
    currentName: forum.name,
    newName: name,
    currentAccess: forum.allowedRoles,
    newAccess: input.allowedRoles,
    nameTaken: !!sameName,
    otherPublicForums,
  });
  if (refusal) return { success: false, error: refusal };

  await prisma.forum.update({
    where: { id: forumId },
    data: { name, description: input.description?.trim() || null, allowedRoles: input.allowedRoles },
  });
  await logModerationAction(actorId, "FORUM_UPDATED", forumId, "FORUM", `Modification du forum : ${name}`);
  refreshForumStructure(forum.parentForumId);
  return { success: true };
}

/**
 * Supprime un forum vide. Refusé pour le forum protégé, le dernier forum ouvert à tous, un forum qui a des
 * sous-forums ou des sujets (supprimés compris : la suppression des sujets est douce, ils restent restaurables).
 * Renvoie aussi le forum parent, pour que l'écran puisse y revenir.
 */
export async function deleteForumRecord(actorId: string, forumId: string): Promise<ActionResult & { parentForumId?: string | null; name?: string }> {
  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
    select: { name: true, allowedRoles: true, parentForumId: true, _count: { select: { subForums: true } } },
  });
  if (!forum) return { success: false, error: "Forum introuvable." };

  const [otherPublicForums, visibleTopics, deletedTopics] = await Promise.all([
    prisma.forum.count({ where: { allowedRoles: PUBLIC_ACCESS, id: { not: forumId } } }),
    prisma.topic.count({ where: { forumId, isDeleted: false } }),
    prisma.topic.count({ where: { forumId, isDeleted: true } }),
  ]);
  const refusal = forumDeletionRefusal({
    name: forum.name,
    access: forum.allowedRoles,
    otherPublicForums,
    subForums: forum._count.subForums,
    visibleTopics,
    deletedTopics,
  });
  if (refusal) return { success: false, error: refusal };

  await prisma.forum.delete({ where: { id: forumId } });
  await logModerationAction(actorId, "FORUM_DELETED", forumId, "FORUM", `Suppression du forum : ${forum.name}`);
  refreshForumStructure(forum.parentForumId);
  return { success: true, parentForumId: forum.parentForumId, name: forum.name };
}
