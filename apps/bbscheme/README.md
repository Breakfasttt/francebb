# BBScheme — application des schémas tactiques

BBScheme est l'éditeur de schémas tactiques de Blood Bowl France : on y place les joueurs sur un terrain, on dessine les déplacements et on enchaîne des images pour expliquer une action. Les schémas publiés s'affichent, animés, dans les messages du forum du site.

Depuis la carte 179 (décision ADR-0008), BBScheme est une application à part dans le dépôt, avec sa propre base de données Postgres.

## État : en attente

- L'éditeur ne tourne pas : son code est rangé dans `editeur-en-attente/` (voir son `README.md`), en attendant sa relance par la carte 071, qui le branchera aussi sur le hub de connexion.
- L'application sert seulement :
  - une page d'accueil « BBScheme revient bientôt » ;
  - l'adresse de lecture `GET /api/boards/<identifiant>`, par laquelle le site affiche les schémas déjà publiés. Elle cherche le schéma par identifiant, puis par empreinte, et renvoie `{ "data": "<contenu JSON>" }` (404 si le schéma est inconnu), sans aucune donnée personnelle, avec un cache d'une minute.
- Point à traiter à la relance : quand un membre supprime son compte, le site ne peut plus effacer l'identifiant du créateur de ses schémas, qui sont dans cette base. L'application devra écouter l'événement de suppression envoyé par le hub.

## Lancer l'application en local

Depuis `apps/bbscheme` :

1. `cp .env.example .env` (rien à remplir en local) ;
2. `pnpm db:start` : démarre la base locale `bbscheme` (Postgres lancé par `prisma dev`, sans Docker) et écrit son adresse dans `.env.local` ;
3. `pnpm db:generate` puis `npx prisma migrate deploy` : crée le client Prisma et les tables ;
4. facultatif : `BBSCHEME_DATABASE_URL="$(node ../../scripts/local-postgres.mjs url bbscheme)" npx tsx scripts/import-beta-backup.ts ../../docs/backup-db/bbfrance-db-backup-20261104.db` reprend les 13 schémas de l'ancienne production (la sauvegarde n'est pas dans git) ;
5. `pnpm dev` : l'application répond sur http://localhost:4100.

Pour que le site affiche les schémas, mettre `BBSCHEME_URL=http://localhost:4100` dans `apps/site/.env`.

## Relancer l'éditeur

Voir `editeur-en-attente/README.md` : déplacer les fichiers dans `app/`, remplacer les imports du site, ajouter les dépendances de l'interface, servir les rosters, brancher le hub, puis rebrancher les tests.
