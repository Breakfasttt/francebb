"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecté");

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;
  const nafNumber = formData.get("nafNumber") as string;
  const region = formData.get("region") as string;
  const league = formData.get("league") as string;
  const signature = formData.get("signature") as string;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name || undefined,
      image: image || undefined,
      nafNumber: nafNumber || null,
      region: region || null,
      league: league || null,
      signature: signature || null,
    }
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function toggleBanUser(userId: string) {
  const session = await auth();
  if (!isModerator(session?.user?.role)) throw new Error("Action non autorisée");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true }
  });

  if (!user) throw new Error("Utilisateur introuvable");

  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: !user.isBanned }
  });

  revalidatePath(`/profile?id=${userId}`);
  return { success: true };
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
  console.log(`REPORT: User ${session.user.id} reported User ${userId} for: ${reason}`);
  
  // Future: create a Report model or send a PM to moderators
  return { success: true };
}
