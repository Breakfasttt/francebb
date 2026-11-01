---
id: E08
title: Refonte visuelle du site et du forum
phase: P7
---

# E08 — Refonte visuelle du site et du forum

Refaire entièrement la mise en page et l'ergonomie du site et du forum, en pensant d'abord au téléphone, selon les pratiques actuelles des forums et des sites communautaires. Le chantier ajoute un nouveau thème par défaut, sombre et sobre. Les 7 thèmes actuels restent disponibles et gardent leur esprit. **Aucune fonctionnalité ne doit disparaître.**

Choix déjà faits par le responsable du projet :
- sur téléphone, une barre de navigation en bas de l'écran, avec un onglet « Plus » ;
- un nouveau thème par défaut sombre et sobre ;
- d'abord le socle (couleurs, composants, navigation), puis la refonte écran par écran ;
- les bugs repérés pendant l'inventaire sont traités dans des cartes séparées.

## Ordre des cartes

La décision qui encadre le chantier est l'ADR 0006 (`docs/adr/0006-refonte-visuelle.md`).

| Étape | Cartes |
|---|---|
| Cadrage | 075 : inventaire, maquettes, décision écrite (ADR 0006) |
| Socle | 076 à 084 : essai de la barre basse, couleurs et thèmes, thème « Vestiaire » pour tous, police, cohabitation avec l'ancien CSS, nouvelle coquille, composants, bandeau du nouveau look, base des tests d'inventaire |
| Forum | 085 à 089 : listes, page d'un sujet, éditeur, recherche et modération, tournois |
| Site | 090 à 100 : accueil, connexion, profil, messagerie, ligues, articles, ressources, classement, quizz, modération et administration, BBScheme |
| Finition | 101 et 102 : suppression de l'ancien CSS, mise à jour des skills, captures des thèmes ; 114 : liste des tests manuels à dérouler sur un vrai téléphone |

Les bugs repérés pendant l'inventaire sont dans les cartes 103 à 108, rattachées à l'épic E01. Les bugs repérés pendant la refonte elle-même sont dans les cartes 109 à 113, 129 à 148 (épic E01) : ils seront traités une fois la refonte terminée, et la même règle vaut pour ceux qui seront trouvés ensuite.

## Terminé quand

- Toutes les lignes de `docs/refonte/inventaire.md` sont cochées, et chacune est vérifiée par un test Playwright d'inventaire, en taille ordinateur et en taille téléphone.
- Le CSS historique (`page.css`, `globals-mobile.css`, variables v1) a été supprimé.
- Les 8 thèmes ont un contraste AA, la norme d'accessibilité WCAG.
- La note Lighthouse sur téléphone est d'au moins 90.

## Bilan (carte 102)

**Ce qui a été fait.** Les cartes 075 à 101 sont terminées ; la carte 102 a remis la documentation à jour.
- Le site a une nouvelle coquille : sur téléphone, une barre de navigation en bas de l'écran et un panneau « Plus » ; sur ordinateur, une barre haute avec un menu « Plus ».
- Les 8 thèmes (« Vestiaire », thème de tout le monde, et les 7 thèmes historiques) n'utilisent plus que les variables v2 de `packages/ui`, et leur contraste AA est vérifié par `contraste.spec.ts`.
- Tous les écrans ont été refaits avec les composants de `packages/ui` et des classes Tailwind. L'ancien CSS, les variables v1, l'ancienne coquille et la variable `REFONTE` ont disparu (carte 101). Seule la page des mentions légales garde deux fichiers CSS, en attendant sa réécriture par le chantier RGPD.
- Chaque écran a son test d'inventaire, qui passe en taille ordinateur et en taille téléphone. Lighthouse sur téléphone donne entre 91 et 94 pour l'accueil, le forum, un sujet et les tournois ; le profil reste à 88, comme avant la refonte.
- Les skills (`theming-rules`, `ui-components`, `mobile-ux`, `reuse-first`, `project-structure`), le glossaire et les fiches de fonctionnalité décrivent la nouvelle interface (carte 102).

**Ce qui reste.**
- Carte 114 : dérouler à la main, sur un vrai téléphone, la liste des tests manuels de fin de refonte. L'épic ne sera fermé qu'après elle.
- Deux conditions de « Terminé quand » ne sont pas encore remplies : quatorze lignes de `docs/refonte/inventaire.md` ne sont pas cochées (liste dans le résultat de la carte 101), et la page du profil reste à 88 dans Lighthouse sur téléphone, sous le seuil de 90.
- Les bugs repérés pendant la refonte, cartes 109 à 113 et 129 à 148 (épic E01), à traiter une fois la refonte terminée.
