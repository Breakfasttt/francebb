---
id: 075
title: "Refonte visuelle : inventaire, maquettes et décision"
epic: E08
app: site
depends_on: []
adr: 0006
verify: docs/refonte/inventaire.md liste chaque écran et chaque action avec le rôle requis ; les maquettes téléphone et ordinateur sont validées par le user ; l'ADR 0006 est accepté
---

# 075 — Refonte visuelle : inventaire, maquettes et décision

## Pourquoi

La refonte du site et du forum (épic E08) ne doit faire perdre aucune fonctionnalité. L'interface actuelle cache des actions dans des colonnes latérales, des fenêtres et des menus. Elle en masque ou en déplace aussi selon le rôle et selon la taille de l'écran. Sans liste écrite, une action peut disparaître sans que personne s'en aperçoive.

La refonte remplace aussi une règle de l'ADR 0001, « les 7 thèmes restent l'esthétique, pages indiscernables ». Ce changement doit donc être écrit dans une nouvelle décision.

Enfin, l'apparence doit être validée sur des maquettes avant d'écrire le moindre code.

## Action

1. **Inventaire.** Écrire `docs/refonte/inventaire.md`, la liste de contrôle de non-régression (vérification que rien n'a disparu).
   - Pour chaque écran, l'adresse, les actions et le rôle requis pour chaque action : visiteur, membre, modérateur, administrateur, super administrateur.
   - Les paramètres d'adresse et les ancres qu'il faut conserver.
   - Une case à cocher par ligne.
2. **Maquettes.** Créer des maquettes HTML publiées en artefact (page web privée), en taille téléphone (375 px) et en taille ordinateur (1280 px).
   - Écrans : navigation globale (barre basse et panneau « Plus »), accueil, liste du forum, page d'un sujet avec le menu « ⋯ » et la fiche coach, éditeur de message.
   - Thèmes : le nouveau thème par défaut, Saison 3 et NAF.
3. **Décision.** Réunir le conseil avec `/council`, puis rédiger `docs/adr/0006-refonte-visuelle.md`. Points à trancher :
   - le jeu de variables de couleur v2 ;
   - les 8 thèmes ;
   - le verre dépoli, désormais facultatif selon le thème ;
   - le nom du nouveau thème par défaut, et la façon d'y faire passer les membres existants ;
   - la police, chargée par `next/font` ;
   - les bibliothèques Radix à ajouter ;
   - la cohabitation avec le CSS historique (classes Tailwind générées sur le site, reset de Tailwind activé seulement à la fin).
4. **Cartes suivantes.** Une fois l'ADR accepté, écrire les cartes du socle, du forum, du site et de la finition. Écrire aussi les cartes de bugs repérés pendant l'inventaire (contrôles d'accès du forum, liens morts, `alert()` du navigateur).

## Résultat

- `docs/refonte/inventaire.md` : liste de contrôle de non-régression, écran par écran, avec le rôle requis pour chaque action, les adresses et ancres à conserver, ce qui n'existe pas aujourd'hui et les bugs repérés.
- Maquettes publiées en artefact privé (https://claude.ai/artifact/Enr8zT38F3NHZXhweYFyiM) : accueil du forum, page d'un sujet, panneau « Plus » et éditeur sur téléphone, page d'un sujet sur ordinateur, comparaison des thèmes Vestiaire, Saison 3 et NAF. Validées par le user le 30 octobre 2026.
- Conseil réuni, ADR 0006 accepté (`docs/adr/0006-refonte-visuelle.md`). Le user a choisi le nom « Vestiaire » et d'imposer ce thème à tous les membres, avec une copie de l'ancien thème et un retour possible en un clic.
- Onze termes ajoutés à `docs/GLOSSAIRE.md`.
- Cartes créées : 076 à 102 (épic E08) et 103 à 108 (bugs, épic E01). La carte 103 concerne la sécurité du forum et doit passer en premier.
