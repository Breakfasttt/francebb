"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Action pour créer un utilisateur de test en mode développement.
 */
export async function createDevUser() {
  if (process.env.NODE_ENV !== "development") return null;

  try {
    const id = `test_admin_${Math.floor(Math.random() * 1000)}`;
    const user = await prisma.user.create({
      data: {
        id,
        name: "Admin de Test",
        email: `${id}@test.com`,
        role: "SUPERADMIN",
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
        hasFinishedOnboarding: true
      }
    });

    revalidatePath("/auth/login");
    return user;
  } catch (error) {
    console.error("Erreur création utilisateur dev:", error);
    return null;
  }
}
