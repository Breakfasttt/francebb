/**
 * Insère le jeu de données e2e du site (membre "Coach E2E" onboardé, email coach@e2e.test) dans apps/site/e2e.db,
 * en réutilisant le setup des tests du site (chemin de base relatif au dossier du site).
 */
import siteGlobalSetup from "../../site/tests/e2e/globalSetup";

export default async function globalSetup() {
  const hubDir = process.cwd();
  process.chdir("../site");
  try {
    await siteGlobalSetup();
  } finally {
    process.chdir(hubDir);
  }
}
