"use server";

import { getActiveSession } from "@/lib/authGuard";
import { getForumAccess, topicAccessWhere } from "@/lib/forumAccess";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/crypto";
import { anonymizeAndDeleteUser } from "@/lib/accountDeletion";
import type { ActionResult } from "@/lib/actionResult";
import { isSiteTheme } from "@/lib/themes";
import { isHubAuthMode } from "@/auth";
import { hubOrigin, updateHubProfile } from "@/lib/hub/hubAccount";
import { getRoleLabelMap } from "@/lib/roleLabels";

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non connecté" };

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;
  const nafNumber = formData.get("nafNumber") as string;
  const region = formData.get("region") as string;
  const equipe = formData.get("equipe") as string;
  const ligueIds = formData.getAll("ligueIds") as string[];
  const ligueCustom = formData.get("ligueCustom") as string;
  const signature = formData.get("signature") as string;
  const avatarFrame = formData.get("avatarFrame") as string;

  // Mode hub : pseudo, avatar, NAF et région appartiennent au passeport, qui les vérifie (pseudo unique…) et prévient
  // les autres applications. Le site ne garde sa copie qu'une fois le hub d'accord (ADR-0007, carte 122)
  if (isHubAuthMode) {
    const hubError = await updateHubProfile(session.user.id, {
      ...(name ? { name } : {}),
      image: image || null,
      naf: nafNumber || null,
      region: region || null,
    });
    if (hubError) return { success: false, error: hubError };
  }

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

/**
 * Adresse du passeport Blood Bowl du membre sur le hub, avec le retour vers les réglages du site (mode hub seulement,
 * carte 122). Le hub n'affiche ce retour que si l'adresse appartient bien au site enregistré chez lui.
 */
export async function getPassportUrl(): Promise<string | null> {
  const origin = hubOrigin();
  if (!isHubAuthMode || !origin || !process.env.HUB_CLIENT_ID) return null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL || "";
  const params = new URLSearchParams({ client_id: process.env.HUB_CLIENT_ID, return_to: `${siteUrl}/profile?tab=settings` });
  return `${origin}/?${params}`;
}

export async function toggleBlockUser(blockedId: string): Promise<ActionResult & { isBlocked?: boolean }> {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non connecté" };
  if (session.user.id === blockedId) return { success: false, error: "Vous ne pouvez pas vous bloquer vous-même" };

  // Vérifier si la cible est un staff (ADMIN/MODO)
  const targetUser = await prisma.user.findUnique({
    where: { id: blockedId },
    select: { role: true }
  });

  if (targetUser && (targetUser.role === "ADMIN" || targetUser.role === "MODERATOR" || targetUser.role === "SUPERADMIN")) {
    return { success: false, error: "Vous ne pouvez pas bloquer un membre de l'équipe (Administrateur/Modérateur)" };
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
  const session = await getActiveSession();
  if (!session?.user?.id) return [];

  const blocks = await prisma.block.findMany({
    where: { blockerId: session.user.id },
    select: { blockedId: true }
  });

  return blocks.map(b => b.blockedId);
}

export async function getBlockedUsers() {
  const session = await getActiveSession();
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
  const { roles } = await getForumAccess();
  const posts = await prisma.post.findMany({
    where: { authorId: userId, isDeleted: false, topic: topicAccessWhere(roles) },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      topic: true
    }
  });

  return posts;
}

export async function reportUser(userId: string, reason: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non connecté" };

  // For now, we just log it or simulate a report
  // For now, we just log it or simulate a report
  
  // Future: create a Report model or send a PM to moderators
  return { success: true };
}

// Les actions de messagerie ont été migrées vers /app/messagerie/actions.ts
export async function deleteAccount(): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non connecté" };

  // Mode hub : la suppression passe par le passeport, qui prévient toutes les applications (carte 124)
  if (isHubAuthMode) return { success: false, error: "La suppression du compte se fait depuis ton passeport Blood Bowl." };

  // Contenus publics rattachés au compte fantôme, données privées supprimées (lib/accountDeletion.ts)
  const ok = await anonymizeAndDeleteUser(session.user.id, session.user.role === "SUPERADMIN");
  if (!ok) return { success: false, error: "Une erreur est survenue lors de la suppression." };
  return { success: true };
}

/**
 * Libellés lisibles des rôles (table RoleConfig), pour afficher « Modérateur » au lieu de MODERATOR dans le profil
 * et la liste des utilisateurs bloqués (carte 092). Lecture seule, sans donnée personnelle.
 */
export async function getRoleLabels(): Promise<Record<string, string>> {
  return getRoleLabelMap();
}

export async function getReferenceDataAction(group: string) {
  return await prisma.referenceData.findMany({
    where: { group, isActive: true },
    orderBy: { order: "asc" },
    select: { key: true, label: true }
  });
}

export async function updateTheme(theme: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non connecté" };
  // Seuls les identifiants de la liste officielle sont enregistrés (carte 062)
  if (!isSiteTheme(theme)) return { success: false, error: "Thème inconnu" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { theme }
  });

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Thème que le membre avait avant le passage de tous au thème Vestiaire (cartes 078 et 083), pour le bandeau
 * « Nouveau look » ; null pour un visiteur, un membre inscrit après la bascule, ou un thème qui n'existe plus.
 */
export async function getPreviousTheme(): Promise<string | null> {
  const session = await getActiveSession();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { previousTheme: true } });
  const previous = user?.previousTheme;
  return previous && isSiteTheme(previous) && previous !== "vestiaire" ? previous : null;
}

export async function updateNotificationSettings(settings: {
  notifPm: boolean;
  notifMention: boolean;
  notifFollowedTopic: boolean;
  notifNewsletter: boolean;
}): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non connecté" };

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

export async function unlinkAccount(provider: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non connecté" };

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
  const session = await getActiveSession();
  if (!session?.user?.email) return { success: false, error: "Email non trouvé" };

  // 1. Récupérer les 3 topics les plus populaires (plus de vues)
  const { roles: accessRoles } = await getForumAccess();
  const popularTopics = await prisma.topic.findMany({
    where: { isArchived: false, ...topicAccessWhere(accessRoles) },
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
