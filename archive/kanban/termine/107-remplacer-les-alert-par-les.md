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

## Résultat

- 9 `alert()` remplacés par `toast.error` de `@bbfrance/ui`, avec les mêmes messages : MarkAllAsReadButton, MarkUnreadAction, ModerationModal, PostReactions, TopicSidebar, ArticleReactions, ResourceForm.
- Il reste 3 `confirm()` du navigateur, hors de cette carte : `classement/page.tsx:106`, `bbquizz/editer/EditerContent.tsx:77`, `TournamentResultsEditor.tsx:356`. Ils seront remplacés par `ConfirmModal` lors de la refonte de ces écrans (cartes 089, 097, 098).
- Vérifications : types et ESLint verts, suite e2e verte.
