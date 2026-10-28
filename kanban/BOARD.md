# Board

> Généré par `npm run board` depuis le frontmatter des cartes — ne pas éditer.

## Épics

| Épic | Phase | Avancement | Cartes ouvertes |
|---|---|---|---|
| [E01 — Sécurité, filet de tests, baseline](epics/E01-filet-securite.md) | P0 | 4/4 | — |
| [E02 — Gouvernance du dev IA](epics/E02-gouvernance-ia.md) | P1 | 6/11 | [011](011-backup-prod.md) [012](012-baseline-prisma.md) [025](025-spike-migrate-turso.md) [026](026-script-db-deploy.md) [027](027-ci-migrations.md) |
| [E03 — Performance, forum mobile d'abord](epics/E03-perf-forum.md) | P2 | 2/8 | [015](015-forum-liste.md) [016](016-forum-topic.md) [017](017-layout-dynamique.md) [018](018-cache-components.md) [019](019-images-bundles.md) [020](020-n-plus-un.md) |
| [E04 — Monorepo pnpm + Turborepo](epics/E04-monorepo.md) | P3 | 0/1 | [023](023-monorepo.md) |
| [E05 — UI shadcn/ui + Tailwind v4](epics/E05-ui-shadcn.md) | P4 | 0/2 | [013](013-eslint-archi.md) [021](021-spike-tailwind-layer.md) |
| [E06 — Hub d'identité SSO (Better Auth + OIDC)](epics/E06-hub-sso.md) | P5 | 0/1 | [022](022-spike-better-auth.md) |
| [E07 — BBScheme en app séparée](epics/E07-bbscheme.md) | P6 | 0/1 | [024](024-extraction-bbscheme.md) |

## Prêtes (4)

| Carte | Titre | Épic | Bloquée par | ADR |
|---|---|---|---|---|
| [011](011-backup-prod.md) | Backup Turso prod + restauration testée | E02 | — | — |
| [012](012-baseline-prisma.md) | Baseline des migrations Prisma en prod | E02 | 011, 025 | 0002 |
| [025](025-spike-migrate-turso.md) | Spike : Prisma Migrate contre une copie Turso | E02 | 011 | 0002 |
| [027](027-ci-migrations.md) | CI : migrations à jour du schéma | E02 | 012 | 0002 |

## À raffiner (12)

| Carte | Titre | Épic | Bloquée par | ADR |
|---|---|---|---|---|
| [013](013-eslint-archi.md) | Règles ESLint d'architecture | E05 | — | — |
| [015](015-forum-liste.md) | Liste d'un forum : count isArchived + Promise.all | E03 | — | — |
| [016](016-forum-topic.md) | Page topic : include factorisé, forums de déplacement si modo | E03 | — | — |
| [017](017-layout-dynamique.md) | Layout sans force-dynamic + jwt throttlé | E03 | — | — |
| [018](018-cache-components.md) | Activer cacheComponents | E03 | 017 | — |
| [019](019-images-bundles.md) | next/image + import dynamique html2canvas/gifshot | E03 | — | — |
| [020](020-n-plus-un.md) | Supprimer les N+1 forum et tournois | E03 | — | — |
| [021](021-spike-tailwind-layer.md) | Spike A : CSS legacy en @layer sous Tailwind v4 | E05 | 023 | — |
| [022](022-spike-better-auth.md) | Spike B : Better Auth OIDC + Prisma 7 + Turso | E06 | 023 | — |
| [023](023-monorepo.md) | Passage monorepo pnpm + Turborepo | E04 | — | — |
| [024](024-extraction-bbscheme.md) | Extraire bbscheme en app + packages/bbscheme-player | E07 | 022 | — |
| [026](026-script-db-deploy.md) | Script npm run db:deploy | E02 | 025, 012 | 0002 |

## Terminées (12)

| Carte | Titre | Épic | Bloquée par | ADR |
|---|---|---|---|---|
| [001](001-routes-api-sans-auth.md) | Supprimer les routes API user sans auth | E01 | — | — |
| [002](002-ban-cote-serveur.md) | Bloquer les bannis côté serveur | E01 | — | — |
| [003](003-smoke-ci.md) | Tests smoke Playwright + CI GitHub | E01 | — | — |
| [004](004-baseline.md) | Baseline perf et dette | E01 | — | — |
| [005](005-kanban-board.md) | Kanban à frontmatter + BOARD.md généré | E02 | — | 0001 |
| [006](006-adr-features.md) | ADR et README de feature | E02 | — | 0001 |
| [007](007-conseil-agents.md) | Conseil des 5 agents + commandes | E02 | — | 0001 |
| [008](008-hooks-claude.md) | Hooks Claude : block-deps + lint-edited | E02 | — | 0001 |
| [009](009-skills-claude-md.md) | Skills consolidés + CLAUDE.md court + ARCHITECTURE.md | E02 | — | 0001 |
| [010](010-commit-msg.md) | Hook git commit-msg | E02 | — | 0001 |
| [014](014-forum-index.md) | Forum index : requêtes bornées et cache non indexé par user | E03 | — | — |
| [028](028-acces-roles-forum.md) | Accès forum par rôle (allowedRoles) pour les membres connectés | E03 | — | — |
