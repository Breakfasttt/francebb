/**
 * Règles de résolution des imports pour les tests unitaires (carte 198), chargées par `alias-loader.mjs`.
 *
 * Le code du site écrit ses imports comme Next.js les comprend :
 * - `@/lib/prisma` : l'alias `@/` désigne le dossier `apps/site/` (réglage `paths` de `tsconfig.json`) ;
 * - `./forumAccess` : sans extension, alors que Node exige le nom complet du fichier (`./forumAccess.ts`).
 * Node seul ne comprend ni l'un ni l'autre. Ce fichier traduit ces imports en chemins de fichiers réels, en essayant
 * dans l'ordre : le chemin tel quel, puis avec `.ts`, `.tsx`, `/index.ts`. Tout autre import (bibliothèques, modules
 * de Node) passe sans changement.
 */
import { existsSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

/** Dossier `apps/site/`, que désigne l'alias `@/`. */
const SITE_ROOT = new URL("../../", import.meta.url);
const CANDIDATE_SUFFIXES = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

/** Premier fichier existant parmi les candidats, ou rien. */
function findFile(baseUrl) {
  for (const suffix of CANDIDATE_SUFFIXES) {
    const url = new URL(baseUrl.href + suffix);
    const path = fileURLToPath(url);
    if (existsSync(path) && statSync(path).isFile()) return pathToFileURL(path).href;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const found = findFile(new URL(specifier.slice(2), SITE_ROOT));
    if (found) return nextResolve(found, context);
  } else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
    // Import relatif sans extension, écrit pour Next.js
    const target = new URL(specifier, context.parentURL);
    const path = fileURLToPath(target);
    if (!(existsSync(path) && statSync(path).isFile())) {
      const found = findFile(target);
      if (found) return nextResolve(found, context);
    }
  }
  return nextResolve(specifier, context);
}
