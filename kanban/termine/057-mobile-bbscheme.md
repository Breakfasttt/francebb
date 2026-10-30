---
id: 057
title: Mobile : BBScheme
epic: E03
app: site
depends_on: [049]
adr: 0004
verify: audit mobile : rien de coupé, 0 cible trop petite sur /bbscheme
---

# 057 — Mobile : BBScheme

## Pourquoi

L'éditeur BBScheme a une vraie interface mobile, mais un bouton d'outil est coupé de 18 px et plusieurs boutons font 35 à 40 px.

## Action

Revoir la barre d'outils mobile pour qu'aucun bouton ne soit coupé et que tous fassent au moins 44 px. Mettre à jour la fiche `docs/features/bbscheme`.

## Résultat

- **Barre d'outils** (règles dans `app/bbscheme/page-mobile.css`, ordinateur inchangé) : les boutons d'outils passent de 40 à 44 pixels, les flèches de défilement de 35 à 44 pixels de large, le curseur de zoom et le réglage de vitesse de 40 à 44 pixels de haut. La barre continue de défiler de gauche à droite dans son propre cadre : c'est la disposition la plus économe en hauteur, le terrain gardant ainsi toute la place. Pour qu'aucun outil ne paraisse coupé, l'outil le plus proche se cale sur le bord gauche après un glissement (« aimantation », propriété CSS `scroll-snap`) et un fondu sur les deux bords remplace la coupure nette de l'outil suivant, tout en montrant qu'il reste des outils à faire défiler. Une flèche fait maintenant défiler la barre d'un écran presque entier (fonction `scrollMobileToolbar` dans `page.tsx`, 100 pixels avant) et porte un nom lu par les lecteurs d'écran (« Outils précédents », « Outils suivants »).
- **Autres réglages** : le champ de vitesse passe à 16 pixels (l'iPhone ne zoome plus la page quand on tape dedans) ; la poignée du zoom passe de 18 à 24 pixels ; la croix qui ferme un panneau de réserve passe de 32 à 44 pixels ; dans ce panneau, la liste des rosters prend toute la largeur (elle coupait « Alliance du Vieux Monde ») et les textes font 12 pixels au moins (11 avant). Les deux icônes rouges de la barre utilisent la couleur du thème `var(--danger)` au lieu de `#ef4444` écrit en dur.
- **Travail d'un agent précédent** (patch non appliqué) : il rangeait les outils en plusieurs lignes et n'en montrait qu'une à la fois, les flèches passant d'une ligne à l'autre, avec un seuil de 768 pixels. Écarté : faire défiler verticalement avec des flèches horizontales est déroutant, et le seuil commun est 1024 pixels depuis la carte 055. Ont été repris : les tailles de 44 pixels, le champ de vitesse en 16 pixels et la croix des panneaux.
- **Audit mobile** (`tests/e2e/mobile-audit.spec.ts`) : il ne compte plus comme « coupé » un élément placé dans un cadre qui défile lui-même de gauche à droite (`overflow-x: auto`) : on l'atteint en faisant défiler ce cadre, ce que le skill `mobile-ux` autorise. Sans cette correction, l'outil caché derrière la flèche droite était compté comme coupé alors qu'il n'est pas affiché. Aucune autre page n'a changé de résultat.
- **Mesures** (360, 390 et 430 pixels ; barre au début, après une flèche, au bout ; panneau de réserve vide puis avec un roster) : avant, 6 à 7 cibles trop petites et 1 élément coupé sur `/bbscheme`, plus un champ de saisie sous 16 pixels et le texte « Réserve équipe bleue » à 11 pixels ; après, 0 partout. Aucun défilement horizontal de la page. Barre vérifiée dans les 7 thèmes à 390 pixels. Audit complet : 33 cibles trop petites au total avant, 20 après ; 8 éléments coupés avant, 6 après (les tuiles de `/carte`, faux positif connu). Captures et relevés dans `logs/057-mobile/avant/`, `logs/057-mobile/apres/`, `audit-avant.json` et `audit-apres.json`.
- **Vérifications** : types, 0 erreur ; ESLint, 551 erreurs, égal au plafond ; tests de bout en bout, 52 réussis et 1 ignoré volontairement (l'audit), dont les captures ordinateur des 7 thèmes.
- **Non traité** : le décalage fixe de 168 pixels sous la barre de navigation (signalé dans la fiche), le zoom à deux doigts et le lecteur `BBSchemePlayer` dans les messages.
