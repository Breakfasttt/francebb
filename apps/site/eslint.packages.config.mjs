import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { forbidNativeElementsRule, hexColorRule } from "./eslint.rules.mjs";

// Configuration ESLint des paquets (packages/ui, packages/bbscheme-player).
// Elle est lue par le cliquet (scripts/lint-ratchet.mjs), qui l'applique à chaque paquet ;
// les paquets n'installent pas ESLint eux-mêmes, ils réutilisent celui du site.
// Les règles d'imports entre applications ne s'appliquent pas aux paquets : seules les
// règles des couleurs en dur et des boutons natifs sont reprises de la configuration du site.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.tsx"],
    rules: {
      "no-restricted-syntax": hexColorRule,
      "react/forbid-elements": forbidNativeElementsRule,
    },
  },
  {
    // Le composant Button du paquet ui est lui-même construit sur l'élément natif <button>.
    files: ["src/button.tsx"],
    rules: { "react/forbid-elements": "off" },
  },
]);
