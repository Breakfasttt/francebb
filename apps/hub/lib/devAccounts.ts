/**
 * Comptes de test du hub, pour se connecter en local sans Discord, Google ni email (carte 153).
 * Ils passent par la connexion par mot de passe réservée au développement : même condition que dans lib/auth.ts,
 * donc jamais disponibles en production. Leur email finit par « @test.com », comme les comptes de test du site.
 */
import { randomBytes } from "node:crypto";
import { auth } from "./auth";
import { prisma } from "./prisma.mjs";
import { DEV_ACCOUNT_PASSWORD } from "./devAccountPassword";

const DEV_EMAIL_DOMAIN = "@test.com";

export type DevAccount = { id: string; name: string; email: string };

/** Vrai seulement hors production et avec HUB_DEV_PASSWORD_LOGIN=1. */
export function devAccountsEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.HUB_DEV_PASSWORD_LOGIN === "1";
}

/** Comptes de test qui ont un mot de passe, les plus récents d'abord. */
export async function listDevAccounts(): Promise<DevAccount[]> {
  if (!devAccountsEnabled()) return [];
  return prisma.user.findMany({
    where: { email: { endsWith: DEV_EMAIL_DOMAIN }, account_userId: { some: { providerId: "credential" } } },
    select: { id: true, name: true, email: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

/**
 * Crée un compte de test par l'inscription de Better Auth (pseudo unique, journal, réglages par défaut),
 * puis marque son email comme vérifié : le site refuse un compte du hub dont l'email n'est pas vérifié.
 */
export async function createDevAccount(): Promise<DevAccount | null> {
  if (!devAccountsEnabled()) return null;
  const suffix = randomBytes(2).toString("hex");
  const email = `coach-test-${suffix}${DEV_EMAIL_DOMAIN}`;
  // Les champs ajoutés au compte (NAF, région…) sont facultatifs, mais le type de Better Auth les exige tous
  const body = { email, password: DEV_ACCOUNT_PASSWORD, name: `Coach test ${suffix}` } as NonNullable<Parameters<typeof auth.api.signUpEmail>[0]>["body"];
  const result = await auth.api.signUpEmail({ body });
  await prisma.user.update({ where: { id: result.user.id }, data: { emailVerified: true } });
  return { id: result.user.id, name: result.user.name, email };
}
