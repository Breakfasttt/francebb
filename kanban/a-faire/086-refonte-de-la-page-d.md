---
id: 086
title: "Refonte de la page d'un sujet"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 3.3 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 086 — Refonte de la page d'un sujet

## Pourquoi

Refaire la page d'un sujet selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 3.3 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 3.3 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Sur téléphone, en-tête de message compact : avatar de 40 px, nom, rang, date. Les statistiques de l'auteur s'ouvrent dans une « fiche coach ».
- « Citer », « Répondre » et les réactions restent toujours visibles. Seules les actions rares passent dans le menu « ⋯ » : partager, signaler, marquer non lu, modifier, supprimer, modérer.
- Garder tous les états d'un message (supprimé, bloqué, banni, modéré), la signature, les blocs de tournoi, la pagination, le saut au premier non-lu et « aller au dernier message ».
- Panneau « Outils du sujet » : suivre, modifier le titre, signaler, gestion du tournoi, modération. Barre « Répondre » collée en bas de l'écran.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.
