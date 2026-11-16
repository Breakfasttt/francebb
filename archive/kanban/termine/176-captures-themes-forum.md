---
id: 176
title: "Captures de référence des thèmes à régénérer"
epic: E10
app: site
depends_on: [166, 167]
verify: "visual-themes.spec.ts passe ; les nouvelles captures ont été regardées et ne montrent que les changements voulus (ligne « Dernier : … » des listes du forum, cloche des notifications)"
---

# 176 — Captures de référence des thèmes à régénérer

## Pourquoi

Le test `apps/site/tests/e2e/visual-themes.spec.ts` compare des captures d'écran des pages dans les 8 thèmes à des images de référence. Les cartes 166 (ligne « Dernier : auteur, date et heure » des listes du forum) et 167 (cloche des notifications dans la barre du haut) changent volontairement l'apparence : les références sont à refaire.

## Action

1. Lancer ce seul test pour voir quelles captures diffèrent.
2. Regarder chaque différence : elle doit venir uniquement des changements voulus.
3. Régénérer les références de ces captures (`--update-snapshots`) et relancer le test.

## Résultat

Le fichier `visual-themes.spec.ts` a été lancé seul, sur une base de test neuve. Au premier passage, seules les huit captures de l'accueil (une par thème) différaient de leur référence, avec environ 38 % des pixels changés. La différence vient de la carte 155 (nouvel accueil, livrée le même jour) : le logo a disparu, un bloc de présentation avec le bouton « Aller au forum » mis en avant occupe le haut de la page, la liste masquée des prochains tournois est passée à sa droite et les rubriques sont regroupées en trois blocs (« Débuter », « Jouer en compétition », « La communauté »). Ce nouvel écran a été regardé dans plusieurs thèmes (sombre par défaut, clair, Nehekhara) : il s'affiche proprement, sans débordement ni couleur inattendue.

Les huit références de l'accueil ont donc été refaites. Elles avaient masqué le reste, car le test de l'accueil s'arrête à la première capture en échec avant de comparer celle du forum. Une fois l'accueil à jour, les huit captures de la liste du forum, les huit fenêtres de signalement et les huit pages des bannis sur téléphone sont identiques à leurs références : les changements des cartes 166 et 167 ne se voient pas sur ces captures (la page du forum est photographiée par un visiteur, qui ne voit pas la cloche des notifications, et la ligne « Dernier : … » ne change pas assez de pixels pour dépasser la tolérance, ou n'apparaît pas sur cette page). Aucune autre référence n'a été touchée.

Le fichier entier passe ensuite : 26 tests réussis. Aucune anomalie n'a été trouvée.
