---
id: 108
title: "Afficher le libellé des rôles"
epic: E01
app: site
depends_on: []
adr: 
verify: un message du forum affiche « Modérateur » et non `MODERATOR`
---

# 108 — Afficher le libellé des rôles

## Pourquoi

Sous le nom de l'auteur d'un message, le forum affiche le code brut du rôle (`MODERATOR`) au lieu de son libellé.

## Action

- Afficher `RoleConfig.label` (ou `getRoleLabel`) dans `PostItem`.
