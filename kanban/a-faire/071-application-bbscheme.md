---
id: 071
title: "Sortir l'éditeur BBScheme dans sa propre application"
epic: E07
app: bbscheme
depends_on: [024, 035]
adr: 0001
verify: l'éditeur BBScheme tourne comme application à part (apps/bbscheme), connecté par le hub ; un schéma créé dans l'éditeur s'affiche dans un message du forum du site grâce au paquet bbscheme-player
---

# 071 — Sortir l'éditeur BBScheme dans sa propre application

## Pourquoi

L'ADR 0001 prévoit que l'éditeur de schémas tactiques BBScheme devienne une application séparée du site, partageant la connexion des membres par le hub. La carte 024 a déjà sorti le lecteur dans `packages/bbscheme-player` ; il reste l'éditeur lui-même.

## Action

- Déplacer `apps/site/app/bbscheme/` (éditeur, modèle `BBSchemeState`, rosters de `public/data/roster`) dans une nouvelle application `apps/bbscheme`, en copiant le code à l'identique.
- Brancher sa connexion sur le hub (carte 035 nécessaire, pour que le hub soit en ligne).
- Laisser sur le site une redirection de `/bbscheme` vers la nouvelle adresse.
