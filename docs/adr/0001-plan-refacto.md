# ADR-0001 — Plan de refacto BBFrance (P0 → P6)

- **Statut** : accepté
- **Date** : 2026-10-28
- **Conseil** : oui (Factuel, Prudent, Visionnaire, Empathique, Synthétiseur sur un brouillon v0)

## Contexte

~42k lignes TS + 19k CSS, 43 modèles Prisma, aucun test ni CI au départ, prod alpha minuscule (9 users) : fenêtre idéale pour découper.
Objectifs : contrôler le dev par IA, réutiliser avant créer, pas de lib redondante, UI basée sur une librairie, site et forum fluides, hub d'identité SSO séparé (API + widget, profil unique de Blood Bowler), découpage en services (site+forum, bbscheme, futurs).
Audit : routes API sans auth, ban vérifié côté client seulement, `force-dynamic` + relecture BDD à chaque `auth()`, forum sans pagination côté requêtes, ~1100 styles inline, ~400 hex, 2 systèmes de toast, prod en `db push`.

## Décision

Sept phases, chacune revert-able et livrée par cartes (`kanban/`) :

| Phase | Épic | Contenu |
|---|---|---|
| P0 | E01 | Failles, smoke Playwright, CI, baseline (`docs/baseline.md`) |
| P1 | E02 | Gouvernance IA (kanban, ADR, conseil, hooks, skills), baseline migrations Prisma |
| P2 | E03 | Perf forum mobile d'abord |
| P3 | E04 | Monorepo pnpm + Turborepo, app déplacée telle quelle en `apps/site` |
| P4 | E05 | shadcn/ui + Tailwind v4 (spike A : CSS legacy en `@layer`), les 7 thèmes restent l'esthétique |
| P5 | E06 | Hub SSO Better Auth + OIDC (spike B), `User` du site gardé en projection locale + `hubUserId` |
| P6 | E07 | BBScheme en app + `packages/bbscheme-player` |

## Pourquoi

- Filet (tests, CI, baseline) avant tout refacto : sans lui, l'IA casse en silence.
- Perf avant monorepo/UI : victoire visible pour les coachs, mesurable contre la baseline.
- Hub en dernier : il dépend du monorepo et d'un spike ; bbscheme est son 2e client réel.
- Domaine parent commun obligatoire pour le SSO (sinon ITP Safari casse le SSO silencieux).
- pnpm : le mode strict casse dès qu'un package utilise une dépendance non déclarée = garde-fou des frontières.

## Ce qu'on ne fait pas

Extraire bbquizz/tournois (soudés au forum), multi-tenant, SDK npm public, micro-frontends, event bus, éditeur Tiptap (plus tard via un AST BBCode). `allowDangerousEmailAccountLinking` banni : liaison de comptes seulement si email vérifié.

## Risques

Re-login unique au passage au hub · plugin OIDC Better Auth mouvant (spike + ADR) · next-auth beta jusqu'à P5 · tests = smoke seulement · CSS legacy cohabite en layer pendant P4 · bus factor 1 · coût tokens du conseil borné aux décisions irréversibles.
Règles : 1 PR = 1 sujet revert-able, flags par variable d'env, backup Turso testé avant toute opération qui écrit en prod (schéma, auth).

## Cartes

Toutes les cartes 001 → 024 (`kanban/BOARD.md`).
