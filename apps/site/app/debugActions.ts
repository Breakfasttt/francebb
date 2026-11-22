"use server";

import { prisma } from "@/lib/prisma";
import { findDevAccounts } from "@/lib/devAccounts";
import { auth } from "@/auth";

/** Développement seulement : le site est-il branché sur le hub ? (bouton « compte du hub » de la fenêtre des comptes de test) */
export async function isDevHubMode(): Promise<boolean> {
  return process.env.NODE_ENV === "development" && process.env.AUTH_MODE === "hub" && !!process.env.HUB_ISSUER;
}

export async function getTestUsers() {
  if (process.env.NODE_ENV !== "development") return [];
  return findDevAccounts();
}

export async function createQuickTestUser(name: string, role: string = "COACH") {
  if (process.env.NODE_ENV !== "development") throw new Error("Only in dev");

  const id = `test_${name.toLowerCase().replace(/\s+/g, "_")}_${Math.floor(Math.random() * 1000)}`;
  
  const user = await prisma.user.create({
    data: {
      id,
      name,
      email: `${id}@test.com`,
      role,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      hasFinishedOnboarding: true // Par défaut pour les tests
    }
  });

  return { success: true, userId: user.id };
}

// Nettoyage des vieux tests si besoin (optionnel)
export async function clearTestUsers() {
    if (process.env.NODE_ENV !== "development") throw new Error("Only in dev");
    
    await prisma.user.deleteMany({
        where: {
            OR: [
                { email: { contains: "@test.com" } },
                { id: { startsWith: "test_" } }
            ],
            role: { not: "SUPERADMIN" } // Sécurité
        }
    });
    
    return { success: true };
}
