/**
 * Actions serveur pour la gestion des ressources et outils
 * Gère la soumission, la récupération et la modération
 */
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isModerator } from "@/lib/roles";
import { logModerationAction } from "@/app/moderation/actions";

export type ResourceStatus = "PENDING" | "APPROVED" | "REJECTED";

/**
 * Soumet une nouvelle ressource (par un utilisateur)
 */
export async function submitResource(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const link = formData.get("link") as string;
  const tagsString = formData.get("tags") as string;

  if (!title || !description || !link) {
    return { error: "Les champs Titre, Description et Lien sont obligatoires" };
  }

  if (description.length > 200) {
    return { error: "La description ne doit pas dépasser 200 caractères" };
  }

  const tagNames = tagsString
    ? tagsString.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
    : [];

  try {
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        imageUrl: imageUrl || null,
        link,
        status: "PENDING",
        authorId: session.user.id,
        tags: {
          connectOrCreate: tagNames.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    });

    revalidatePath("/profile");
    revalidatePath("/moderation");
    
    return { success: true, id: resource.id };
  } catch (error) {
    console.error("Submit Resource Error:", error);
    return { error: "Une erreur est survenue lors de la soumission." };
  }
}

/**
 * Récupère les ressources avec filtrage et pagination
 */
export async function getResources(params: {
  query?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
}) {
  const { query, tags, page = 1, pageSize = 20 } = params;
  const skip = (page - 1) * pageSize;

  try {
    const where: any = {
      status: "APPROVED",
    };

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          name: { in: tags },
        },
      };
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        include: {
          tags: true,
          author: {
            select: { name: true, image: true }
          }
        },
        orderBy: [
          { isSystem: "desc" },
          { createdAt: "desc" }
        ],
        take: pageSize,
        skip,
      }),
      prisma.resource.count({ where })
    ]);

    return {
      resources,
      total,
      totalPages: Math.ceil(total / pageSize)
    };
  } catch (error) {
    console.error("Get Resources Error:", error);
    return { resources: [], total: 0, totalPages: 0 };
  }
}

/**
 * Récupère tous les tags de ressources
 */
export async function getResourceTags() {
  try {
    return await prisma.resourceTag.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    return [];
  }
}

/**
 * Récupère une ressource unique par son ID
 */
export async function getResource(id: string) {
  try {
    return await prisma.resource.findUnique({
      where: { id },
      include: { tags: true }
    });
  } catch (error) {
    return null;
  }
}

/**
 * Récupère les ressources soumises par un utilisateur avec pagination
 */
export async function getUserResources(userId: string, page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;
  try {
    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where: { authorId: userId },
        include: { tags: true },
        orderBy: { createdAt: "desc" },
        take: pageSize,
        skip,
      }),
      prisma.resource.count({ where: { authorId: userId } })
    ]);
    return { 
      resources, 
      total, 
      totalPages: Math.ceil(total / pageSize) 
    };
  } catch (error) {
    console.error("Get User Resources Error:", error);
    return { resources: [], total: 0, totalPages: 0 };
  }
}

/**
 * Met à jour une ressource (par l'auteur ou un modérateur)
 * La ressource repasse en statut PENDING
 */
export async function updateResourceAction(id: string, formData: FormData) {
  const session = await auth();
  const sessionUser = session?.user as any;
  if (!sessionUser?.id) return { error: "Non authentifié" };

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return { error: "Ressource introuvable" };

  const isOwner = resource.authorId === sessionUser.id;
  const isMod = isModerator(sessionUser.role);

  if (!isOwner && !isMod) return { error: "Action non autorisée" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const link = formData.get("link") as string;
  const tagsString = formData.get("tags") as string;

  if (!title || !description || !link) {
    return { error: "Les champs Titre, Description et Lien sont obligatoires" };
  }

  const tagNames = tagsString
    ? tagsString.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
    : [];

  try {
    await prisma.resource.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl: imageUrl || null,
        link,
        status: "PENDING", // Repasse en attente de modération
        tags: {
          set: [],
          connectOrCreate: tagNames.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    });

    await logModerationAction(
        "RESOURCE_UPDATED", 
        id, 
        "RESOURCE", 
        isMod ? "Mise à jour par un modérateur" : "Mise à jour par l'auteur"
    );

    revalidatePath("/ressources");
    revalidatePath("/profile");
    revalidatePath("/moderation");
    
    return { success: true };
  } catch (error) {
    console.error("Update Resource Error:", error);
    return { error: "Une erreur est survenue lors de la mise à jour." };
  }
}

/**
 * Supprime une ressource (par l'auteur ou un modérateur)
 */
export async function deleteResourceAction(id: string) {
  const session = await auth();
  const sessionUser = session?.user as any;
  if (!sessionUser?.id) return { error: "Non authentifié" };

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return { error: "Ressource introuvable" };

  const isOwner = resource.authorId === sessionUser.id;
  const isMod = isModerator(sessionUser.role);

  if (!isOwner && !isMod) return { error: "Action non autorisée" };

  try {
    await prisma.resource.delete({ where: { id } });

    await logModerationAction(
        "RESOURCE_DELETED", 
        id, 
        "RESOURCE", 
        isMod ? "Suppression par un modérateur" : "Suppression par l'auteur"
    );

    revalidatePath("/ressources");
    revalidatePath("/profile");
    revalidatePath("/moderation");
    
    return { success: true };
  } catch (error) {
    console.error("Delete Resource Error:", error);
    return { error: "Une erreur est survenue lors de la suppression." };
  }
}

/**
 * Récupère les ressources en attente de modération
 */
export async function getPendingResources() {
  const session = await auth();
  const sessionUser = session?.user as any;
  if (!isModerator(sessionUser?.role)) return [];

  try {
    return await prisma.resource.findMany({
      where: { status: "PENDING" },
      include: { 
        tags: true,
        author: { select: { name: true } }
      },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    return [];
  }
}

/**
 * Modère une ressource (Approuver, Rejeter, Éditer, Supprimer)
 */
export async function moderateResource(
  id: string, 
  action: "APPROVE" | "REJECT" | "DELETE" | "UPDATE",
  data?: { title?: string; description?: string; link?: string; imageUrl?: string; tags?: string }
) {
  const session = await auth();
  const sessionUser = session?.user as any;
  if (!isModerator(sessionUser?.role)) return { error: "Action non autorisée" };

  try {
    if (action === "DELETE") {
      await prisma.resource.delete({ where: { id } });
      await logModerationAction("RESOURCE_DELETED", id, "RESOURCE", "Ressource supprimée");
    } else if (action === "APPROVE") {
      await prisma.resource.update({
        where: { id },
        data: { status: "APPROVED" },
      });
      await logModerationAction("RESOURCE_APPROVED", id, "RESOURCE", "Ressource approuvée");
    } else if (action === "REJECT") {
      await prisma.resource.update({
        where: { id },
        data: { status: "REJECTED" },
      });
      await logModerationAction("RESOURCE_REJECTED", id, "RESOURCE", "Ressource rejetée");
    } else if (action === "UPDATE" && data) {
      const tagNames = data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
        : [];

      await prisma.resource.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          link: data.link,
          imageUrl: data.imageUrl,
          tags: {
            set: [],
            connectOrCreate: tagNames.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
        },
      });
      await logModerationAction("RESOURCE_UPDATED", id, "RESOURCE", "Ressource mise à jour par un modérateur");
    }

    revalidatePath("/ressources");
    revalidatePath("/moderation");
    revalidatePath("/profile");
    
    return { success: true };
  } catch (error) {
    console.error("Moderate Resource Error:", error);
    return { error: "Une erreur est survenue." };
  }
}
