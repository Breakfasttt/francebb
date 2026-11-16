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

## Résultat

- Agents du conseil renommés et réécrits : `verificateur-faits`, `avocat-du-diable`, `visionnaire`, `voix-des-utilisateurs` (garante des deux règles absolues), `arbitre`. Chacun applique la règle « tout compréhensible ».
- `/council`, `/card`, `/ship` réécrits en clair. `/ship` exige la vérification en taille téléphone.
- `.claude/CLAUDE.md` réécrit : consignes propres à l'IA uniquement, renvois vers README, ARCHITECTURE, kanban, glossaire.
- Skills `ui-components`, `theming-rules`, `mobile-ux`, `project-structure`, `blood-bowl-rules`, `database-ops` réécrits en français clair (plus de style télégraphique, chemins corrigés). Skill `authjs` (1 149 lignes de doc générique) supprimé. Note BBFrance en tête du skill `shadcn`.
- Hook `block-deps` corrigé (ne prend plus `2>&1` pour un nom de paquet), testé. `settings.json` : autorisations `npm run` remplacées par pnpm, interdictions de `migrate reset` étendues à `pnpm exec`.
- `CLAUDE.md` de `apps/site`, `apps/hub`, `packages/ui` réécrits en phrases complètes.
- Modèle d'ADR (`docs/adr/TEMPLATE.md`) aligné sur le format simple de l'ADR-0004.
