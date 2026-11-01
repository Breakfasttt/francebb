/**
 * Actions serveur pour la gestion des ressources et outils
 * Gère la soumission, la récupération et la modération
 * Carte 141 : le lien et l'image d'une ressource sont contrôlés ici, côté serveur (voir `checkResourceUrls`), pour
 * qu'une adresse dangereuse comme `javascript:…` ne puisse jamais être enregistrée.
 */
"use server";

import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { isModerator, isAdmin } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { logModerationAction } from "@/lib/moderationLog";
import type { Prisma } from "@/prisma/generated-client";

export type ResourceStatus = "PENDING" | "APPROVED" | "REJECTED";

/** Longueur maximale d'une adresse (lien ou image), pour refuser un texte démesuré. */
const URL_MAX_LENGTH = 2000;

/**
 * Vrai si `value` est une adresse web complète en `http://` ou `https://`, ou, quand `allowInternal` est vrai, une
 * adresse interne du site qui commence par une seule barre oblique (`/bbscheme`). Une adresse comme
 * `javascript:alert(1)` exécuterait du code au clic : elle est toujours refusée. `//autre-site.fr` et `/\autre-site.fr`
 * aussi, car le navigateur les comprend comme des liens vers un autre site.
 */
function isSafeUrl(value: string, allowInternal: boolean): boolean {
  if (value.length > URL_MAX_LENGTH) return false;
  if (allowInternal && /^\/(?![/\\])/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Contrôle le lien et l'image d'une ressource avant de l'enregistrer. Le lien (`null` quand il ne change pas) doit
 * être une adresse web ; l'image est facultative (chaîne vide). Les adresses internes du site ne sont acceptées pour
 * le lien que pour un outil officiel (`isSystem`), dont le lien mène à une page du site ; elles le sont toujours pour
 * l'image (images du dossier public du site). Renvoie le message d'erreur à afficher, ou `null`.
 */
function checkResourceUrls(link: string | null, imageUrl: string | null, isSystem: boolean): string | null {
  if (link !== null && !isSafeUrl(link, isSystem)) {
    return "Le lien doit être une adresse web complète, qui commence par http:// ou https://.";
  }
  if (imageUrl && !isSafeUrl(imageUrl, true)) {
    return "L'adresse de l'image doit commencer par http:// ou https://.";
  }
  return null;
}

/** Lit un champ texte du formulaire, sans espaces autour ; chaîne vide s'il est absent. */
function textField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Soumet une nouvelle ressource (par un utilisateur)
 */
export async function submitResource(formData: FormData) {
  const session = await getActiveSession();
  if (!session?.user?.id) return { error: "Non authentifié" };

  const title = textField(formData, "title");
  const description = textField(formData, "description");
  const imageUrl = textField(formData, "imageUrl");
  const link = textField(formData, "link");
  const tagsString = textField(formData, "tags");

  if (!title || !description || !link) {
    return { error: "Les champs Titre, Description et Lien sont obligatoires" };
  }

  if (description.length > 200) {
    return { error: "La description ne doit pas dépasser 200 caractères" };
  }

  const urlError = checkResourceUrls(link, imageUrl, false);
  if (urlError) return { error: urlError };

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
    const where: Prisma.ResourceWhereInput = {
      status: "APPROVED",
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
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
    const tags = await prisma.resourceTag.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });
    return tags.map(t => t.name);
  } catch (error) {
    return [];
  }
}

/**
 * Récupère une ressource unique par son ID
 */
export async function getResource(id: string) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: { tags: true }
    });
    if (!resource) return null;
    // Une ressource pas encore validée (ou refusée) n'est visible que par son auteur et les modérateurs (carte 050)
    if (resource.status !== "APPROVED") {
      const session = await getActiveSession();
      if (session?.user?.id !== resource.authorId && !isModerator(session?.user?.role)) return null;
    }
    return resource;
  } catch (error) {
    return null;
  }
}

/**
 * Récupère les ressources soumises par un utilisateur avec pagination
 */
export async function getUserResources(userId: string, page = 1, pageSize = 10) {
  // Taille de page bornée : cette action est appelable par n'importe quel visiteur
  pageSize = Math.min(20, Math.max(1, pageSize));
  const skip = (Math.max(1, page) - 1) * pageSize;
  try {
    // Les ressources en attente ou refusées ne sont visibles que par leur auteur et les modérateurs (carte 050)
    const session = await getActiveSession();
    const canSeeAll = session?.user?.id === userId || isModerator(session?.user?.role);
    const where = canSeeAll ? { authorId: userId } : { authorId: userId, status: "APPROVED" };
    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        include: { tags: true },
        orderBy: { createdAt: "desc" },
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
    console.error("Get User Resources Error:", error);
    return { resources: [], total: 0, totalPages: 0 };
  }
}

/**
 * Met à jour une ressource (par l'auteur ou un modérateur)
 * La ressource repasse en statut PENDING
 */
export async function updateResourceAction(id: string, formData: FormData) {
  const session = await getActiveSession();
  const user = session?.user;
  if (!user?.id) return { error: "Non authentifié" };

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return { error: "Ressource introuvable" };

  if (!isModerator(user.role) && user.id !== resource.authorId) {
    return { error: "Non autorisé" };
  }

  // Exception Ressources Système (BBPusher, etc)
  if (resource.isSystem) {
    if (!isAdmin(user.role)) {
      return { error: "Seuls les administrateurs peuvent modifier les outils système" };
    }
    // Pour une ressource système, on ne modifie que description et image
    const systemDescription = textField(formData, "description");
    const systemImageUrl = textField(formData, "imageUrl");
    if (!systemDescription) return { error: "La description est obligatoire" };
    if (systemDescription.length > 200) return { error: "La description ne doit pas dépasser 200 caractères" };
    const systemUrlError = checkResourceUrls(null, systemImageUrl, true);
    if (systemUrlError) return { error: systemUrlError };
    await prisma.resource.update({
      where: { id },
      data: {
        description: systemDescription,
        imageUrl: systemImageUrl || null,
        // Les ressources système restent approuvées
      }
    });

    await logModerationAction("RESOURCE_UPDATED", id, "RESOURCE", "Mise à jour d'un outil système");
    revalidatePath("/ressources");
    return { success: true };
  }

  const title = textField(formData, "title");
  const description = textField(formData, "description");
  const imageUrl = textField(formData, "imageUrl");
  const link = textField(formData, "link");
  const tagsString = textField(formData, "tags");

  if (!title || !description || !link) {
    return { error: "Les champs Titre, Description et Lien sont obligatoires" };
  }

  if (description.length > 200) {
    return { error: "La description ne doit pas dépasser 200 caractères" };
  }

  const urlError = checkResourceUrls(link, imageUrl, false);
  if (urlError) return { error: urlError };

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
        isModerator(user.role) ? "Mise à jour par un modérateur" : "Mise à jour par l'auteur"
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
  const session = await getActiveSession();
  const user = session?.user;
  if (!user?.id) return { error: "Non authentifié" };

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return { error: "Ressource introuvable" };

  if (!isModerator(user.role) && user.id !== resource.authorId) {
    return { error: "Non autorisé" };
  }

  if (resource.isSystem) {
    return { error: "Impossible de supprimer un outil système" };
  }

  try {
    await prisma.resource.delete({ where: { id } });

    await logModerationAction(
        "RESOURCE_DELETED", 
        id, 
        "RESOURCE", 
        isModerator(user.role) ? "Suppression par un modérateur" : "Suppression par l'auteur"
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
 * Récupère les ressources en attente de modération avec pagination.
 */
export async function getPendingResources(page = 1, pageSize = 10) {
  const session = await getActiveSession();
  if (!isModerator(session?.user?.role)) return { resources: [], total: 0 };

  const skip = (page - 1) * pageSize;

  try {
    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where: { status: "PENDING" },
        include: { 
          tags: true,
          author: { select: { name: true } }
        },
        orderBy: { createdAt: "asc" },
        take: pageSize,
        skip,
      }),
      prisma.resource.count({ where: { status: "PENDING" } })
    ]);
    return { resources, total };
  } catch (error) {
    return { resources: [], total: 0 };
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
  const session = await getActiveSession();
  if (!isModerator(session?.user?.role)) return { error: "Action non autorisée" };

  try {
    if (action === "DELETE") {
      const resource = await prisma.resource.findUnique({ where: { id } });
      if (resource?.isSystem) return { error: "Impossible de supprimer un outil système" };
      
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
      // Mêmes contrôles d'adresse que pour un membre ; une adresse interne n'est permise que pour un outil officiel
      const current = await prisma.resource.findUnique({ where: { id }, select: { isSystem: true } });
      if (!current) return { error: "Ressource introuvable" };
      const newLink = data.link?.trim();
      const newImageUrl = data.imageUrl?.trim();
      const urlError = checkResourceUrls(newLink ?? null, newImageUrl || null, current.isSystem);
      if (urlError) return { error: urlError };
      const tagNames = data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
        : [];

      await prisma.resource.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          link: newLink,
          imageUrl: newImageUrl === undefined ? undefined : newImageUrl || null,
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
