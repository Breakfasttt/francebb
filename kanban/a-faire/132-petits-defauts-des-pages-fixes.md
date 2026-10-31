---
id: 132
title: "Petits défauts de /jouer et /statistiques"
epic: E01
app: site
depends_on: [102]
adr: 
verify: sur /jouer, le bouton « Prochaine étape » de la dernière section visible n'apparaît pas s'il ne mène nulle part ; /statistiques affiche « 9,50 Mo » avec une virgule
---

# 132 — Petits défauts de /jouer et /statistiques

## Pourquoi

Deux petits défauts trouvés pendant la refonte (carte 090) :

- Sur `/jouer`, une section vide n'est pas affichée. Le bouton « Prochaine étape » de la section qui la précède vise pourtant cette section masquée : il ne mène alors nulle part.
- Sur `/statistiques`, la taille de la base s'affiche avec un point décimal (« 9.50 Mo ») au lieu d'une virgule, comme on l'écrit en français. Le calcul est dans `apps/site/app/statistiques/actions.ts`.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- `/jouer` : calculer la section suivante parmi les sections réellement affichées, et ne pas afficher le bouton sur la dernière.
- `/statistiques` : formater les nombres avec `toLocaleString("fr-FR")` (ou `Intl.NumberFormat`).
- Compléter le test `apps/site/tests/e2e/inventaire/accueil.spec.ts`.
