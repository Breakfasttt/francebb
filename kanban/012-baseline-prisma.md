---
id: 012
title: Baseline des migrations Prisma en prod
status: refine
epic: E02
app: site
depends_on: [011]
adr: 0002
verify: `npx prisma migrate deploy` sans écart sur la prod
---

# 012 — Baseline des migrations Prisma en prod

## Problème

Prod initialisée en `db push` (`DEPLOY.md`) : l'historique `prisma/migrations` n'est pas appliqué en prod.

## Action (après `/council` → ADR-0002)

`migrate diff` prod vs schéma → migration baseline → `migrate resolve --applied` sur une copie Turso d'abord, puis prod. Mettre à jour `DEPLOY.md` et `README.md` (`migrate deploy`).
