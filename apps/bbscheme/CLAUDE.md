# apps/bbscheme — l'application BBScheme

Application des schémas tactiques BBScheme, sortie du site par la carte 179 (décision `docs/adr/0008-quiz-et-bbscheme-hors-du-site.md`), avec sa propre base de données. Fiche : `docs/features/bbscheme/README.md`. Règles générales : `.claude/CLAUDE.md` à la racine.

- **En attente** : l'application ne sert qu'une page « BBScheme revient bientôt » et l'adresse de lecture `GET /api/boards/[id]`, que le site appelle pour afficher les schémas des messages. Cette adresse ne renvoie jamais de donnée personnelle (pas de `creatorId`) et sa réponse garde la forme `{ data }` attendue par le lecteur.
- L'éditeur est rangé dans `editeur-en-attente/`, hors des pages servies et de la vérification des types. Sa relance (carte 071) suit le `README.md` de ce dossier.
- **Indépendante** : elle n'importe jamais le code du site ni du hub ; ce qui est partagé passe par `packages/`.
- Le client Prisma généré n'est pas enregistré dans git : lancer `pnpm db:generate` avant `typecheck` ou `dev`. Nouvelle migration : `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`, écrite dans `prisma/migrations/<horodatage>_<nom>/migration.sql`, puis `npx prisma migrate deploy` (skill `database-ops`).
- En local : `pnpm db:start` (base Postgres locale `bbscheme`, sans Docker), `npx prisma migrate deploy`, puis `pnpm dev` (port 4100). Le site la trouve par son réglage `BBSCHEME_URL=http://localhost:4100`.
