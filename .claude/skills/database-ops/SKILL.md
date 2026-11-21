---
name: database-ops
description: Procédure sûre pour toute opération sur les bases de données Postgres de BBFrance (structure, données de base, bases locales, production Neon). À lire avant de toucher au schéma Prisma ou à une base réelle.
---

# Opérations sur la base de données

Le site, le hub, BBQuizz et BBScheme ont chacun leur base **Postgres** (ADR-0008) : hébergée chez **Neon** en production, lancée en local par `prisma dev` (sans Docker). Décision et raisons : `docs/adr/0004-reorganisation-et-postgres.md`.

## Règles absolues

- **Jamais** `prisma migrate reset` ni `db push --force-reset` sur une base réelle : ils effacent tout.
- Aucune suppression de données de membres sans accord exprès.
- Les adresses des bases ne sont jamais écrites dans un fichier du dépôt : variables d'environnement uniquement (`DATABASE_URL` pour le site, `HUB_DATABASE_URL` pour le hub, `BBQUIZZ_DATABASE_URL` et `BBSCHEME_DATABASE_URL` pour les deux applications en attente).
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
| `site-exemple`, `site-vide`, `site-prod` | `pnpm dev [exemple\|vide\|prod]` (racine ou `apps/site`) | Profils de base du site (carte 219) : données fictives, base vide, dernière sauvegarde JSON de `docs/backup-db/`. Le profil lancé écrit son adresse dans `apps/site/.env.local` |
| `import-test` | Automatique (`site-backup.ts convert`) | Base temporaire de la conversion d'une sauvegarde de la bêta |
| `hub` | `pnpm db:start` (dans `apps/hub`) | Développement du hub ; adresse écrite dans `apps/hub/.env.local` |
| `site-e2e`, `hub-e2e` | Automatique (`pnpm test:e2e`, `pnpm test:sso`) | Tests ; recréées vides à chaque lancement |
| `shadow` | Automatique (CI) | Base vide qui sert à vérifier les migrations |

- `prisma dev` choisit lui-même ses ports : les adresses sont enregistrées dans `.local-postgres.json` à la racine (hors git).
- Après un redémarrage de l'ordinateur, relancer `pnpm dev` pour le site, `pnpm db:start` pour une autre application.
- Explorer les données : `pnpm exec prisma studio` dans l'application.
- La base `prisma dev` coupe parfois la connexion sous des requêtes parallèles (« Server has closed the connection ») : relancer `pnpm dev` (site) ou `pnpm db:start` (autres applications). La base des tests (`site-e2e`) reste fiable.
- Sauvegardes du site (`apps/site/scripts/site-backup.ts`) : fichiers `docs/backup-db/bbfrance-site-backup-AAAAMMJJ.json` (dossier hors git, données personnelles). `export` lit une base sans la modifier ; `restore` ne vise qu'une base locale neuve : il applique les migrations jusqu'à celle de la sauvegarde, copie les lignes, puis applique les migrations suivantes, pour qu'une vieille sauvegarde subisse les mêmes transformations que la production ; `convert` fait de même depuis une sauvegarde SQLite de la bêta (structure de `0_init`). Exporter la production Neon depuis le poste serait une nouvelle exception à la règle ci-dessous : à décider avec le user.
- Repartir de zéro sur un profil du site : `pnpm dev <profil> --reset`. Le repère `devProfile` (table `SiteSetting`) dit avec quoi la base a été remplie ; sans lui, `pnpm dev` la remplit.

## Production (Neon)

- Données de base, une seule fois après la création de la base : `DATABASE_URL="<adresse Neon>" npx tsx prisma/firstSetup.ts` dans `apps/site` (voir `DEPLOY.md`).
- Avant une opération risquée : créer une **branche** Neon (une copie instantanée de la base), qui sert de sauvegarde. Neon permet aussi de restaurer la base à un instant passé.
- Ne jamais lancer de commande Prisma contre la production depuis un poste local, sauf `firstSetup` et le script d'enregistrement de client du hub décrits dans `DEPLOY.md`.

## Le client Prisma généré

- `apps/site/prisma/generated-client` est suivi par git et produit par `prisma generate` (générateur `prisma-client-js`). Il ne doit contenir que ce que ce générateur produit. Jusqu'à la carte 172, d'anciens fichiers `.ts` générés pour SQLite y traînaient : `tsx` les choisissait et tout script qui importait le client échouait. Pour vérifier : générer dans un dossier temporaire de `apps/site` et comparer les deux listes de fichiers.
- En local, `pnpm db:migrate` peut échouer (erreur P3006) : la base fantôme de Prisma est copiée de `template1`, qui est aussi la base de développement. Contournement : `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`, écrire le SQL dans `prisma/migrations/<horodatage>_<nom>/migration.sql`, puis `npx prisma migrate deploy` et `npx prisma generate`, et augmenter `CLIENT_VERSION` dans `lib/prisma.ts`.
- Requêtes SQL écrites à la main : une requête entière par `prisma.$queryRaw`…``, une liste avec `= ANY(${liste})`. Les morceaux `Prisma.sql` et `Prisma.join` importés du client généré ne sont pas reconnus (carte 170).

## Prisma 7 : ce qui piège

Le dépôt est en Prisma 7.5 ; chaque application a son `prisma.config.ts`.
- Prisma ne charge plus `.env` tout seul : c'est la configuration ou le script qui charge les variables.
- `migrate dev` et `db push` ne lancent plus `prisma generate` : le lancer à la main après une migration.
- Plus de remplissage automatique après une migration : `pnpm db:setup` ou `pnpm dev` s'en chargent.
- Le client se crée avec l'adaptateur `@prisma/adapter-pg` (voir `apps/site/lib/prisma.ts`).
- `prisma.$use` n'existe plus : passer par les extensions du client (`prismaWithEmail` en est une).
- Le site garde exprès le générateur `prisma-client-js` : ne pas basculer vers `prisma-client`.
- Guide officiel : https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7

## Particularités de Postgres à connaître

- **Recherche texte** : `contains` respecte les majuscules en Postgres. Pour une recherche de membres, ajouter `mode: "insensitive"`.
- **Listes** (`String[]`) : une liste vide `[]` n'est pas « aucune valeur ». Exemple : un client du hub sans `scopes` n'a droit à rien.
- **SQL brut** (`$queryRaw`) : noms de tables et de colonnes entre guillemets doubles (`"Topic"`).

## Pourquoi on a quitté Turso (historique)

L'outil de migration de Prisma ne savait pas joindre une base Turso distante (`libsql://…`, erreur `The database provider 'sqlite' does not support the protocol 'libsql'`). Il fallait deux adresses de base et du SQL appliqué à la main en production, sans historique fiable.
