---
id: 022
title: Spike B : Better Auth OIDC + Prisma 7 + Turso
status: refine
epic: E06
app: site
depends_on: [023]
adr: 
verify: login OIDC silencieux site↔hub sur domaine parent, Safari iOS compris
---

# 022 — Spike B : Better Auth OIDC + Prisma 7 + Turso

## Action

Plugin oidcProvider vs OAuth Provider, compat prismaAdapter + client généré Prisma 7 + libsql, `prompt=none` Safari iOS. Échec → ADR alternatif via `/council`. Prérequis user : domaine parent commun.
