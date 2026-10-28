/**
 * Configuration Prisma du hub. L'adresse de la base vient de HUB_DATABASE_URL :
 * en local, écrite dans .env.local par scripts/local-postgres.mjs (pnpm db:start) ; en production, variable de Vercel.
 */
import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env.HUB_DATABASE_URL,
    // Base « fantôme » vide, utilisée seulement pour vérifier les migrations (prisma migrate diff, en CI)
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
