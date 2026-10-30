---
id: 087
title: "Refonte de l'éditeur de message"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 2, 3.4, 3.5 et 3.6 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 087 — Refonte de l'éditeur de message

## Pourquoi

Refaire l'éditeur BBCode et les écrans de rédaction du forum (réponse rapide, réponse, modification, nouveau sujet) selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 2, 3.4, 3.5 et 3.6 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 2, 3.4, 3.5 et 3.6 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Afficher les outils les plus utilisés et ranger tous les autres dans un panneau « + » groupé. Aucun outil ne disparaît : les 20 outils, `@` pour mentionner, Échap, l'aperçu et l'assistant IA restent.
- Éditeur en plein écran sur téléphone, sans que la barre basse ni le clavier cachent la zone de texte.
- Garder l'attribut `name` de la zone de texte et l'événement `bbcode-insert-text`.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.
