---
id: 022
title: Spike B : Better Auth OIDC + Prisma 7 + Turso
epic: E06
app: hub
depends_on: [023]
adr: 0003
verify: pnpm --filter @bbfrance/hub test:sso (connexion via hub sans re-onboarding, reconnexion silencieuse, email non vérifié refusé)
---

# 022 — Spike B : Better Auth OIDC + Prisma 7 + Turso

## Action

Plugin oidcProvider vs OAuth Provider, compat prismaAdapter + client généré Prisma 7 + libsql, `prompt=none` Safari iOS. Échec → ADR alternatif via `/council`. Prérequis user : domaine parent commun.

## Résultat

Réussi, voir ADR-0003. `apps/hub` (Better Auth 1.7.7 + `@better-auth/oauth-provider`, Prisma 7 + libsql, base séparée). Site : provider `hub` derrière `AUTH_MODE=hub`. Test Playwright de bout en bout en CI. Non vérifié : Safari iOS sur domaine parent (impossible en local) → carte 035.
