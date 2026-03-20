"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEditTargetRole, UserRole } from "@/lib/roles";
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

  // Vérification de la hiérarchie :
  // 1. Est-ce que JE peux gérer les rôles ?
  // 2. Est-ce que JE peux éditer le rôle de CETTE personne ?
  if (!canEditTargetRole(me.role as UserRole, target.role as UserRole)) {
    throw new Error("Permissions insuffisantes pour modifier cet utilisateur");
  }

  // 3. Est-ce que le NOUVEAU rôle est inférieur au mien ? (déjà vérifié par canEditTargetRole si on considère qu'on ne peut pas élever quelqu'un au dessus de soi)
  // En fait, on doit s'assurer que newRole rank < myRole rank
  const ROLE_POWER = {
    ADMIN: 100, RC_NAF: 90, CONSEIL_ORGA: 80, MODERATOR: 70, 
    MODERATOR_BROCANTE: 60, MODERATOR_VESTIAIRES: 50, MODERATOR_TRADUCTEUR: 40, 
    ORGA: 30, COACH: 10
  };
  
  if (ROLE_POWER[newRole] >= ROLE_POWER[me.role as UserRole]) {
    throw new Error("Vous ne pouvez pas attribuer un rôle supérieur ou égal au vôtre");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });

  revalidatePath("/admin/users");
  return { success: true };
}
