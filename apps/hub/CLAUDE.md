# apps/hub — le hub de connexion BBFrance

Le hub est l'application qui gère les comptes : un membre s'y connecte une fois (Discord, Google ou lien par email) et il est reconnu par toutes les applications BBFrance. Il utilise Better Auth et le standard OIDC (voir le glossaire), avec sa propre base de données. Décision : `docs/adr/0003-hub-better-auth-oidc.md`. Fiche : `docs/features/hub/README.md`. Règles générales : `.claude/CLAUDE.md` à la racine.

- **C'est la porte d'entrée de tous les comptes** : toute modification de `lib/auth.ts` ou `lib/authPlugins.mjs` passe par une carte et doit garder le test `pnpm test:sso` vert.
- `prisma/schema.prisma` est **généré** à partir des tables de Better Auth (`node scripts/generate-schema.mjs`) : ne pas l'éditer à la main.
- Le client Prisma généré n'est pas enregistré dans git : lancer `pnpm db:generate` avant `typecheck` ou `dev`.
- Les versions de better-auth et de ses compagnons (`@better-auth/core`, `better-call`, `@better-auth/utils`, `@better-fetch/fetch`) se montent toutes en même temps. Sinon, deux copies de `@better-auth/core` coexistent et TypeScript ne reconnaît plus les plugins.
- En local : copier `.env.example` en `.env`, puis `pnpm db:start` (base Postgres locale sans Docker), `pnpm exec prisma migrate deploy` et `pnpm dev` (port 4000). Le site est enregistré comme application cliente avec `scripts/register-client.mjs`.
