/**
 * Repère du profil de base local (carte 219) : lit ou écrit la ligne `SiteSetting` de clé `devProfile`, qui dit si la
 * base a déjà été remplie et avec quoi (« vide », « exemple », « prod:<fichier de sauvegarde> »).
 * Appelé par scripts/dev.mjs à la racine ; base visée : DATABASE_URL.
 *
 * Usage : npx tsx scripts/dev-profile.ts read          (affiche la valeur, rien si absente ou base sans tables)
 *         npx tsx scripts/dev-profile.ts write <valeur>
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated-client";

const KEY = "devProfile";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const [command, value] = process.argv.slice(2);
  if (command === "read") {
    // Base neuve, sans tables : pas encore de repère
    const setting = await prisma.siteSetting.findUnique({ where: { key: KEY } }).catch(() => null);
    process.stdout.write(setting?.value ?? "");
  } else if (command === "write" && value) {
    await prisma.siteSetting.upsert({ where: { key: KEY }, update: { value }, create: { key: KEY, value } });
  } else {
    throw new Error("Usage : dev-profile.ts read | write <valeur>");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
