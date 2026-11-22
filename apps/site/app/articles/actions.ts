/**
 * Actions serveur pour la gestion des articles
 * Gère le CRUD, les tags, les réactions et la modération
 */
"use server";

import { getActiveSession } from "@/lib/authGuard";
import { rateLimitRefusal } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isModerator } from "@/lib/roles";
import { logModerationAction } from "@/lib/moderationLog";
import { closePendingReports } from "@/lib/moderationReports";

export async function createArticle(formData: FormData) {
  const session = await getActiveSession();
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
  const session = await getActiveSession();
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
  const session = await getActiveSession();
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

    await logModerationAction(
      session.user.id,
      "ARTICLE_DELETED",
      id,
      "ARTICLE",
      `Suppression de l'article`
    );

    revalidatePath("/articles");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Delete Article Error:", error);
    return { error: "Une erreur est survenue lors de la suppression." };
  }
}

export async function toggleArticleReaction(articleId: string, emoji: string) {
  const session = await getActiveSession();
  if (!session?.user?.id) return { error: "Non authentifié" };

  const userId = session.user.id;

  try {
    // Article masqué par la modération (ou inexistant) : aucune réaction (carte 221)
    const article = await prisma.article.findUnique({ where: { id: articleId }, select: { isModerated: true } });
    if (!article || article.isModerated) return { error: "Cet article n'accepte pas de réaction." };
    // Limite d'actions par minute (carte 224)
    const tooFast = await rateLimitRefusal(userId, session.user.role, "REACTION");
    if (tooFast) return { error: tooFast };

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
  const session = await getActiveSession();
  const sessionUser = session?.user as any;
  if (!session || !isModerator(sessionUser?.role)) return { error: "Action non autorisée" };

  try {
    await prisma.article.update({
      where: { id: articleId },
      data: {
        isModerated: true,
        moderationReason: reason,
        moderatedBy: sessionUser.id,
      },
    });

    await logModerationAction(
      session.user.id,
      "ARTICLE_MODERATED",
      articleId,
      "ARTICLE",
      `Article modéré. Raison : ${reason}`
    );
    // L'article masqué n'a plus besoin de ses signalements en attente (carte 221)
    await closePendingReports("ARTICLE", [articleId], session.user.id);

    revalidatePath(`/articles/${articleId}`);
    return { success: true };
  } catch (error) {
    console.error("Moderate Article Error:", error);
    return { error: "Erreur lors de la modération." };
  }
}

export async function unmoderateArticle(articleId: string) {
  const session = await getActiveSession();
  const sessionUser = session?.user as any;
  if (!session || !isModerator(sessionUser?.role)) return { error: "Action non autorisée" };

  try {
    await prisma.article.update({
      where: { id: articleId },
      data: {
        isModerated: false,
        moderationReason: null,
        moderatedBy: null,
      },
    });

    await logModerationAction(
      session.user.id,
      "ARTICLE_UNMODERATED",
      articleId,
      "ARTICLE",
      `Modération de l'article annulée`
    );

    revalidatePath(`/articles/${articleId}`);
    return { success: true };
  } catch (error) {
    console.error("Unmoderate Article Error:", error);
    return { error: "Erreur lors de l'annulation de la modération." };
  }
}

// Le comptage des lectures est dans app/api/articles/[id]/view/route.ts (carte 221).

