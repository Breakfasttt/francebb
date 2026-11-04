/**
 * Client Prisma de la base de l'application BBScheme (BBSCHEME_DATABASE_URL : Postgres local en développement, Neon en
 * production). Base distincte de celle du site : elle ne contient que les schémas tactiques.
 * Un seul client par processus : en développement, Next.js recharge les fichiers modifiés, et sans cette précaution
 * chaque rechargement ouvrirait de nouvelles connexions à la base.
 */
import { PrismaClient } from "../prisma/generated-client";
import { PrismaPg } from "@prisma/adapter-pg";

const createClient = () => new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.BBSCHEME_DATABASE_URL }) });

const globalForPrisma = globalThis as unknown as { bbschemePrisma?: ReturnType<typeof createClient> };

export const prisma = globalForPrisma.bbschemePrisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.bbschemePrisma = prisma;
