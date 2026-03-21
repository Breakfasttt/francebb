import { PrismaClient } from "../prisma/generated-client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient,
  prismaVersion?: string
};

const config = {
  url: process.env.DATABASE_URL || "file:d:/devperso/antigravity/bbfrance/dev.db",
};
console.log(`[PRISMA] Utilisation de la base : ${config.url}`);
const adapter = new PrismaLibSql(config);

// Forcer la remise à zéro du cache global pour le nouveau client custom
// v5: added isModerated, moderationReason to Post
if (globalForPrisma.prisma && globalForPrisma.prismaVersion !== "v5") {
  console.log("[PRISMA] Resetting global cache to v5 (post moderation support)");
  globalForPrisma.prisma = undefined as any;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaVersion = "v5";
}

// v3: added Category, Forum, Topic, Post models
