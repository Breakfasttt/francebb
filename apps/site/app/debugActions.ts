"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getTestUsers() {
  if (process.env.NODE_ENV !== "development") return [];
  
  return await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: "@test.com" } },
        { id: { startsWith: "test_" } },
        { id: { startsWith: "user_test_" } }
      ]
    },
    select: {
      id: true,
      name: true,
      role: true,
      image: true
    },
    orderBy: { name: "asc" }
  });
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
