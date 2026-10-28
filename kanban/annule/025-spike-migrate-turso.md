---
id: 025
title: Spike : Prisma Migrate contre une copie Turso
epic: E02
app: site
depends_on: [011]
adr: 0002
verify: go/no-go migrate deploy consigné ; écart prod/schéma consigné ; bascule d'URL chronométrée < 5 min
---

# 025 — Spike : Prisma Migrate contre une copie Turso

Timebox : 2 h.

## Action

1. Copie de la prod : restaurer le dump de la carte 011 dans une base Turso de test (script Node, pas de CLI turso).
2. `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` sur la copie : consigner l'écart (vide ou liste, stop si `DROP`).
3. Tester `migrate resolve` / `migrate status` / `migrate deploy` contre `libsql://` (adapter dans `prisma.config.ts` si nécessaire).
4. Écrire la procédure de bascule d'URL vers la copie (Vercel env) et la chronométrer.
5. Supprimer la base de test.

## Résultat

À remplir : go/no-go, écart, durée de bascule.

## Annulée (ADR-0004)

La base de production repart de zéro sur Postgres : plus de base Turso à sauvegarder ni à migrer.
