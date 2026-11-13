---
id: E11
title: Revue de l'interface de novembre 2026
phase:
---

# E11 — Revue de l'interface de novembre 2026

Le 13 novembre 2026, toute l'interface du site (`apps/site` et `packages/ui`) a été relue avec un référentiel de 120 règles d'ergonomie (le skill `ui-ux-pro-max` : accessibilité, appui au doigt, performances, mise en page, couleurs et textes, animations, formulaires, navigation). La base est saine : aucune couleur écrite en dur dans les classes, barre basse à cinq entrées, fenêtres fermables par la touche Échap, suppressions importantes confirmées. Les défauts restants sont des motifs qui se répètent dans plusieurs écrans ; cette épopée regroupe les six cartes qui les corrigent à la source.

## Terminé quand

Les cartes 192 à 197 sont terminées : les animations respectent le réglage « réduire les animations » du téléphone, chaque envoi de formulaire montre qu'il est en cours, les erreurs de saisie s'affichent sous le champ concerné, toutes les zones d'appui font au moins 44 pixels, les filtres des listes sont gardés dans l'adresse de la page, et les niveaux d'empilement (z-index) suivent l'échelle du skill `theming-rules`.
