---
id: 219
title: Une commande pour tester en local, 3 profils de base
app: site
---

# 219 — Une commande pour tester en local, 3 profils de base

## Pourquoi

Tester le site demande plusieurs commandes (`pnpm db:start`, migrations, `db:setup`, `pnpm dev`) et la base locale « site » a un contenu non maîtrisé. Le but : une seule commande qui prépare la base et lance le site, avec un profil de base au choix.

- `vide` : structure et données de base (`firstSetup`), sans membre ni contenu.
- `exemple` (par défaut) : données de base et données fictives.
- `prod` : données de base et import de la dernière sauvegarde de `docs/backup-db/`.

Décisions du user : site seul (pas le hub, BBScheme ni BBQuizz) ; l'ancienne base locale « site » est supprimée.

## À faire

- [x] `scripts/local-postgres.mjs` : remplacer la base `site` par `site-vide`, `site-exemple`, `site-prod` (un serveur `prisma dev` chacun, tous écrivent `DATABASE_URL` dans `apps/site/.env.local`).
- [x] Supprimer le serveur `bbfrance-site` et son entrée de `.local-postgres.json`.
- [x] `scripts/dev.mjs`, appelé par `pnpm dev [vide|exemple|prod] [--reset]` : démarre le serveur du profil, applique les migrations, remplit la base si le repère `SiteSetting` `devProfile` est absent, puis lance le site. Profil prod : réimport automatique si une sauvegarde plus récente apparaît.
- [x] `apps/site/prisma/seedScript/exampleData.ts` : membres fictifs de chaque rôle, forum, articles, ressources, ligues, tournois, messages privés, notifications. Idempotent.
- [x] Profil prod sur des sauvegardes JSON complètes : `apps/site/scripts/site-backup.ts` (convert, export, restore). L'ancienne sauvegarde SQLite de la bêta est convertie (gardée) en `bbfrance-site-backup-20261104.json`. `docs/backup-db/` ignoré par git.
- [x] `pnpm dev` dans `apps/site` fait la même chose qu'à la racine.
- [x] Retirer `db:start` de `apps/site/package.json` ; mettre à jour README, skill `database-ops`, `docs/GLOSSAIRE.md` (« profil de base »).
- [x] Vérifier : `pnpm check`, puis les profils vide et prod lancés deux fois (remplissage puis démarrage rapide), remplissage exemple relancé sans doublon.

## Résultat

- `pnpm dev [vide|exemple|prod] [--reset]`, à la racine ou dans `apps/site` (`scripts/dev.mjs`) : démarre le serveur Postgres local du profil, applique les migrations, remplit la base au premier lancement (repère `devProfile` dans `SiteSetting`), puis lance `next dev`. Marche aussi avec `npm run dev` quand pnpm n'est pas dans le PATH.
- Trois serveurs locaux `site-vide`, `site-exemple`, `site-prod` ; l'ancienne base `site` est supprimée.
- Profil exemple : `prisma/seedScript/exampleData.ts`, données fictives idempotentes (identifiants `exemple-…`).
- Profil prod : sauvegardes JSON `docs/backup-db/bbfrance-site-backup-AAAAMMJJ.json` (dossier ignoré par git), outil `scripts/site-backup.ts` (`convert`, `export`, `restore`). La restauration applique les migrations jusqu'à celle de la sauvegarde, copie les lignes, puis applique les suivantes. L'ancienne sauvegarde SQLite de la bêta (structure de `0_init`) a été convertie, et gardée.
- À décider plus tard : exporter la production Neon avec `site-backup.ts export` serait une exception à la règle « aucune commande Prisma contre la production depuis le poste ».
- Non essayé : `--reset` (il réutilise `freshLocalDatabase`, déjà servi par les tests).
