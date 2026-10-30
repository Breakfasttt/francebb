---
id: 085
title: "Refonte des listes du forum"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 3.1, 3.2 et 3.9 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 085 — Refonte des listes du forum

## Pourquoi

Refaire l'accueil du forum, la page d'un forum et la liste des non-lus selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 3.1, 3.2 et 3.9 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 3.1, 3.2 et 3.9 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Afficher les sujets en lignes lisibles d'un coup d'œil, à la manière de Discourse : titre dominant, pastille de non-lu, avatar de l'auteur, nombre de réponses, dernière activité, statut de tournoi, épinglé, verrouillé.
- Garder les catégories repliables, les sous-forums, la pagination et le message affiché après une suppression.
- Sur téléphone, les actions de la colonne latérale passent dans une barre d'actions et dans « Cette page ».
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.
