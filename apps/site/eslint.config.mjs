import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { forbidNativeElementsRule, hexColorRule } from "./eslint.rules.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Règles d'architecture du projet (carte 013). Le cliquet (scripts/lint-ratchet.mjs)
  // tolère les erreurs déjà présentes, règle par règle, et refuse toute nouvelle erreur.
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    rules: {
      // Frontière entre applications : le site n'importe jamais le code d'une autre
      // application (hub, futur BBScheme). Ce qui est partagé passe par packages/.
      // Sont refusés : le nom de paquet d'une autre application, un chemin qui passe par
      // « apps/ », et un chemin relatif qui remonte jusqu'au dossier du hub.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@bbfrance/hub", "@bbfrance/hub/*", "@bbfrance/bbscheme", "@bbfrance/bbscheme/*"],
              message: "Une application n'importe pas le code d'une autre : passer par un paquet de packages/.",
            },
            {
              regex: "(^|/)apps/|^(\\.\\./)+hub(/|$)",
              message: "Une application n'importe pas le code d'une autre : passer par un paquet de packages/.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      // Couleurs : aucun code hexadécimal dans les composants.
      "no-restricted-syntax": hexColorRule,
      // Boutons et listes déroulantes : utiliser les composants du site (voir eslint.rules.mjs).
      "react/forbid-elements": forbidNativeElementsRule,
    },
  },
  {
    // Les composants de base eux-mêmes sont construits sur les éléments natifs.
    files: ["common/components/Button/**", "common/components/Form/ClassicSelect.tsx"],
    rules: { "react/forbid-elements": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Code généré et sorties de tests
    "prisma/generated-client/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
