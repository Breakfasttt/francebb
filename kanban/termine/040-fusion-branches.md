---
id: 040
title: Rassembler les branches de travail dans development
epic: E02
app: site
depends_on: []
adr: 0004
verify: development contient toutes les branches refacto ; typecheck, lint, tests du site et test de connexion via le hub passent
---

# 040 — Rassembler les branches de travail dans development

## Pourquoi

Le travail des phases P3 à P5 était réparti sur 5 branches empilées les unes sur les autres. Réorganiser le projet par-dessus aurait créé des conflits sans fin. On réunit tout dans `development` avant de ranger.

## Action

1. Repères de retour arrière : tags `pre-reorg-dev` (ancien `development`) et `pre-reorg-p5` (ancienne dernière branche).
2. Intégrer le correctif de `development` (recherche de membres sans email) dans la pile, en gardant la version de la carte 033.
3. Avancer `development` jusqu'au bout de la pile, puis supprimer les branches `refacto/*` devenues inutiles.

## Résultat

`development` contient tout le travail P3 à P5 (monorepo, interface, hub). Branches `refacto/*` supprimées ; retour arrière possible via les tags `pre-reorg-dev` et `pre-reorg-p5`. Vérifié : site 35 tests sur 35, connexion via le hub 2 sur 2, typecheck des 3 paquets, lint au plafond (565).
