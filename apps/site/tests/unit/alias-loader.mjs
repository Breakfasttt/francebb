/**
 * Chargeur des tests unitaires (carte 198) : passé à Node par `--import` dans le script `test:unit`
 * (`apps/site/package.json`). Il enregistre les règles de `alias-hooks.mjs`, qui font comprendre à Node l'alias `@/`
 * et les imports sans extension du code du site. Aucune bibliothèque n'est ajoutée : `register` fait partie de Node.
 */
import { register } from "node:module";

register("./alias-hooks.mjs", import.meta.url);
