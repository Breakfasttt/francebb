import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const config = {
  url: process.env.DATABASE_URL || "file:d:/devperso/antigravity/bbfrance/dev.db",
};
console.log(`[PRISMA] Utilisation de la base : ${config.url}`);
const adapter = new PrismaLibSql(config);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
