---
id: 020
title: Supprimer les N+1 forum et tournois
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

## Résultat

`createPost` : mentions en `createMany`, abonnés et vues lus en une requête chacun (avant : 1-2 requêtes par user). Résultats de tournoi : `createMany` pour les résultats, un `createMany` par ronde pour les matchs.
