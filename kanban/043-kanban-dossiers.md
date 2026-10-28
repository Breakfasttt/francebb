---
id: 043
title: Kanban rangé en dossiers par état
status: ready
epic: E02
app: site
depends_on: [040]
adr: 0004
verify: chaque carte est dans le bon dossier ; la CI échoue si une carte est mal rangée
---

# 043 — Kanban rangé en dossiers par état

## Pourquoi

Les cartes forment une longue liste ; leur état est caché dans chaque fichier, et un tableau généré (`BOARD.md`) doit être tenu à jour.

## Action

Créer `kanban/a-faire/`, `en-cours/`, `termine/`, `annule/` (jamais réalisée, raison écrite) et `deprecie/` (terminée puis remplacée, carte de remplacement indiquée). Ranger chaque carte, retirer le champ `status` et `BOARD.md`. Remplacer `scripts/board.mjs` par une vérification simple (chaque carte dans un dossier valide, numéros uniques) lancée par la CI. Mettre à jour `kanban/README.md`, le hook `commit-msg`, `/card` et `/ship`.
