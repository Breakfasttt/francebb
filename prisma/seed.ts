/**
 * Prisma Seed Wrapper
 * Ce fichier est conservé pour la compatibilité avec `npx prisma db seed`.
 * Il délègue toute la logique au système de setup centralisé dans `bdd/firstSetup.ts`.
 */

import { execSync } from "child_process";
import path from "path";

async function main() {
  console.log("🌱 Déclenchement du seed via firstSetup...");
  
  try {
    const scriptPath = path.join(process.cwd(), "bdd", "firstSetup.ts");
    // Utilisation de ts-node pour exécuter le setup initial de manière isolée
    execSync(`npx ts-node ${scriptPath}`, { stdio: "inherit" });
  } catch (error) {
    console.error("❌ Erreur lors de l'exécution du setup initial:", error);
    process.exit(1);
  }
}

main();
