---
id: 012
title: Baseline des migrations Prisma en prod
status: ready
epic: E02
app: site
depends_on: [011, 025]
adr: 0002
verify: `prisma migrate status` sur la prod → « Database schema is up to date » et `migrate diff` prod ↔ schéma vide
---

# 012 — Baseline des migrations Prisma en prod

## Problème

Prod initialisée en `db push` (`DEPLOY.md`) : l'historique `prisma/migrations` n'est pas appliqué en prod.

## Action (ADR-0002)

Seulement si l'écart consigné par la carte 025 est vide :
1. Archiver les 26 migrations hors de `prisma/migrations`, créer `0_init` via `migrate diff --from-empty --to-schema prisma/schema.prisma --script`.
2. `migrate resolve --applied 0_init` sur la copie, puis dump frais, puis prod.
3. `dev.db` : marquer `0_init` appliquée (sauvegarde avant).
4. Retirer `db push` de `DEPLOY.md`, `README.md` (FR) et du skill `database-ops`.
