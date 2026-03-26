import { PrismaClient } from "../prisma/generated-client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient,
  prismaVersion?: string
};

const config = {
  url: process.env.DATABASE_URL || "file:./dev.db",
};
console.log(`[PRISMA] Utilisation de la base : ${config.url}`);
const getPrismaClient = () => {
  if (globalForPrisma.prisma && globalForPrisma.prismaVersion === "v15") {
    return globalForPrisma.prisma;
  }

  console.log(`[PRISMA] Initialisation du client (Base: ${config.url})`);
  const adapter = new PrismaLibSql(config);
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaVersion = "v15";
  }
  return client;
};

export const prisma = getPrismaClient();

// v3: added Category, Forum, Topic, Post models
