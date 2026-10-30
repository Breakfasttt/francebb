import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Un code couleur hexadécimal (#fff, #1a2b3c, #1a2b3c80) écrit en dur dans une chaîne.
// Les couleurs doivent passer par les variables CSS des thèmes (voir ARCHITECTURE.md).
const HEX_COLOR = "/#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b/";
const HEX_COLOR_MESSAGE =
  "Code couleur en dur : utiliser une variable CSS des thèmes, par exemple var(--primary) (skill theming-rules).";

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
      "no-restricted-syntax": [
        "error",
        { selector: `Literal[value=${HEX_COLOR}]`, message: HEX_COLOR_MESSAGE },
        { selector: `TemplateElement[value.raw=${HEX_COLOR}]`, message: HEX_COLOR_MESSAGE },
      ],
      // Boutons et listes déroulantes : utiliser les composants du site (ClassicButton,
      // CTAButton… et ClassicSelect), qui respectent les thèmes et la taille minimale
      // de 44 pixels sur téléphone.
      "react/forbid-elements": [
        "error",
        {
          forbid: [
            {
              element: "button",
              message: "utiliser un bouton de common/components/Button, par exemple ClassicButton (skill ui-components).",
            },
            {
              element: "select",
              message: "utiliser ClassicSelect de common/components/Form (skill ui-components).",
            },
          ],
        },
      ],
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
