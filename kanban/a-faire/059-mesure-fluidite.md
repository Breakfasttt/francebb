---
id: 059
title: Mesurer la fluidité mobile (Lighthouse)
epic: E03
app: site
depends_on: [049]
adr: 0004
verify: note Lighthouse mobile mesurée pour les 5 pages principales et écrite dans docs/mobile-audit.md
---

# 059 — Mesurer la fluidité mobile (Lighthouse)

## Pourquoi

La règle « mobile impeccable » inclut la fluidité, mais elle n'est pas encore mesurée : il faut l'outil Lighthouse (note sur 100 de la vitesse et de la réactivité d'une page).

## Action

**Demande l'accord du user** pour ajouter la bibliothèque `lighthouse` (outil de Google, en dépendance de développement). Puis mesurer en mode mobile l'accueil, le forum, un sujet, les tournois et le profil ; objectif 90/100. Écrire les résultats dans `docs/mobile-audit.md` et créer une carte par page sous l'objectif.
