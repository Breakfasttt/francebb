/**
 * Bannissement global d'un compte BBFrance, au niveau du hub (carte 037).
 * Usage : node scripts/ban-user.mjs <email> "<raison>"      → bannit
 *         node scripts/ban-user.mjs <email> --unban           → lève le bannissement
 * Adresse de la base : HUB_DATABASE_URL (en local, lue dans .env.local écrit par `pnpm db:start`).
 *
 * Effets d'un bannissement : le compte ne peut plus se connecter au hub (plugin admin de Better Auth), ses sessions
 * hub sont fermées et ses jetons d'accès aux applications révoqués. Une application où le membre est déjà connecté
 * garde sa propre session jusqu'à son expiration : bannir aussi le membre sur le site pour un effet immédiat.
 */
import { existsSync } from "node:fs";

for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);
const { prisma } = await import("../lib/prisma.mjs");

const [email, reasonOrFlag] = process.argv.slice(2);
if (!email || !reasonOrFlag) {
  console.error('Usage : node scripts/ban-user.mjs <email> "<raison>"  |  node scripts/ban-user.mjs <email> --unban');
  process.exit(1);
}

const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
if (!user) {
  console.error(`Aucun compte avec l'email ${email}.`);
  process.exit(1);
}

if (reasonOrFlag === "--unban") {
  await prisma.user.update({ where: { id: user.id }, data: { banned: false, banReason: null, banExpires: null } });
  console.log(`Bannissement levé pour ${user.name}.`);
} else {
  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { banned: true, banReason: reasonOrFlag } }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
    prisma.oauthAccessToken.updateMany({ where: { userId: user.id, revoked: null }, data: { revoked: now } }),
    prisma.oauthRefreshToken.updateMany({ where: { userId: user.id, revoked: null }, data: { revoked: now } }),
  ]);
  console.log(`${user.name} est banni du hub : sessions fermées, accès aux applications révoqués.`);
}
await prisma.$disconnect();
