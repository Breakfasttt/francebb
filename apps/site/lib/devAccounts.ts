/**
 * Comptes proposés à la connexion de développement (page de connexion et widget de la barre), en mode développement
 * seulement. Fichier volontairement sans « use server » : il n'est appelé que par du code serveur qui a déjà vérifié
 * `NODE_ENV === "development"`.
 *
 * Carte 221 : la liste montre aussi les comptes `exemple-*` du profil de base « exemple » (un par rôle, bannis
 * compris), triés du rôle le plus fort au plus faible, pour tester chaque cas en un clic.
 */
import { prisma } from "@/lib/prisma";

export const DEV_ACCOUNT_WHERE = {
  AND: [
    { id: { not: "system" } },
    {
      OR: [
        { email: { contains: "@test.com" } },
        { id: { startsWith: "test_" } },
        { id: { startsWith: "user_test_" } },
        { id: { startsWith: "exemple-" } },
        { role: { in: ["SUPERADMIN", "ADMIN", "MODERATOR"] } },
      ],
    },
  ],
};

/** Comptes de test, du rôle le plus fort au plus faible ; « · banni » est ajouté au rôle d'un compte banni. */
export async function findDevAccounts() {
  const users = await prisma.user.findMany({
    where: DEV_ACCOUNT_WHERE,
    select: { id: true, name: true, role: true, image: true, isBanned: true },
    orderBy: [{ roleConfig: { power: "desc" } }, { name: "asc" }],
    take: 40,
  });
  return users.map(({ isBanned, ...user }) => ({ ...user, role: isBanned ? `${user.role} · banni` : user.role }));
}
