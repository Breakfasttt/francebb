---
id: 052
title: Dette : throw et auth() direct dans les actions
epic: E02
app: site
depends_on: []
adr:
verify: nombre de throw et d'auth() directs en baisse, mesuré par scripts/debt-count.mjs ; tests verts
---

# 052 — Dette : throw et auth() direct dans les actions

## Pourquoi

Les règles du projet (`ARCHITECTURE.md`) demandent de renvoyer `null` plutôt que `throw`, et de passer par `getActiveSession()`. Le code ancien ne les respecte pas partout.

## Action

Compter puis réduire, fichier par fichier : environ 44 `throw` dans `app/forum/actions.ts`, 15 dans la messagerie, 12 dans le profil, 13 dans les membres, plus les ligues et l'administration. Remplacer les `auth()` directs (résultats de tournoi, `/membres`, `/classement/edit-archive`) par `getActiveSession()`. Unifier les paramètres de retour après connexion (`callback` contre `callbackUrl`).
