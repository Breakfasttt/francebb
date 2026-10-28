---
id: 058
title: Mobile : connexion, inscription et page des bannis
epic: E03
app: site
depends_on: [049]
adr: 0004
verify: audit mobile propre sur /auth/login et /auth/onboarding ; /banned lisible dans les 7 thèmes (captures)
---

# 058 — Mobile : connexion, inscription et page des bannis

## Pourquoi

La page de connexion n'a aucune règle mobile ; à l'inscription, les champs trop petits font zoomer l'iPhone et les boutons d'avatar et de thème sont minuscules ; `/banned` a des couleurs en dur, illisibles dans le thème clair.

## Action

Règles mobiles pour `/auth/login` et `/auth/onboarding` (champs en 16 px, boutons de 44 px, proposer les 7 thèmes). `/banned` : couleurs par variables de thème.
