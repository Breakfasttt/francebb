import { PrismaClient } from "@/prisma/generated-client"; // client-refresh
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient,
  prismaVersion?: string
};

const config = {
  url: process.env.DATABASE_URL || "file:./dev.db",
};
const getPrismaClient = () => {
  if (globalForPrisma.prisma && globalForPrisma.prismaVersion === "v16") {
    return globalForPrisma.prisma;
  }

  const adapter = new PrismaLibSql(config);
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaVersion = "v16";
  }
  return client;
};

export const prisma = getPrismaClient();

// v3: added Category, Forum, Topic, Post models
