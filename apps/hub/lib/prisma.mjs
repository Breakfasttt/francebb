/**
 * Client Prisma de la base du hub (HUB_DATABASE_URL : Postgres local en développement, Neon en production).
 * Base distincte de celle du site : le hub ne connaît que l'identité (comptes, sessions, applications clientes).
 */
import { PrismaClient } from "../prisma/generated-client/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

const createClient = () => new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.HUB_DATABASE_URL }) });

/** @type {{ hubPrisma?: ReturnType<typeof createClient> }} */
const globalForPrisma = /** @type {never} */ (globalThis);

export const prisma = globalForPrisma.hubPrisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.hubPrisma = prisma;
