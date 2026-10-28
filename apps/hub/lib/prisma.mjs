/**
 * Client Prisma de la base du hub (HUB_DATABASE_URL : fichier SQLite en local, Turso en prod).
 * Base distincte de celle du site : le hub ne connaît que l'identité (comptes, sessions, clients OIDC).
 */
import { PrismaClient } from "../prisma/generated-client/index.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const createClient = () =>
  new PrismaClient({
    adapter: new PrismaLibSql({
      url: process.env.HUB_DATABASE_URL || "file:./hub.db",
      authToken: process.env.HUB_DATABASE_AUTH_TOKEN,
    }),
  });

/** @type {{ hubPrisma?: ReturnType<typeof createClient> }} */
const globalForPrisma = /** @type {never} */ (globalThis);

export const prisma = globalForPrisma.hubPrisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.hubPrisma = prisma;
