# apps/bbquizz — l'application BBQuizz

Application du quiz BBQuizz, sortie du site par la carte 180 (décision `docs/adr/0008-quiz-et-bbscheme-hors-du-site.md`), avec sa propre base de données. Fiche : `docs/features/bbquizz/README.md`. Règles générales : `.claude/CLAUDE.md` à la racine.

- **En attente** : l'application ne sert qu'une page « Le quiz revient bientôt ». Le site n'a plus aucun lien vers elle.
- Le code du quiz est rangé dans `quiz-en-attente/`, hors des pages servies et de la vérification des types. Sa relance suit le `README.md` de ce dossier.
- **Indépendante** : elle n'importe jamais le code du site ni du hub ; ce qui est partagé passe par `packages/`.
- **Base** : les cinq tables du quiz reprises du site, plus `QuizPlayerStats` (les scores qui étaient sur la fiche des membres). Un membre n'y est qu'un identifiant texte (`userId`, `authorId`), sans lien vers une table de membres.
- Le client Prisma généré n'est pas enregistré dans git : lancer `pnpm db:generate` avant `typecheck` ou `dev`. Nouvelle migration : `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`, écrite dans `prisma/migrations/<horodatage>_<nom>/migration.sql`, puis `npx prisma migrate deploy` (skill `database-ops`).
- En local : `pnpm db:start` (base Postgres locale `bbquizz`, sans Docker), `npx prisma migrate deploy`, puis `pnpm dev` (port 4200).
