---
id: 049
title: Audit mobile de toutes les pages et tests sur téléphone
epic: E03
app: site
depends_on: [040]
adr: 0004
verify: rapport écrit ; tests en taille téléphone dans la CI
---

# 049 — Audit mobile de toutes les pages et tests sur téléphone

## Pourquoi

La plupart des coachs utilisent leur téléphone : le site doit y être impeccable (règle absolue du projet).

## Action

Pour chaque page, en taille téléphone récent et téléphone d'entrée de gamme : pas de défilement horizontal, textes lisibles sans zoom, boutons d'au moins 44 pixels, menus et fenêtres sans bug, 7 thèmes lisibles. Mesure Lighthouse mobile (vitesse d'affichage, réactivité, absence de saut de page). Rapport `docs/mobile-audit.md` avec les problèmes page par page. Ajouter un projet Playwright « téléphone » qui rejoue les parcours existants. Les corrections sont des cartes 050 et suivantes, en commençant par le forum.
