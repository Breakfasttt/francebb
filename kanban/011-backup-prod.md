---
id: 011
title: Backup Turso prod + restauration testée
status: cancelled
epic: E02
app: site
depends_on: []
adr: 
verify: `node scripts/turso-backup.mjs` → « Restauration OK »
---

# 011 — Backup Turso prod + restauration testée

## Action

Action user : lancer `scripts/turso-backup.mjs` avec les vraies `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` (token lecture seule si possible). Les dumps vont dans `backups/` (ignoré par git).

Bloque toute opération qui écrit en prod (carte 012, migrations, P5).

## Annulée (ADR-0004)

La base de production repart de zéro sur Postgres : plus de base Turso à sauvegarder ni à migrer.
