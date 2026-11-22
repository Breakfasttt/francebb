/**
 * Levée d'un bannissement temporaire échu (carte 222). Appelée par le callback jwt d'auth.ts, qui relit le compte à
 * chaque lecture de la session : le membre retrouve l'accès à sa première visite après la date de fin.
 * Fichier serveur, volontairement sans « use server » (ce n'est pas une action appelable depuis le navigateur).
 */
import { prisma } from "@/lib/prisma";
import { isBanExpired } from "@/lib/banDuration";
import { logModerationAction } from "@/lib/moderationLog";

/** Compte technique au nom duquel la levée automatique est écrite au journal (créé par prisma/firstSetup.ts). */
const SYSTEM_USER_ID = "system";

/**
 * Lève le bannissement de `userId` si sa date de fin est passée. Renvoie `true` si le membre est encore banni.
 * La condition est reprise dans la requête : un bannissement définitif posé entre-temps n'est jamais levé.
 */
export async function liftExpiredBan(userId: string, isBanned: boolean, bannedUntil: Date | null, now = new Date()): Promise<boolean> {
  if (!isBanExpired(isBanned, bannedUntil, now)) return isBanned;
  const { count } = await prisma.user.updateMany({
    where: { id: userId, isBanned: true, bannedUntil: { lte: now } },
    data: { isBanned: false, banReason: null, bannedUntil: null },
  });
  if (count > 0) await logModerationAction(SYSTEM_USER_ID, "USER_UNBANNED", userId, "USER", "Fin du bannissement temporaire");
  return false;
}
