---
id: 092
title: "Refonte du profil et des membres"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 7 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 092 — Refonte du profil et des membres

## Pourquoi

Refaire `/profile` (7 onglets), `/spy/[id]` et `/membres` selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 7 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 7 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Onglets gardés dans l'adresse (`?tab=`). Sur téléphone, liste d'onglets en haut de page plutôt que dans le menu.
- Annuaire des membres en cartes sur téléphone, avec filtres et tri dans un panneau.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.
