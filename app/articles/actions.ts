/**
 * Actions serveur pour la gestion des articles
 * Gère le CRUD, les tags, les réactions et la modération
 */
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isModerator } from "@/lib/roles";

export async function createArticle(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié" };

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const tagsString = formData.get("tags") as string;
  const ligueId = formData.get("ligueId") as string;
  const ligueCustom = formData.get("ligueCustom") as string;

  if (!title || !content) return { error: "Titre et contenu obligatoires" };

  // Nettoyage et préparation des tags
  const tagNames = tagsString
    ? tagsString.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
    : [];

  try {
    const article = await prisma.article.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        tags: {
          connectOrCreate: tagNames.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
        ligueId: ligueId || null,
        ligueCustom: ligueCustom || null,
      },
    });

    revalidatePath("/articles");
    revalidatePath("/");
    
    return { success: true, id: article.id };
  } catch (error) {
    console.error("Create Article Error:", error);
    return { error: "Une erreur est survenue lors de la création." };
  }
}

export async function updateArticle(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié" };

  const article = await prisma.article.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!article) return { error: "Article introuvable" };

  const sessionUser = session.user as any;
  if (article.authorId !== sessionUser.id && !isModerator(sessionUser.role)) {
    return { error: "Action non autorisée" };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const tagsString = formData.get("tags") as string;
  const ligueId = formData.get("ligueId") as string;
  const ligueCustom = formData.get("ligueCustom") as string;

  const tagNames = tagsString
    ? tagsString.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
    : [];

  try {
    await prisma.article.update({
      where: { id },
      data: {
        title,
        content,
        tags: {
          set: [], // Dissocie les anciens tags
          connectOrCreate: tagNames.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
        ligueId: ligueId || null,
        ligueCustom: ligueCustom || null,
      },
    });

    revalidatePath(`/articles/${id}`);
    revalidatePath("/articles");
    
    return { success: true };
  } catch (error) {
    console.error("Update Article Error:", error);
    return { error: "Une erreur est survenue lors de la mise à jour." };
  }
}

export async function deleteArticle(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié" };

  const article = await prisma.article.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!article) return { error: "Article introuvable" };

  const sessionUser = session.user as any;
  if (article.authorId !== sessionUser.id && !isModerator(sessionUser.role)) {
    return { error: "Action non autorisée" };
  }

  try {
    await prisma.article.delete({ where: { id } });

    revalidatePath("/articles");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Delete Article Error:", error);
    return { error: "Une erreur est survenue lors de la suppression." };
  }
}

export async function toggleArticleReaction(articleId: string, emoji: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié" };

  const userId = session.user.id;

  try {
    const existing = await prisma.articleReaction.findFirst({
      where: { articleId, userId },
    });

    if (existing) {
      if (existing.emoji === emoji) {
        // Toggle off
        await prisma.articleReaction.delete({ where: { id: existing.id } });
      } else {
        // Switch emoji
        await prisma.articleReaction.update({
          where: { id: existing.id },
          data: { emoji },
        });
      }
    } else {
      // Add new
      await prisma.articleReaction.create({
        data: { articleId, userId, emoji },
      });
    }

    revalidatePath(`/articles/${articleId}`);
    return { success: true };
  } catch (error) {
    console.error("Toggle Reaction Error:", error);
    return { error: "Erreur lors de la réaction." };
  }
}

export async function moderateArticle(articleId: string, reason: string) {
  const session = await auth();
  const sessionUser = session?.user as any;
  if (!isModerator(sessionUser?.role)) return { error: "Action non autorisée" };

  try {
    await prisma.article.update({
      where: { id: articleId },
      data: {
        isModerated: true,
        moderationReason: reason,
        moderatedBy: sessionUser.id,
      },
    });

    revalidatePath(`/articles/${articleId}`);
    return { success: true };
  } catch (error) {
    console.error("Moderate Article Error:", error);
    return { error: "Erreur lors de la modération." };
  }
}

export async function unmoderateArticle(articleId: string) {
  const session = await auth();
  const sessionUser = session?.user as any;
  if (!isModerator(sessionUser?.role)) return { error: "Action non autorisée" };

  try {
    await prisma.article.update({
      where: { id: articleId },
      data: {
        isModerated: false,
        moderationReason: null,
        moderatedBy: null,
      },
    });

    revalidatePath(`/articles/${articleId}`);
    return { success: true };
  } catch (error) {
    console.error("Unmoderate Article Error:", error);
    return { error: "Erreur lors de l'annulation de la modération." };
  }
}
