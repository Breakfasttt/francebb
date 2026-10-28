---
id: 018
title: Activer cacheComponents
epic: E03
app: site
depends_on: [017]
adr: 
verify: build OK, plus aucun `export const dynamic`
---

# 018 — Activer cacheComponents

## Action

`cacheComponents`, `'use cache'` avec userId en argument, `auth()` hors cache, remplacer `unstable_cache`.
