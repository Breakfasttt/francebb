import { PrismaClient } from "@/prisma/generated-client"; // client-refresh
import { PrismaPg } from "@prisma/adapter-pg";

// `prisma` (défaut) n'expose jamais User.email : un `include: { author: true }` envoyé au client
// ou dans une réponse d'API ne peut pas fuiter d'adresse. `prismaWithEmail` est réservé à
// l'auth (adapter Auth.js) et à l'envoi de mails ; ailleurs, surcharger localement avec `omit: { email: false }`.
const USER_PRIVATE_FIELDS = { user: { email: true } } as const;

const createClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    // PRISMA_QUERY_LOG=1 : trace chaque requête (mesure des requêtes par rendu, scripts/baseline.mjs)
    log: process.env.PRISMA_QUERY_LOG === "1" ? ["query"] : [],
  });

const createPublicClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: process.env.PRISMA_QUERY_LOG === "1" ? ["query"] : [],
    omit: USER_PRIVATE_FIELDS,
  });

const CLIENT_VERSION = "v19";
const globalForPrisma = global as unknown as {
  prisma?: ReturnType<typeof createPublicClient>;
  prismaWithEmail?: PrismaClient;
  prismaVersion?: string;
};

const isCached = globalForPrisma.prismaVersion === CLIENT_VERSION;
export const prisma = (isCached && globalForPrisma.prisma) || createPublicClient();
export const prismaWithEmail = (isCached && globalForPrisma.prismaWithEmail) || createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaWithEmail = prismaWithEmail;
  globalForPrisma.prismaVersion = CLIENT_VERSION;
}

// v3: added Category, Forum, Topic, Post models
