# apps/hub — hub d'identité BBFrance

Better Auth 1.7 + `@better-auth/oauth-provider` (OIDC), Prisma 7 + libsql, base séparée (`HUB_DATABASE_URL`). Décision : `docs/adr/0003-hub-better-auth-oidc.md`. Fiche : `docs/features/hub/README.md`. Règles générales : `.claude/CLAUDE.md`.

- Auth = **prod critique** : toute modif de `lib/auth.ts` ou `lib/authPlugins.mjs` passe par une carte + test `pnpm test:sso`.
- `prisma/schema.prisma` est **généré** (`node scripts/generate-schema.mjs`) : ne pas l'éditer à la main.
- Client Prisma généré non versionné : `pnpm db:generate` avant `typecheck` / `dev`.
- Versions better-auth et ses peers (`@better-auth/core`, `better-call`, `@better-auth/utils`, `@better-fetch/fetch`) figées ensemble : les monter toutes à la fois, sinon deux `@better-auth/core` coexistent et les types cassent.
- Dev : `.env` (voir `docs/features/hub/README.md`), `pnpm dev` (port 4000), client du site via `scripts/register-client.mjs`.
