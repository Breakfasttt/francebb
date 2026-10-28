---
id: 048
title: Nettoyer le dossier .claude et renommer le conseil
epic: E02
app: site
depends_on: [043, 044]
adr: 0004
verify: plus aucune consigne périmée ; /card, /ship et /council fonctionnent
---

# 048 — Nettoyer le dossier .claude et renommer le conseil

## Pourquoi

Les consignes de l'IA contiennent des informations périmées (commandes npm, composants supprimés, procédures Turso), des textes en style télégraphique peu lisibles, et des noms d'agents qui ne disent pas leur rôle.

## Action

Renommer les agents : fact-checker → verificateur-faits, guardian → avocat-du-diable, visionary → visionnaire, player-advocate → voix-des-utilisateurs (garant de la règle mobile), moderator → arbitre ; mettre à jour `/council`. Réécrire `CLAUDE.md` en clair. Supprimer le skill `authjs` (1 100 lignes de doc générique). Réécrire en français clair `ui-components`, `theming-rules`, `mobile-ux`, `project-structure`. Corriger `blood-bowl-rules` (outils d'un autre assistant). Passer `settings.json` et les commandes à pnpm. Corriger le hook `block-deps` (déclenché à tort par `2>&1`). Aligner les CLAUDE.md de `apps/site`, `apps/hub`, `packages/ui`. Ajouter « vérifié sur téléphone » à la définition de terminé de `/ship`.
