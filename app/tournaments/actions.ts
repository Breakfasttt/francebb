"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Marque un tournoi comme terminé.
 */
export async function finishTournament(tournamentId: string) {
  const session = await auth();
  if (!session?.user) return null;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { 
      commissaires: { select: { id: true } },
      topic: { select: { id: true } }
    }
  });

  if (!tournament) return null;

  // Autorisation : Organisateur, Commissaire ou SUPERADMIN
  const isOrganizer = tournament.organizerId === session.user.id;
  const isCommissaire = tournament.commissaires.some(c => c.id === session.user.id);
  const isSuperAdmin = session.user.role === "SUPERADMIN";

  if (!isOrganizer && !isCommissaire && !isSuperAdmin) {
    return null;
  }

  await (prisma.tournament as any).update({
    where: { id: tournamentId },
    data: { isFinished: true }
  });

  revalidatePath("/tournaments");
  if (tournament.topic?.id) {
    revalidatePath(`/forum/topic/${tournament.topic.id}`);
  }
  return { success: true };
}

/**
 * Marque un tournoi comme annulé.
 */
export async function cancelTournament(tournamentId: string) {
  const session = await auth();
  if (!session?.user) return null;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { 
      commissaires: { select: { id: true } },
      topic: { select: { id: true } }
    }
  });

  if (!tournament) return null;

  // Autorisation : Organisateur, Commissaire ou SUPERADMIN
  const isOrganizer = tournament.organizerId === session.user.id;
  const isCommissaire = tournament.commissaires.some(c => c.id === session.user.id);
  const isSuperAdmin = session.user.role === "SUPERADMIN";

  if (!isOrganizer && !isCommissaire && !isSuperAdmin) {
    return null;
  }

  await (prisma.tournament as any).update({
    where: { id: tournamentId },
    data: { 
      isCancelled: true,
      isFinished: true // Un tournoi annulé est automatiquement terminé
    }
  });

  revalidatePath("/tournaments");
  if (tournament.topic?.id) {
    revalidatePath(`/forum/topic/${tournament.topic.id}`);
  }
  return { success: true };
}
