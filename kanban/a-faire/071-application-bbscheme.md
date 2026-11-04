---
id: 071
title: "Relancer l'éditeur BBScheme et le brancher sur le hub"
epic: E07
app: bbscheme
depends_on: [024, 035, 179]
adr: 0001
verify: l'éditeur BBScheme tourne dans l'application apps/bbscheme, connecté par le hub ; un schéma créé dans l'éditeur s'affiche dans un message du forum du site grâce au paquet bbscheme-player
---

# 071 — Relancer l'éditeur BBScheme et le brancher sur le hub

## Pourquoi

L'ADR 0001 prévoit que l'éditeur de schémas tactiques BBScheme devienne une application séparée du site, partageant la connexion des membres par le hub. La carte 024 a déjà sorti le lecteur dans `packages/bbscheme-player` ; il reste l'éditeur lui-même.

Mise à jour du 4 novembre 2026 (ADR-0008, carte 179) : l'application `apps/bbscheme` existe déjà, avec sa base (table `BBSchemeState`) et l'adresse de lecture `GET /api/boards/:id` utilisée par le site. L'éditeur y a été déplacé tel quel, en attente, dans `apps/bbscheme/editeur-en-attente/`. Cette carte devient donc « relancer l'éditeur et le brancher sur le hub ».

## Action

- Suivre `apps/bbscheme/editeur-en-attente/README.md` : remettre l'éditeur dans les pages servies, remplacer les imports du site, ajouter les dépendances de l'interface, servir les rosters (`public/data/roster` du site), rebrancher les tests.
- Brancher sa connexion sur le hub (carte 035 nécessaire, pour que le hub soit en ligne), et vider le créateur des schémas d'un compte supprimé en écoutant l'événement du hub.
- Dans le site : donner `editorUrl` au lecteur (bouton « Ouvrir dans l'éditeur »), remettre l'outil d'insertion de l'éditeur de messages, et rediriger l'ancienne adresse `/bbscheme` vers l'éditeur.
