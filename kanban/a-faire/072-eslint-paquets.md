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
