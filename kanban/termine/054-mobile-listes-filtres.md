---
id: 054
title: Mobile : listes et filtres (membres, articles, ressources, ligues, tournois)
epic: E03
app: site
depends_on: [049]
adr: 0004
verify: audit mobile : rien de coupé sur /membres ; filtres accessibles par le bouton flottant sur les 5 pages
---

# 054 — Mobile : listes et filtres (membres, articles, ressources, ligues, tournois)

## Pourquoi

Le tableau des membres déborde (915 px dans 360) ; les filtres sont rangés dans le menu au lieu du bouton flottant prévu ; deux CSS mobiles ne sont jamais chargés.

## Action

`/membres` : afficher les membres en cartes empilées sur téléphone, liens d'au moins 44 px. Filtres de `/membres`, `/articles`, `/ressources`, `/ligues`, `/tournois` derrière le bouton flottant `MobileFilterWrapper`. Importer `ressources/page-mobile.css` et le CSS mobile du formulaire dans `/ligue/edit/[id]`.

## Résultat

- `/membres` sur téléphone (jusqu'à 768 pixels) : le tableau de 915 pixels est remplacé par une liste de cartes empilées, une par membre (`MembersTable-mobile.css`) : nom et avatar en lien de 44 pixels vers le profil, rôle, badge « Banni », numéro NAF, région, ligues, puis les boutons « Message privé », changement de rôle, bannir et supprimer selon les droits. Une liste « Trier par » remplace les en-têtes de colonnes cliquables. Sur ordinateur, le tableau et le bloc de filtres ne changent pas.
- Les filtres de `/membres`, `/articles`, `/ressources`, `/ligues` et `/tournois` s'ouvrent maintenant avec le bouton flottant en forme d'entonnoir (`MobileFilterWrapper`) au lieu d'être rangés dans le menu latéral global. Sur `/tournois`, le choix grille ou liste et le tri sont en haut du même panneau.
- `MobileFilterWrapper` gagne deux réglages : `mobileOnly` (rien sur ordinateur, quand la page a déjà sa colonne de filtres) et `breakpoint` (largeur de bascule, 1024 pixels pour les pages dont la colonne est masquée par `desktop-only`). Le bouton et le panneau sont affichés directement dans `<body>`, le bouton de fermeture mesure 44 pixels, les champs du panneau sont en 16 pixels (pas de zoom automatique sur iPhone) et le panneau fermé est invisible (ses champs ne sont plus atteignables au clavier).
- `ressources/page-mobile.css` est importé par `/ressources`, et `ligues/create/page-mobile.css` par `/ligue/edit/[id]` (formulaire sur une colonne). Le bouton d'envoi du blason passe à 44 pixels sur téléphone.
- Deux défauts trouvés en vérifiant : dans les listes déroulantes avec une icône à gauche (`ClassicSelect`), le texte passait sous l'icône sur téléphone (corrigé dans `ClassicSelect-mobile.css`, ordinateur inchangé) ; la fenêtre et le message de suppression d'un membre annonçaient une suppression définitive de tous ses messages, alors que depuis la carte 051 ses contenus publics sont rattachés au compte « Coach Inconnu » (textes corrigés).
- Audit mobile : `/membres` passe de 1 contenu coupé et 3 cibles trop petites à 0 et 0. Panneaux de filtres ouverts sur les 5 pages, à 360, 390 et 430 pixels : 0 contenu coupé, 0 champ qui fait zoomer, 0 cible trop petite, sauf les 9 cases à cocher de `/tournois` (22 pixels, mais toute leur ligne de 44 pixels réagit au toucher). Captures dans `logs/054-mobile/`.
- Captures ordinateur des 7 thèmes inchangées ; suite complète des tests de bout en bout : 52 réussis, 1 ignoré volontairement (l'audit mobile).
