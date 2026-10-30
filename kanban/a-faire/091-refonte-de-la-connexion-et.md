---
id: 091
title: "Refonte de la connexion et de l'onboarding"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 6 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 091 — Refonte de la connexion et de l'onboarding

## Pourquoi

Refaire la connexion, la vérification de l'email, la page d'erreur et l'onboarding selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 6 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 6 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- L'onboarding reste en une seule page, découpée en blocs lisibles sur téléphone. Le paramètre `callbackUrl` est respecté.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.
