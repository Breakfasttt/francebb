"use server";

import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/actionResult";

export async function finishOnboarding(formData: FormData): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non autorisé" };

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;
  const nafNumber = formData.get("nafNumber") as string;
  const region = formData.get("region") as string;
  const equipe = formData.get("equipe") as string;
  const ligueIds = formData.getAll("ligueIds") as string[];
  const ligueCustom = formData.get("ligueCustom") as string;
  const signature = formData.get("signature") as string;
  const avatarFrame = formData.get("avatarFrame") as string;

  if (!name || name.length < 3) {
    return { success: false, error: "Le pseudo doit faire au moins 3 caractères" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
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
      hasFinishedOnboarding: true
    }
  });

  // revalidatePath("/", "layout");
  return { success: true };
}
