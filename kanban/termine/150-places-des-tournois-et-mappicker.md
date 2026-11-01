---
id: 150
title: "Tournois : compteur de places, repères de MapPicker"
epic: E01
app: site
depends_on: [102]
adr: 
verify: la liste /tournois affiche « x / y places » d'après les inscriptions réelles ; MapPicker ne charge plus aucune image depuis un site extérieur ; tests e2e
---

# 150 — Tournois : compteur de places, repères de MapPicker

## Pourquoi

Défauts relevés pendant la correction des cartes 130 et 138 :

- La liste `/tournois` affiche « x / y places » à partir de `currentParticipants`, un nombre importé de l'ancien site que les inscriptions faites sur le nouveau site ne mettent jamais à jour. Le compteur affiché est donc faux pour les tournois récents. Le filtre « Places restantes » (carte 130) calcule déjà le bon nombre.
- `apps/site/app/forum/component/MapPicker.tsx`, qui sert à choisir le lieu d'un tournoi ou d'une ligue, charge encore ses repères depuis unpkg.com, un site extérieur. La carte `/carte` utilise maintenant des dessins locaux (`public/images/carte/`).

## Action

- Afficher le nombre de places prises calculé comme pour le filtre (même fonction, partagée).
- Utiliser les repères locaux de `public/images/carte/` dans `MapPicker`.
- Ajouter les tests dans `apps/site/tests/e2e/bugs/`.

## Résultat

- Nouveau fichier `apps/site/lib/tournamentPlaces.ts` : le calcul des places prises de la carte 130, déplacé sans changement de règle. `TAKEN_PLACES_COUNT` est le comptage à demander à la base (inscriptions et équipes hors liste d'attente) et `takenPlaces` donne le nombre de places prises (le nombre importé de l'ancien site, `currentParticipants`, ne compte que s'il est plus grand).
- `apps/site/app/tournois/page.tsx` : le filtre « Places restantes » utilise cette fonction, et la requête de la liste demande le même comptage.
- `apps/site/app/tournois/component/TournamentListItems.tsx` : les trois affichages « x / y places » (carte de la grille, ligne de la liste sur téléphone et sur ordinateur) utilisent `takenPlaces`.
- `apps/site/app/page.tsx` : les prochains tournois de l'accueil utilisent la même carte de tournoi ; leur requête demande donc aussi le comptage, et la clé du cache passe de `next-tournaments-v2` à `next-tournaments-v3` pour ne jamais servir un ancien résultat sans ce comptage.
- `apps/site/app/forum/component/MapPicker.tsx` : le repère du lieu choisi est le dessin rouge du site (`/images/carte/marker-red.svg`, avec son ombre), passé directement au repère au lieu de modifier le repère par défaut de Leaflet pour toute la page. Les fonds de carte viennent toujours d'OpenStreetMap, comme sur `/carte` : ce n'est pas un repère, et la carte ne fonctionnerait pas sans eux.
- Fiches mises à jour : `docs/features/tournois/README.md`, `docs/features/ligues-carte/README.md`.
- Tests écrits (pas encore lancés) dans `apps/site/tests/e2e/bugs/vague2.spec.ts` : « 3 / 20 places » pour un tournoi récent (liste d'attente exclue) en grille et en liste, « 7 / 10 places » pour un ancien tournoi sans inscription sur le site, et repère de `MapPicker` servi par le site sans requête vers unpkg.com.
- À essayer à la main : sur `/tournois`, comparer le compteur d'un tournoi récent avec ses inscriptions ; ouvrir « Choisir sur la carte » dans le formulaire d'une ligue ou d'un tournoi et toucher la carte : le repère rouge apparaît.
