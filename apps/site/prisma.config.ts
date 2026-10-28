import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
    // Base « fantôme » vide, utilisée seulement pour vérifier les migrations (prisma migrate diff, en CI)
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
