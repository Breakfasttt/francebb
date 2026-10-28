---
id: 029
title: Nettoyage du repo (fichiers morts, scripts ponctuels, secrets)
status: done
epic: E02
app: site
depends_on: []
adr: 0001
verify: typecheck + smoke verts, `git grep` sans token Turso
---

# 029 — Nettoyage du repo

## Action

- Supprimés (aucune référence) : `styles/globals.css`, `styles/Home.module.css`, `app/theme/theme.dark.css` (jamais importé), dépendance `next-themes`.
- Scripts ponctuels supprimés : `check-prod-tables.ts` et `export-archives.ts` (**contenaient l'URL + un token lecture-écriture de la prod Turso en dur**), `sync-archives-to-turso.ts`, `sync-quiz-final.ts`.
- Server actions sans appelant supprimées : `getRecentPosts`, `getForums`, `getSiblings`.
- Skills `database-ops` / `project-structure` / `reuse-first` et `ARCHITECTURE.md` mis à jour.

## Reste (action user)

Le token Turso reste dans l'historique git déjà poussé : **le révoquer et en recréer un** (app.turso.tech → base → tokens), puis mettre à jour Vercel.
