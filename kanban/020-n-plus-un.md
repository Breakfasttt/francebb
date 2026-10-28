---
id: 020
title: Supprimer les N+1 forum et tournois
status: refine
epic: E03
app: site
depends_on: []
adr: 
verify: une requête par lot dans les logs `PRISMA_QUERY_LOG=1`
---

# 020 — Supprimer les N+1 forum et tournois

## Problème

Boucles de requêtes dans `app/forum/actions.ts` (~674/707) et `app/tournois/actions.ts` (123-165).

## Action

`createMany` / `findMany({ where: { id: { in } } })`.
