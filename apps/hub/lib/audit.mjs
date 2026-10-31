/**
 * Journal d'audit du hub (carte 118, ADR-0007) : trace des actions sensibles (connexion, inscription, modification
 * du compte, bannissement, suppression), sans donnée personnelle en clair.
 * L'identifiant du compte et l'adresse IP sont remplacés par une empreinte HMAC calculée avec BETTER_AUTH_SECRET :
 * on peut retrouver toutes les lignes d'un même compte (en recalculant son empreinte), mais pas lire l'identifiant
 * ni l'adresse à partir de la ligne. Les lignes sont effacées après un an (lib/purge.ts).
 */
import { createHmac, randomUUID } from "node:crypto";
import { prisma } from "./prisma.mjs";

/** Empreinte d'une valeur, ou `null` si la valeur est absente. */
export function auditHash(value) {
  if (!value) return null;
  return createHmac("sha256", process.env.BETTER_AUTH_SECRET ?? "").update(String(value)).digest("hex");
}

/**
 * Écrit une ligne du journal. Une erreur d'écriture est signalée dans la console sans bloquer l'action du coach.
 * @param {{ action: string, userId?: string | null, ipAddress?: string | null }} entry
 */
export async function writeAudit({ action, userId, ipAddress }) {
  try {
    await prisma.auditLog.create({
      data: { id: randomUUID(), action, userHash: auditHash(userId), ipHash: auditHash(ipAddress), createdAt: new Date() },
    });
  } catch (error) {
    console.error(`Journal d'audit : écriture impossible (${action})`, error);
  }
}
