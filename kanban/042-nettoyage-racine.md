---
id: 042
title: Nettoyer la racine et les fichiers morts
status: ready
epic: E02
app: site
depends_on: [040]
adr: 0004
verify: la racine ne contient que des éléments utiles et expliqués dans le README ; tests verts
---

# 042 — Nettoyer la racine et les fichiers morts

## Pourquoi

La racine du projet contient des fichiers qui n'ont rien à y faire : copies de base de données, journaux, résultats de tests, fichiers de compilation.

## Action

Supprimer ou déplacer : `dev.db` et `e2e.db` en double à la racine, `logs/`, `backups/` vide, `test-results/`, fichiers de compilation à la racine ; pages d'essai (`app/spike-tailwind`, `app/design-logo` si inutilisée) ; vérifier qu'aucun fichier `.env` n'a jamais été commité. Ne pas toucher `liste-blessures*.md` (fichiers personnels).
