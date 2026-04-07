"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/roles";

export async function seedBBPusherAction() {
  const session = await auth();
  if (!isAdmin(session?.user?.role)) {
    return { success: false, error: "Seuls les admins peuvent seeder" };
  }

  const pusherId = "bbpusher";
  const systemUserId = "system";

  try {
    // 1. Ensure system user exists
    let systemUser = await prisma.user.findUnique({ where: { id: systemUserId } });
    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          id: systemUserId,
          name: "Système",
          email: "system@bbfrance.fr",
          role: "SUPERADMIN"
        }
      });
    }

    // 2. Ensure BBPusher resource exists
    const existing = await prisma.resource.findUnique({ where: { id: pusherId } });

    if (!existing) {
      await prisma.resource.create({
        data: {
          id: pusherId,
          title: "BB Pusher",
          description: "Plateau tactique interactif pour Blood Bowl. Placez vos joueurs, simulez des poussées et partagez vos schémas tactiques.",
          imageUrl: "/images/bbpusher-preview.jpg",
          link: "/bbpusher",
          status: "APPROVED",
          isSystem: true,
          authorId: systemUserId,
          tags: {
            connectOrCreate: {
              where: { name: "Outil Officiel" },
              create: { name: "Outil Officiel" }
            }
          }
        }
      });
      return { success: true, message: "BB Pusher créé" };
    } else {
      await prisma.resource.update({
        where: { id: pusherId },
        data: { isSystem: true }
      });
      return { success: true, message: "BB Pusher déjà présent, mis à jour comme Système" };
    }
  } catch (error: any) {
    console.error("Seed Error:", error);
    return { success: false, error: error.message };
  }
}
