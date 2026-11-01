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

## Résultat

Fait, sans lancer les tests (une seule campagne de tests est prévue à la fin).

- `/jouer` (`apps/site/app/jouer/page.tsx`) : la page calcule d'abord la liste des sections affichées (une section vide est masquée, sauf la première). Les étapes sont numérotées parmi ces sections, le lien « Prochaine étape » vise la section affichée suivante, et la dernière section affichée n'a plus ce lien.
- `/statistiques` (`apps/site/app/statistiques/actions.ts`) : la taille de la base est écrite avec `toLocaleString("fr-FR")`, deux chiffres après la virgule (« 9,50 Mo »).
- Test écrit : `apps/site/tests/e2e/bugs/articles-membres.spec.ts`, groupe « carte 132 » (sections 3 et 6 vides : trois liens, le dernier vers la section 5 ; taille de la base avec une virgule), et un contrôle en taille téléphone (pas de défilement horizontal, bouton de 44 pixels). La consigne de ce lot demandait de ne pas modifier `tests/e2e/inventaire/accueil.spec.ts` : son test de `/jouer` reste compatible (il attend au moins quatre liens, la page en affiche quatre avec ses réglages).
- Fiches mises à jour : `docs/features/pages-diverses/README.md`, `docs/features/classement-statistiques/README.md`.
- À essayer à la main : vider une section du milieu du guide dans l'administration, puis vérifier sur `/jouer` que chaque « Prochaine étape » mène à une section visible et que la dernière section n'a pas de bouton ; ouvrir `/statistiques` en administrateur.
