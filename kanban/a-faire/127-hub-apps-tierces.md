---
id: 127
title: Ouverture du hub aux applications tierces
epic: E09
app: hub
depends_on: [118, 123, 126]
adr: 0007
verify: tests - un client non validé est refusé, un client qui dépasse son quota est bloqué, un refus de consentement ne donne aucun jeton
---

# 127 — Ouverture du hub aux applications tierces

## Pourquoi

Des outils de la communauté (bots Discord, outils de ligue) doivent pouvoir utiliser le passeport, avec l'accord du coach.

## Action

- Créer l'écran de consentement en français. Les droits demandés y sont décrits en phrases simples, par exemple « lire ton profil » ou « modifier ton profil ». Le bouton « Refuser » est aussi visible que « Autoriser ».
- Décrire la procédure de validation à la main dans `docs/features/hub/README.md`.
- Fixer un quota de requêtes par client.
- Ajouter un réglage d'ouverture, désactivé par défaut tant qu'aucune application tierce n'a été validée.
