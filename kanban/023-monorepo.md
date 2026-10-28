---
id: 023
title: Passage monorepo pnpm + Turborepo
status: done
epic: E04
app: site
depends_on: [007]
adr: 
verify: CI + smoke identiques, preview Vercel OK
---

# 023 — Passage monorepo pnpm + Turborepo

## Action

npm → pnpm, Turborepo, app déplacée telle quelle en `apps/site` (1 commit de move), `packages/config`, Vercel Root Directory, hook SessionStart, CLAUDE.md par app. Rollback écrit et testé. Découpage en cartes via `/council`.

## Résultat (branche `refacto/p3-monorepo`)

- App déplacée telle quelle en `apps/site` (commit de move pur), `package.json` racine + `pnpm-workspace.yaml` + `turbo.json` (simple lanceur, cache désactivé pour l'instant).
- Mode strict pnpm : 3 dépendances utilisées sans être déclarées, ajoutées : `@next/env`, `@prisma/client-runtime-utils`, `@auth/core`.
- Versions figées sur l'ancien `package-lock.json` (sinon Prisma 7.10, next-auth beta.32, nouvelles règles ESLint) ; sous-dépendances ESLint figées par `overrides`.
- CI pnpm, hook `lint-edited` monorepo, README/DEPLOY/CLAUDE.md à jour, `apps/site/CLAUDE.md`.
- Vérifié : board, typecheck, cliquet (579), build, 14 smoke.

## Avant de merger (action user)

Vercel : Settings > Build and Deployment > **Root Directory = `apps/site`**, sinon le déploiement échoue. Puis merge dans `development`.
Reporté : `packages/config` (tsconfig/eslint partagés — utile quand une 2e app existera), hook SessionStart, cache Turborepo.

