"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { sendPmNotification } from "@/lib/mail";
import { logModerationAction } from "@/app/moderation/actions";
import { encrypt, decrypt } from "@/lib/crypto";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecté");

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;
  const nafNumber = formData.get("nafNumber") as string;
  const region = formData.get("region") as string;
  const equipe = formData.get("equipe") as string;
  const ligueIds = formData.getAll("ligueIds") as string[];
  const ligueCustom = formData.get("ligueCustom") as string;
  const signature = formData.get("signature") as string;
  const avatarFrame = formData.get("avatarFrame") as string;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name || undefined,
      image: image || undefined,
      nafNumber: nafNumber || null,
      region: region || null,
      equipe: (equipe || "").substring(0, 100) || null,
      ligues: {
        set: ligueIds.filter(id => id).map(id => ({ id }))
      },
      ligueCustom: ligueCustom || null,
      signature: signature || null,
      avatarFrame: avatarFrame || "auto",
    }
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function toggleBanUser(userId: string, isBanned: boolean, reason?: string) {
  const session = await auth();
  if (!isModerator(session?.user?.role)) throw new Error("Action non autorisée");

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isBanned: true }
  });

  if (!target) throw new Error("Utilisateur introuvable");

  await prisma.user.update({
    where: { id: userId },
    data: { 
      isBanned,
      banReason: isBanned ? (reason || "Bannissement manuel") : null
    }
  });

  await logModerationAction(
    isBanned ? "USER_BANNED" : "USER_UNBANNED",
    userId,
    "USER",
    isBanned ? (reason || "Bannissement de l'utilisateur") : "Débannissement de l'utilisateur"
  );

  revalidatePath(`/spy/${userId}`);
  return { success: true };
}

export async function toggleBlockUser(blockedId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecté");
  if (session.user.id === blockedId) throw new Error("Vous ne pouvez pas vous bloquer vous-même");

  // Vérifier si la cible est un staff (ADMIN/MODO)
  const targetUser = await prisma.user.findUnique({
    where: { id: blockedId },
    select: { role: true }
  });

  if (targetUser && (targetUser.role === "ADMIN" || targetUser.role === "MODERATOR" || targetUser.role === "SUPERADMIN")) {
    throw new Error("Vous ne pouvez pas bloquer un membre de l'équipe (Administrateur/Modérateur)");
  }

  const existingBlock = await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId: session.user.id, blockedId } }
  });

  if (existingBlock) {
    await prisma.block.delete({
      where: { blockerId_blockedId: { blockerId: session.user.id, blockedId } }
    });
  } else {
    await prisma.block.create({
      data: { blockerId: session.user.id, blockedId }
    });
  }

  revalidatePath(`/spy/${blockedId}`);
  revalidatePath("/profile");
  return { success: true, isBlocked: !existingBlock };
}

export async function getBlockedUsersIds() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const blocks = await prisma.block.findMany({
    where: { blockerId: session.user.id },
    select: { blockedId: true }
  });

  return blocks.map(b => b.blockedId);
}

export async function getBlockedUsers() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const blocked = await prisma.block.findMany({
    where: { blockerId: session.user.id },
    include: {
      blocked: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true
        }
      }
    }
  });

  return blocked.map(b => b.blocked);
}

export async function getUserStats(userId: string) {
  const postCount = await prisma.post.count({
    where: { authorId: userId, isDeleted: false }
  });

  return { postCount };
}

export async function getUserActivity(userId: string, limit: number = 5) {
  // Return last posts/topics
  const posts = await prisma.post.findMany({
    where: { authorId: userId, isDeleted: false },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      topic: true
    }
  });

  return posts;
}

export async function reportUser(userId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecté");

  // For now, we just log it or simulate a report
  // For now, we just log it or simulate a report
  
  // Future: create a Report model or send a PM to moderators
  return { success: true };
}

// Les actions de messagerie ont été migrées vers /app/messagerie/actions.ts
export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecté");

  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Définir l'utilisateur de secours (Ghost) pour l'anonymisation
      const ghostId = "ghost_coach";
      let ghost = await tx.user.findUnique({ where: { id: ghostId } });
      if (!ghost) {
        ghost = await tx.user.create({
          data: {
            id: ghostId,
            name: "Coach Inconnu",
            email: "ghost@breakfasttt.fr",
            role: "COACH",
            isBanned: true
          }
        });
      }

      // 2. Supprimer les données privées, éphémères ou sensibles
      await tx.account.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });
      await tx.topicView.deleteMany({ where: { userId } });
      await tx.postReaction.deleteMany({ where: { userId } });
      await tx.articleReaction.deleteMany({ where: { userId } });
      await tx.mention.deleteMany({ where: { OR: [{ mentionerId: userId }, { mentionedUserId: userId }] } });
      await tx.tournamentRegistration.deleteMany({ where: { userId } });
      await tx.tournamentMercenary.deleteMany({ where: { userId } });
      await tx.tournamentTeamMember.deleteMany({ where: { userId } });
      await tx.quizAttempt.deleteMany({ where: { userId } });
      
      // 3. Supprimer les messages privés et participations aux conversations
      await tx.privateMessage.deleteMany({ where: { authorId: userId } });
      await tx.conversationParticipant.deleteMany({ where: { userId } });

      // 4. Anonymiser l'activité publique (Forum, Articles, Ligues, Tournois, Quiz)
      await tx.topic.updateMany({
        where: { authorId: userId },
        data: { authorId: ghostId }
      });

      await tx.post.updateMany({
        where: { authorId: userId },
        data: { authorId: ghostId, content: "[Ce message a été supprimé suite à la clôture du compte]" }
      });

      await tx.article.updateMany({
        where: { authorId: userId },
        data: { authorId: ghostId }
      });

      await tx.ligue.updateMany({
        where: { creatorId: userId },
        data: { creatorId: ghostId }
      });

      await tx.tournamentTeam.updateMany({
        where: { captainId: userId },
        data: { captainId: ghostId }
      });

      await tx.quizQuestionSuggestion.updateMany({
        where: { authorId: userId },
        data: { authorId: ghostId }
      });

      await tx.tournamentResult.updateMany({
        where: { userId },
        data: { userId: ghostId }
      });

      await tx.tournamentMatch.updateMany({
        where: { coach1UserId: userId },
        data: { coach1UserId: ghostId }
      });

      await tx.tournamentMatch.updateMany({
        where: { coach2UserId: userId },
        data: { coach2UserId: ghostId }
      });

      await tx.rankingArchive.updateMany({
        where: { archivedById: userId },
        data: { archivedById: ghostId }
      });

      await tx.resource.updateMany({
        where: { authorId: userId },
        data: { authorId: ghostId }
      });

      // 5. Supprimer l'utilisateur lui-même (sauf si SUPERADMIN)
      if (session.user.role === "SUPERADMIN") {
        await tx.user.update({
          where: { id: userId },
          data: {
            image: null,
            signature: null,
            nafNumber: null,
            region: null,
            ligues: { set: [] },
            ownedLigues: { set: [] },
            commissaireLigues: { set: [] },
            ligueCustom: null,
            avatarFrame: "auto"
          }
        });
      } else {
        await tx.user.delete({ where: { id: userId } });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error);
    return { success: false, error: "Une erreur est survenue lors de la suppression." };
  }
}

export async function getReferenceDataAction(group: string) {
  return await prisma.referenceData.findMany({
    where: { group, isActive: true },
    orderBy: { order: "asc" },
    select: { key: true, label: true }
  });
}

export async function updateTheme(theme: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecté");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { theme }
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateNotificationSettings(settings: {
  notifPm: boolean;
  notifMention: boolean;
  notifFollowedTopic: boolean;
  notifNewsletter: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecté");

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: settings
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Erreur updateNotificationSettings:", error);
    return { success: false, error: "Erreur lors de la mise à jour des paramètres" };
  }
}

export async function unlinkAccount(provider: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecté");

  const userId = session.user.id;

  // Vérifier combien de méthodes de connexion il reste
  const accounts = await prisma.account.findMany({
    where: { userId }
  });

  if (accounts.length <= 1) {
    return { success: false, error: "Vous devez garder au moins une méthode de connexion active." };
  }

  await prisma.account.deleteMany({
    where: {
      userId,
      provider
    }
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function sendTestNewsletter() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Email non trouvé");

  // 1. Récupérer les 3 topics les plus populaires (plus de vues)
  const popularTopics = await prisma.topic.findMany({
    where: { isArchived: false },
    take: 3,
    orderBy: { views: "desc" },
    include: { forum: { select: { name: true } } }
  });

  // 2. Récupérer les 3 prochains tournois
  const upcomingTournaments = await prisma.tournament.findMany({
    where: { date: { gte: new Date() } },
    take: 3,
    orderBy: { date: "asc" },
    include: { topic: { select: { id: true } } }
  });

  const { getNewsletterTemplate, sendMail } = await import("@/lib/mail");
  
  return sendMail({
    to: session.user.email,
    subject: "[BBFrance] Gazette Hebdomadaire",
    html: getNewsletterTemplate(popularTopics, upcomingTournaments),
  });
}

export async function isEmailConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}
