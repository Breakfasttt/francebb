---
id: 057
title: Mobile : BBScheme
epic: E03
app: site
depends_on: [049]
adr: 0004
verify: audit mobile : rien de coupé, 0 cible trop petite sur /bbscheme
---

# 057 — Mobile : BBScheme

## Pourquoi

L'éditeur BBScheme a une vraie interface mobile, mais un bouton d'outil est coupé de 18 px et plusieurs boutons font 35 à 40 px.

## Action

Revoir la barre d'outils mobile pour qu'aucun bouton ne soit coupé et que tous fassent au moins 44 px. Mettre à jour la fiche `docs/features/bbscheme`.
