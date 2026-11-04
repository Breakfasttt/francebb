---
id: 155
title: "Nouvel accueil"
epic: E08
app: site
depends_on: [156]
adr: 0006
verify: l'accueil suit la maquette choisie par le responsable, sans logo, avec toutes ses fonctions ; tests inventaire/accueil verts en taille ordinateur et téléphone ; mobile-audit vert
---

# 155 — Nouvel accueil

## Pourquoi

La carte 090 a seulement repris l'ancien accueil avec les nouvelles couleurs. Le responsable voulait un écran entièrement repensé : un habillage professionnel et moderne, avec les mêmes fonctions. Le grand logo est abandonné.

## Action

1. Proposer 2 ou 3 maquettes (taille téléphone et taille ordinateur, thème Vestiaire, aperçu en Saison 3 et NAF) ; le responsable en choisit une.
2. Réécrire `apps/site/app/page.tsx` selon cette maquette. Fonctions à garder : liens vers toutes les rubriques (dont « Jouer à Blood Bowl ! » mis en avant, Discord, et les liens « Créer » des ligues et des tournois), les trois prochains tournois, l'article tiré au hasard, le cache des tournois (`next-tournaments-v3`, étiquette `home-tournaments`). Le titre de la page devient un texte dans un `h1`, sans logo.
3. Adapter `tests/e2e/inventaire/accueil.spec.ts`, l'inventaire (`docs/refonte/inventaire.md`) et la fiche `docs/features/pages-diverses/README.md`.
4. Vérifier en taille téléphone : lisible sans zoom, boutons d'au moins 44 pixels, pas de défilement horizontal.

## Résultat

Accueil refait d'après la maquette « D » choisie par le responsable (maquettes A, B, C et D dans l'artefact « Accueil BBFrance — maquettes »). Plus de logo : le titre est un texte.

- Bandeau de présentation avec trois boutons : « Aller au forum », le plus visible, puis « Jouer à Blood Bowl ! » et « Rejoindre le Discord ».
- Les trois prochains tournois à côté du bandeau (en dessous sur téléphone), en liste compacte : date, nom, ville, places prises. Sans tournoi à venir : un message et le lien « Créer un tournoi ».
- Toutes les rubriques en trois blocs (Débuter, Jouer en compétition, La communauté), chaque lien avec une courte description ; « Créer » sur Tournois et Ligues.
- L'article au hasard en bas ; sans article, le bloc n'est pas affiché.
- Aucune nouvelle donnée, caches inchangés. `topicHref` et `placeText` (`app/tournois/component/TournamentListItems.tsx`) sont exportés pour être réutilisés.
- Tests inventaire accueil et coquille-fin adaptés et verts en taille ordinateur et téléphone. Le relevé mobile-audit ne tourne qu'avec MOBILE_AUDIT=1 : il a été sauté ; le parcours de fin de carte (carte 157) a ensuite contrôlé l'accueil en taille téléphone, sans problème.

**À essayer sur un vrai téléphone** : l'accueil en visiteur puis connecté, dans deux ou trois thèmes ; les boutons du bandeau et les liens « Créer ».
