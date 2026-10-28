---
name: database-ops
description: Procédure sûre pour toute opération sur les bases de données Postgres de BBFrance (structure, données de base, bases locales, production Neon). À lire avant de toucher au schéma Prisma ou à une base réelle.
---

# Opérations sur la base de données

Le site et le hub ont chacun leur base **Postgres** : hébergée chez **Neon** en production, lancée en local par `prisma dev` (sans Docker). Décision et raisons : `docs/adr/0004-reorganisation-et-postgres.md`.

## Règles absolues

- **Jamais** `prisma migrate reset` ni `db push --force-reset` sur une base réelle : ils effacent tout.
- Aucune suppression de données de membres sans accord exprès.
- Les adresses des bases ne sont jamais écrites dans un fichier du dépôt : variables d'environnement uniquement (`DATABASE_URL` pour le site, `HUB_DATABASE_URL` pour le hub).
- `apps/site/prisma/firstSetup.ts` (données de base) : ne pas modifier sans accord ; toujours `upsert` (crée ou met à jour, ne duplique jamais).

## Changer la structure de la base

1. Modifier `apps/site/prisma/schema.prisma`. Pour le hub, son schéma est **généré** : modifier les plugins dans `apps/hub/lib/authPlugins.mjs`, puis lancer `node scripts/generate-schema.mjs`.
2. Créer la migration : `pnpm db:migrate --name <description>` dans l'application. Pour le hub : `pnpm exec prisma migrate dev --name <description>`.
3. Vérifier le fichier SQL créé dans `prisma/migrations/`. S'il contient un `DROP` (suppression de table ou de colonne), demander l'accord du user.
4. Commiter la migration avec le schéma. En production, elle est appliquée automatiquement au déploiement (`vercel-build` lance `prisma migrate deploy`). La CI vérifie qu'aucune migration n'a été oubliée.

## Bases locales (sans Docker)

L'outil `scripts/local-postgres.mjs` démarre de petits serveurs Postgres avec `prisma dev`. Chaque serveur ne contient qu'une base, d'où un serveur par usage :

| Base | Commande | Usage |
|---|---|---|
| `site` | `pnpm db:start` (dans `apps/site`) | Développement du site ; adresse écrite dans `apps/site/.env.local` |
| `hub` | `pnpm db:start` (dans `apps/hub`) | Développement du hub ; adresse écrite dans `apps/hub/.env.local` |
| `site-e2e`, `hub-e2e` | Automatique (`pnpm test:e2e`, `pnpm test:sso`) | Tests ; recréées vides à chaque lancement |
| `shadow` | Automatique (CI) | Base vide qui sert à vérifier les migrations |

- `prisma dev` choisit lui-même ses ports : les adresses sont enregistrées dans `.local-postgres.json` à la racine (hors git).
- Après un redémarrage de l'ordinateur, relancer `pnpm db:start`.
- Explorer les données : `pnpm exec prisma studio` dans l'application.
- Repartir d'une base de développement vide : `node scripts/local-postgres.mjs fresh site`, puis `pnpm exec prisma migrate deploy` et `pnpm db:setup`.

## Production (Neon)

- Données de base, une seule fois après la création de la base : `DATABASE_URL="<adresse Neon>" npx tsx prisma/firstSetup.ts` dans `apps/site` (voir `DEPLOY.md`).
- Avant une opération risquée : créer une **branche** Neon (une copie instantanée de la base), qui sert de sauvegarde. Neon permet aussi de restaurer la base à un instant passé.
- Ne jamais lancer de commande Prisma contre la production depuis un poste local, sauf `firstSetup` et le script d'enregistrement de client du hub décrits dans `DEPLOY.md`.

## Particularités de Postgres à connaître

- **Recherche texte** : `contains` respecte les majuscules en Postgres. Pour une recherche de membres, ajouter `mode: "insensitive"`.
- **Listes** (`String[]`) : une liste vide `[]` n'est pas « aucune valeur ». Exemple : un client du hub sans `scopes` n'a droit à rien.
- **SQL brut** (`$queryRaw`) : noms de tables et de colonnes entre guillemets doubles (`"Topic"`).

## Pourquoi on a quitté Turso (historique)

L'outil de migration de Prisma ne savait pas joindre une base Turso distante (`libsql://…`, erreur `The database provider 'sqlite' does not support the protocol 'libsql'`). Il fallait deux adresses de base et du SQL appliqué à la main en production, sans historique fiable.
