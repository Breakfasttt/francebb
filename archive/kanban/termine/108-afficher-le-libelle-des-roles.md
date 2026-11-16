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

## Résultat

- La page d'un sujet lit une seule fois la table `RoleConfig` et passe la correspondance nom -> libellé à `PostItem`, qui se rabat sur `getRoleLabel` pour les rôles de base.
- Le même affichage brut existe encore dans `ProfileSidebar`, `ProfileBlockedUsers`, `CoachsTab` et `MembersTable`. Il sera traité lors de la refonte de ces écrans (cartes 092 et 099).
- Vérifications : types et ESLint verts, suite e2e verte.
