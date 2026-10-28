/**
 * Filtre commun à toutes les recherches d'utilisateurs (forum, tournois, messagerie).
 * Recherche par pseudo uniquement : chercher aussi dans l'email permettait à un membre de deviner l'email d'un autre.
 * Exclut le chercheur, les bannis et les blocages dans les deux sens.
 */
import type { Prisma } from "@/prisma/generated-client";

export const USER_SEARCH_MIN_LENGTH = 2;

export function userSearchWhere(query: string, viewerId: string): Prisma.UserWhereInput {
  return {
    // SQLite : LIKE insensible à la casse pour l'ASCII
    name: { contains: query.trim() },
    isBanned: false,
    id: { not: viewerId },
    blockedBy: { none: { blockerId: viewerId } },
    blocks: { none: { blockedId: viewerId } },
  };
}
