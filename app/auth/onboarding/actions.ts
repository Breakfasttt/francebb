"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function finishOnboarding(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");

  const name = formData.get("name") as string;
  const nafNumber = formData.get("nafNumber") as string;
  const region = formData.get("region") as string;

  if (!name || name.length < 3) {
    throw new Error("Le pseudo doit faire au moins 3 caractères");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      nafNumber: nafNumber || null,
      region: region || null,
      hasFinishedOnboarding: true
    }
  });

  revalidatePath("/", "layout");
  return { success: true };
}
