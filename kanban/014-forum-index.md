---
id: 014
title: Forum index : requêtes bornées et cache non indexé par user
status: done
epic: E03
app: site
depends_on: []
adr: 
verify: requêtes/rendu `/forum` connecté < 16 (baseline)
---

# 014 — Forum index : requêtes bornées et cache non indexé par user

## Problème

`app/forum/page.tsx` charge tous les topics sans `take`, `author: true`, cache par userId.

## Action

Agrégats (`_count`, dernier topic `orderBy`+`take:1`), `select` auteur minimal, non-lu calculé à part.
