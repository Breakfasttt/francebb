/**
 * Prépare la base jetable des tests smoke : supprime e2e.db puis y pousse le schéma Prisma.
 * Chemin codé en dur : ne peut jamais viser dev.db ni la prod.
 */
import { rmSync } from "node:fs";
import { execSync } from "node:child_process";

rmSync("e2e.db", { force: true });
execSync("npx prisma db push", {
  stdio: ["ignore", "inherit", "inherit"],
  env: { ...process.env, DATABASE_URL: "file:./e2e.db", TURSO_DATABASE_URL: "" },
});
