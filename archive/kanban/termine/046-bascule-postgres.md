---
id: 046
title: Passer le site et le hub sur Postgres
epic: E02
app: site
depends_on: [041]
adr: 0004
verify: tous les tests passent sur Postgres en local et en déploiement de test
---

# 046 — Passer le site et le hub sur Postgres

## Pourquoi

Suite de l'essai 041 : remplacer SQLite/Turso par Postgres partout.

## Action

Schéma Prisma du site et du hub en Postgres, une seule migration de départ chacun, `prisma migrate deploy` lancé au déploiement. Base locale selon le résultat de 041. Tests (site et hub) sur Postgres local. Réécrire `DEPLOY.md`, le README et le skill `database-ops`.

## Résultat

Le site et le hub tournent sur **Postgres**.
- **Une seule migration de départ** par application (`0_init`), qui remplace les 26 migrations SQLite. Bibliothèque `@prisma/adapter-pg` 7.5.0 à la place de `@prisma/adapter-libsql` et `@libsql/client`.
- **Bases locales sans Docker** : `scripts/local-postgres.mjs` lance des serveurs `prisma dev` (développement du site, du hub, tests, base « fantôme » pour la CI). `prisma dev` choisissant ses ports, les adresses sont gardées dans `.local-postgres.json` et écrites dans le `.env.local` de chaque application. Commandes : `pnpm db:start`, `pnpm db:migrate`, `pnpm db:setup`.
- **Production** : le script `vercel-build` applique les migrations à chaque déploiement (`prisma migrate deploy`). `DEPLOY.md` est réécrit pour Neon.
- **Recherches** : `mode: "insensitive"` ajouté aux 21 recherches visibles des membres. En Postgres, `contains` respecte les majuscules, contrairement à SQLite.
- **Hub** : le schéma généré utilise de vraies colonnes tableau (`String[]`) et JSON. Le script d'enregistrement de client liste explicitement les droits (`scopes`), car une liste vide n'en autorise aucun.
- **Retiré** : l'onglet « Sauvegardes » de l'administration et `/api/admin/backup` (ils téléchargeaient le fichier SQLite, inexistant avec Postgres ; Neon fournit les sauvegardes), ainsi que `scripts/turso-backup.mjs`. La taille de la base, dans les statistiques, est demandée à Postgres.
- **CI** : vérification des migrations du site et du hub avec une base « fantôme » locale.
- **Vérifié** : builds du site et du hub, 31 tests du site (captures des 7 thèmes comprises), 2 tests de connexion via le hub, typecheck, lint (plafond abaissé).
