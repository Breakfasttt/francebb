---
id: 104
title: "Liens cassés du forum"
epic: E01
app: site
depends_on: []
adr: 
verify: un résultat de /forum/search mène au bon message ; une citation faite depuis /reply affiche le pseudo
---

# 104 — Liens cassés du forum

## Pourquoi

Le lien d'un résultat de recherche du forum n'atteint pas le message, et une citation faite depuis la page `/reply` affiche un identifiant au lieu du pseudo.

## Action

- `search/page.tsx` : construire le lien `?page=N#post-<id>`.
- `ReplyForm` : produire `[quote=authorId|postId|authorName]`, comme la réponse rapide.
