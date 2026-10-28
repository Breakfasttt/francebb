---
id: 047
title: Mise en production sur les nouvelles bases
status: ready
epic: E02
app: site
depends_on: [046]
adr: 0004
verify: inscription par Discord ou Google qui fonctionne en production
---

# 047 — Mise en production sur les nouvelles bases

## Pourquoi

La bêta repart de zéro sur Postgres.

## Action

Prévenir les bêta-testeurs 7 jours avant (message privé et Discord : les comptes et messages seront effacés, réinscription en 30 secondes avec Discord ou Google). Créer les bases Neon de production, changer les variables sur Vercel, déployer, lancer la création des données de base (`firstSetup`).
