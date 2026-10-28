---
name: database-ops
description: Procédure sûre pour toute opération sur la base de données de BBFrance (structure, données de base, production). À lire avant de toucher au schéma Prisma ou à une base réelle.
---

# Opérations sur la base de données

> **Situation au 28/10/2026** : le site tourne encore sur SQLite (fichier local) et Turso (production). Le passage à **Postgres** est décidé ([ADR-0004](../../../docs/adr/0004-reorganisation-et-postgres.md), cartes 041, 046 et 047). Ce skill sera réécrit à la carte 046.

## Pourquoi on quitte Turso

L'outil qui met à jour la structure de la base (Prisma Migrate) ne sait pas se connecter à une base Turso distante (adresse `libsql://…`). Il renvoie l'erreur `The database provider 'sqlite' does not support the protocol 'libsql'`. Il fallait donc deux adresses de base (`DATABASE_URL` en fichier local pour l'outil, `TURSO_DATABASE_URL` pour le site) et appliquer le SQL à la main en production, sans historique fiable. Avec Postgres, une seule adresse suffit et `prisma migrate deploy` met la production à jour automatiquement.

## Règles qui ne changent pas

- **Jamais** `prisma migrate reset` ni `db push --force-reset` sur une base réelle (ils effacent tout).
- Changement de structure : modifier `apps/site/prisma/schema.prisma`, puis créer une migration avec `pnpm exec prisma migrate dev --name <description>` (dans `apps/site`). Jamais de modification à la main.
- Données de base (rôles, catégories du forum, listes de référence) : `apps/site/prisma/firstSetup.ts`, lancé avec `npx tsx prisma/firstSetup.ts`. Ce fichier ne se modifie pas sans accord, et utilise toujours `upsert` (crée ou met à jour, ne duplique jamais).
- Aucune suppression de données de membres sans accord exprès.
- Les adresses et mots de passe des bases sont lus depuis les variables d'environnement. Jamais écrits dans un fichier du dépôt.

## En local

- Base : `apps/site/dev.db` (SQLite), adresse `DATABASE_URL="file:./dev.db"` dans `apps/site/.env`.
- Explorer les données : `pnpm exec prisma studio` (dans `apps/site`).
- Les tests utilisent une base jetable (`e2e.db`), recréée à chaque lancement.
- **Pas de Docker** : il ne fonctionne pas sur le poste du développeur. La future base Postgres locale passera par `npx prisma dev`, une base Neon de développement ou une installation classique (choix fait à la carte 041).

## Le hub de connexion

Le hub (`apps/hub`) a sa propre base, séparée de celle du site (`HUB_DATABASE_URL`). Son schéma Prisma est **généré** (`node scripts/generate-schema.mjs` dans `apps/hub`) : ne pas l'éditer à la main.
