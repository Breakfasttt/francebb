import { PrismaClient } from "@/prisma/generated-client"; // client-refresh
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient,
  prismaVersion?: string
};

const config = {
  url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./dev.db",
};
const getPrismaClient = () => {
  if (globalForPrisma.prisma && globalForPrisma.prismaVersion === "v18") {
    return globalForPrisma.prisma;
  }

  const adapter = new PrismaLibSql(config);
  // PRISMA_QUERY_LOG=1 : trace chaque requête (mesure des requêtes par rendu, scripts/baseline.mjs)
  const client = new PrismaClient({ adapter, log: process.env.PRISMA_QUERY_LOG === "1" ? ["query"] : [] });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaVersion = "v18";
  }
  return client;
};

export const prisma = getPrismaClient();

// v3: added Category, Forum, Topic, Post models
