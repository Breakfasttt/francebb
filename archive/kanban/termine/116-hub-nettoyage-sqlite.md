---
id: 116
title: "Hub : retirer les restes de l'ancienne base SQLite"
epic: E06
app: hub
depends_on: []
adr:
verify: plus aucune mention de « file:./hub.db » dans apps/hub/.env, plus de fichiers hub.db ni hub-e2e.db dans apps/hub ; corepack pnpm test:sso passe dans apps/hub
---

# 116 — Hub : retirer les restes de l'ancienne base SQLite

## Pourquoi

Le hub de connexion utilisait au début une petite base dans un fichier (SQLite). Il utilise maintenant Postgres, comme le site. Il reste pourtant des traces de l'ancienne base sur le poste du développeur : la ligne `HUB_DATABASE_URL=file:./hub.db` dans `apps/hub/.env` (elle ne sert plus, car `apps/hub/.env.local`, écrit par `pnpm db:start`, la remplace) et les fichiers `hub.db` et `hub-e2e.db`. Ces restes peuvent faire croire à quelqu'un qui découvre le projet que le hub tourne encore sur SQLite.

## Action

- Vérifier qu'aucun code ni script ne lit encore `hub.db` ou `hub-e2e.db` (recherche dans `apps/hub`).
- Vider la ligne `HUB_DATABASE_URL` de `apps/hub/.env`, comme dans `apps/hub/.env.example`.
- Supprimer `apps/hub/hub.db` et `apps/hub/hub-e2e.db` (fichiers locaux, non suivis par git, qui ne contiennent que des données de test).
- Vérifier que le hub démarre (`corepack pnpm dev`) et que `corepack pnpm test:sso` passe.

## Résultat

- Aucun code ni script du hub ne lit plus `hub.db` ou `hub-e2e.db` (recherche dans `apps/hub`, hors client Prisma généré).
- `apps/hub/hub.db` et `apps/hub/hub-e2e.db` supprimés (fichiers ignorés par git, données de test seulement).
- La ligne `HUB_DATABASE_URL=file:./hub.db` de `apps/hub/.env` est à vider à la main : les fichiers `.env` sont protégés contre toute modification par l'IA. Elle ne sert de toute façon plus, `apps/hub/.env.local` la remplace.
- `test:sso` : 10 tests sur 11 passent. Un test attendait encore l'ancien libellé du bouton du site, « Recevoir un lien magique », devenu « Recevoir un lien de connexion par e-mail » pendant la refonte : corrigé. Le test « un pseudo changé au passeport revient sur le site » échoue : il relève de la carte 122, en cours (noté dans la carte).
