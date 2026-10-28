---
id: 023
title: Passage monorepo pnpm + Turborepo
status: refine
epic: E04
app: site
depends_on: [007]
adr: 
verify: CI + smoke identiques, preview Vercel OK
---

# 023 — Passage monorepo pnpm + Turborepo

## Action

npm → pnpm, Turborepo, app déplacée telle quelle en `apps/site` (1 commit de move), `packages/config`, Vercel Root Directory, hook SessionStart, CLAUDE.md par app. Rollback écrit et testé. Découpage en cartes via `/council`.
