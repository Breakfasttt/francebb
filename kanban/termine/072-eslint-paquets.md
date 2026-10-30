---
id: 072
title: "Contrôler les paquets avec ESLint"
epic: E01
app: packages
depends_on: [024]
adr:
verify: `corepack pnpm lint:ratchet` relit aussi packages/ui et packages/bbscheme-player, avec un plafond par paquet ; une couleur écrite en dur ajoutée dans un paquet fait échouer le contrôle
---

# 072 — Contrôler les paquets avec ESLint

## Pourquoi

ESLint (l'outil qui relit le code et signale les erreurs et les règles du projet non respectées) ne relit que `apps/site`. Le code partagé de `packages/ui` et de `packages/bbscheme-player` échappe donc à toutes les règles : couleurs écrites en dur au lieu des variables de thème, type `any`, boutons natifs. En sortant le lecteur BBScheme du site, la carte 024 a fait baisser le compteur du site de 840 à 817 erreurs, mais ces 23 erreurs n'ont pas disparu : elles ne sont simplement plus comptées.

## Action

- Donner à chaque paquet une configuration ESLint (partagée si possible avec celle du site) et une commande `lint`.
- Étendre le cliquet (`apps/site/scripts/lint-ratchet.mjs`, qui interdit au nombre d'erreurs d'augmenter) aux paquets, avec un plafond par paquet fixé au nombre d'erreurs actuel.
- Expliquer le fonctionnement dans `ARCHITECTURE.md`.

## Résultat

- Le cliquet `apps/site/scripts/lint-ratchet.mjs` contrôle maintenant trois cibles : le site, `packages/ui` et `packages/bbscheme-player`, chacune avec son plafond dans son propre `lint-baseline.json`. Un seul `corepack pnpm lint:ratchet` les relit toutes, et `--update` abaisse tous les plafonds.
- Les paquets n'installent pas ESLint (aucune bibliothèque ajoutée) : ils utilisent celui du site avec la nouvelle configuration `apps/site/eslint.packages.config.mjs`. Les règles des couleurs en dur et des boutons natifs sont maintenant dans `apps/site/eslint.rules.mjs`, partagé avec `eslint.config.mjs` du site. Les règles d'imports entre applications ne s'appliquent pas aux paquets, et `packages/ui/src/button.tsx` est exclu de l'interdiction du `<button>` natif puisqu'il définit le composant Button.
- Plafonds fixés au compte actuel, sans corriger d'erreur : `packages/ui` 0 ; `packages/bbscheme-player` 23 (11 `any`, 11 couleurs en dur, 1 `set-state-in-effect`), ce qui retrouve les 23 erreurs sorties du site par la carte 024. Plafond du site inchangé à 817.
- Vérifications : une couleur `#ff0000` ajoutée dans `packages/ui/src/toaster.tsx` fait échouer le cliquet (puis retirée) ; `npx tsc --noEmit` dans `apps/site` sans erreur ; cliquet au vert. Un avertissement inoffensif du greffon Next (« Pages directory cannot be found ») s'affiche pour chaque paquet, car ils n'ont pas de dossier `pages`.
- `ARCHITECTURE.md` et `README.md` mis à jour.
