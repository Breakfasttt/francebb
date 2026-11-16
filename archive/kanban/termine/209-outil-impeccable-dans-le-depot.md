---
id: 209
title: "Outil de conception Impeccable enregistré dans le dépôt"
epic:
app: projet
depends_on: [206]
verify: "le skill .claude/skills/impeccable et ses quatre agents (.claude/agents/impeccable-*.md) sont enregistrés dans git ; ils ne contiennent ni secret ni programme compilé ; la copie pour GitHub Copilot (.github/skills, .github/agents, .github/hooks) n'est pas enregistrée ; corepack pnpm check passe"
---

# 209 — Outil de conception Impeccable enregistré dans le dépôt

## Pourquoi

L'outil de conception Impeccable (aide de l'IA pour concevoir, auditer et corriger les écrans) a été installé dans le dépôt, puis utilisé pour les cartes 206 à 208. Ses fichiers n'étaient pas enregistrés dans git : une autre copie du projet ne l'avait pas, et `PRODUCT.md`, `DESIGN.md` et `.impeccable/config.json` y restaient sans l'outil qui les lit.

## Action

Enregistrer tels quels, sans les modifier, le skill `.claude/skills/impeccable/` (consignes, références, scripts) et ses quatre agents `.claude/agents/impeccable-*.md`, utilisés par Claude Code.

L'installation a aussi créé une copie pour GitHub Copilot (`.github/skills/impeccable/`, `.github/agents/`, `.github/hooks/`). Elle n'est pas enregistrée : le projet n'utilise pas Copilot, et son fichier `.github/hooks/impeccable.json` lancerait un programme automatiquement après chaque modification de fichier, pour toute personne qui clone le dépôt. Décision du responsable du projet : on la laisse hors du dépôt, et on la supprimera si elle ne sert pas.

## Résultat

Vérifié avant l'enregistrement : aucun secret, aucun programme compilé (le lanceur `scripts/impeccable` est un script shell qui télécharge son moteur au premier lancement, hors du dépôt) ; 2,3 mégaoctets, dont un index de polices de 1,1 mégaoctet.
