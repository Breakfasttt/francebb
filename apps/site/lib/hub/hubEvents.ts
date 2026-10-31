/**
 * Traitement des événements signés du hub par le site (carte 122, ADR-0007). Chaque traitement écrit l'état reçu :
 * le rejouer ne change rien. Un coach que le site ne connaît pas est ignoré.
 * - user.updated : copie locale du profil (pseudo, avatar, NAF, région) ; lève un bannissement venu du hub.
 * - user.banned : banni sur le site aussi (effet à la requête suivante, voir lib/authGuard.ts).
 * - user.deletion_scheduled / user.deletion_cancelled : accès coupé pendant le délai de grâce, puis rendu.
 * - user.deleted : membre anonymisé puis supprimé (lib/accountDeletion.ts, carte 124). Un échec lève une erreur :
 *   pas d'accusé de réception, le hub renvoie l'événement et attend avant d'effacer le passeport.
 * Un bannissement décidé par la modération du site n'est jamais levé par le hub : seules les raisons ci-dessous le sont.
 * Fichier volontairement PAS « use server » : appelé seulement par app/api/hub/events/route.ts, après vérification.
 */
import { prisma } from "@/lib/prisma";
import { findUserByHubId } from "./hubAccount";
import { anonymizeAndDeleteUser } from "@/lib/accountDeletion";
import type { HubEvent } from "./verifyHubEvent";

export const HUB_BAN_REASON = "Compte suspendu sur le passeport BBFrance.";
export const HUB_DELETION_REASON = "Suppression du compte demandée sur le passeport BBFrance.";

type HubProfile = { name?: string; image?: string | null; naf?: string | null; region?: string | null };

/** Lève l'accès coupé par le hub pour cette raison, sans toucher à un bannissement de la modération du site. */
async function liftHubBlock(userId: string, reason: string) {
  await prisma.user.updateMany({ where: { id: userId, isBanned: true, banReason: reason }, data: { isBanned: false, banReason: null } });
}

/** Coupe l'accès pour une raison venue du hub, sauf si le membre est déjà banni par la modération du site. */
async function applyHubBlock(userId: string, reason: string) {
  await prisma.user.updateMany({ where: { id: userId, isBanned: false }, data: { isBanned: true, banReason: reason } });
}

export async function handleHubEvent(event: HubEvent) {
  const userId = await findUserByHubId(event.data.userId);
  if (!userId) return;

  switch (event.type) {
    case "user.updated": {
      const profile = event.data.profile as HubProfile | undefined;
      if (profile) {
        await prisma.user.update({
          where: { id: userId },
          data: { name: profile.name, image: profile.image ?? null, nafNumber: profile.naf ?? null, region: profile.region ?? null },
        });
      }
      if (event.data.banned === false) await liftHubBlock(userId, HUB_BAN_REASON);
      break;
    }
    case "user.banned":
      await applyHubBlock(userId, HUB_BAN_REASON);
      break;
    case "user.deletion_scheduled":
      await applyHubBlock(userId, HUB_DELETION_REASON);
      break;
    case "user.deletion_cancelled":
      await liftHubBlock(userId, HUB_DELETION_REASON);
      break;
    case "user.deleted":
      if (!(await anonymizeAndDeleteUser(userId, false))) throw new Error("Suppression du membre impossible");
      break;
    // Type inconnu (ajouté plus tard par le hub) : ignoré, l'accusé de réception évite des renvois inutiles
  }
}
