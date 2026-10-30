---
id: 107
title: "Remplacer les alert() par les notifications du site"
epic: E01
app: site
depends_on: []
adr: 
verify: plus aucun appel `alert(` dans apps/site (recherche dans le code)
---

# 107 — Remplacer les alert() par les notifications du site

## Pourquoi

Certains composants utilisent encore la fenêtre d'alerte du navigateur, qui bloque la page et ne suit pas le thème.

## Action

- Remplacer les `alert()` de `MarkAllAsReadButton`, `TopicSidebar`, `PostReactions`, `MarkUnreadAction` et `ModerationModal` par `toast` de `@bbfrance/ui`.
