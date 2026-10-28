---
id: 042
title: Nettoyer la racine et les fichiers morts
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

## Résultat

- Racine : suppression des copies locales `.env` et `dev.db` (identiques à celles de `apps/site`), de `e2e.db`, des fichiers de compilation, de `.next/`, `test-results/`, `backups/` (vide) et des journaux de `logs/`. Seul reste dans `logs/` le backup Turso de mai (données personnelles, jamais dans git), à supprimer par le user quand il le souhaite.
- `.env` : jamais commité (historique git vérifié).
- Pages d'essai supprimées : `/design-logo` (vitrine du logo, finalisé dans `SiteLogo`) et `/spike-tailwind` (essai de la carte 021), avec leurs tests.
- `prisma/seed.ts` (cassé : appelait `ts-node`, non installé) et `prisma/seedScript/referenceData.ts` (doublon de `firstSetup.ts`) supprimés ; `DEPLOY.md` corrigé.
- `.gitignore` réécrit et commenté en français.
- Gardés volontairement : `scripts/merge-to-master.ps1` et `.vscode/tasks.json` (outil du user), `seedScript/bbpusher.ts` et `legacyMembers.ts` (pas de doublon).
