"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEditTargetRole, ROLE_POWER, UserRole, isModerator } from "@/lib/roles";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: UserRole) {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!me) throw new Error("Utilisateur non trouvé");

  const target = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!target) throw new Error("Cible non trouvée");

  if (!canEditTargetRole(me.role as UserRole, target.role as UserRole)) {
    throw new Error("Permissions insuffisantes pour modifier cet utilisateur");
  }

  if (ROLE_POWER[newRole] >= ROLE_POWER[me.role as UserRole] && me.role !== "SUPERADMIN") {
    throw new Error("Vous ne pouvez pas attribuer un rôle supérieur ou égal au vôtre");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });

  revalidatePath("/membres");
  return { success: true };
}

export async function toggleBanUser(userId: string, isBanned: boolean, reason?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!me || !isModerator(me.role)) {
    throw new Error("Permissions insuffisantes pour cette action");
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!target) throw new Error("Utilisateur cible non trouvé");

  if (!canEditTargetRole(me.role as UserRole, target.role as UserRole) && me.role !== "SUPERADMIN") {
    throw new Error("Vous ne pouvez pas bannir ce membre (hiérarchie insuffisante)");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { 
      isBanned,
      banReason: isBanned ? reason || "Non spécifié" : null
    }
  });

  revalidatePath("/membres");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!me || !isModerator(me.role)) {
    throw new Error("Permissions insuffisantes pour supprimer un utilisateur");
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!target) throw new Error("Utilisateur cible non trouvé");

  if (!canEditTargetRole(me.role as UserRole, target.role as UserRole) && me.role !== "SUPERADMIN") {
    throw new Error("Vous ne pouvez pas supprimer ce membre (hiérarchie insuffisante)");
  }

  // Suppression cascade manuelle de Prisma si onDelete: Cascade n'est pas suffisant.
  // Dans next-auth et prisma, souvent `user` cascade sur session/account.
  // Mais par précaution pour les données forum :
  
  await prisma.$transaction([
    prisma.privateMessage.deleteMany({ where: { authorId: userId } }),
    prisma.conversation.deleteMany({ where: { OR: [{ user1Id: userId }, { user2Id: userId }] } }),
    prisma.postReaction.deleteMany({ where: { userId } }),
    prisma.mention.deleteMany({ where: { OR: [{ mentionerId: userId }, { mentionedUserId: userId }] } }),
    prisma.topicView.deleteMany({ where: { userId } }),
    prisma.post.deleteMany({ where: { authorId: userId } }),
    prisma.topic.deleteMany({ where: { authorId: userId } }),
    prisma.user.delete({ where: { id: userId } })
  ]);

  revalidatePath("/membres");
  return { success: true };
}

