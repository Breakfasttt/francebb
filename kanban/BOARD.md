# Board

> Généré par `npm run board` depuis le frontmatter des cartes — ne pas éditer.

## Épics

| Épic | Phase | Avancement | Cartes ouvertes |
|---|---|---|---|
| [E01 — Sécurité, filet de tests, baseline](epics/E01-filet-securite.md) | P0 | 4/4 | — |
| [E02 — Gouvernance du dev IA](epics/E02-gouvernance-ia.md) | P1 | 10/17 | [041](041-essai-postgres.md) [043](043-kanban-dossiers.md) [044](044-readme-glossaire.md) [045](045-fiches-fonctionnalites.md) [046](046-bascule-postgres.md) [047](047-mise-en-production-postgres.md) [048](048-nettoyage-claude.md) |
| [E03 — Performance, forum mobile d'abord](epics/E03-perf-forum.md) | P2 | 5/9 | [017](017-layout-dynamique.md) [018](018-cache-components.md) [019](019-images-bundles.md) [049](049-audit-mobile.md) |
| [E04 — Monorepo pnpm + Turborepo](epics/E04-monorepo.md) | P3 | 1/1 | — |
| [E05 — UI shadcn/ui + Tailwind v4](epics/E05-ui-shadcn.md) | P4 | 6/7 | [013](013-eslint-archi.md) |
| [E06 — Hub d'identité SSO (Better Auth + OIDC)](epics/E06-hub-sso.md) | P5 | 1/6 | [035](035-hub-deploiement.md) [036](036-hub-migration-comptes.md) [037](037-hub-ban-deconnexion.md) [038](038-hub-liens-magiques.md) [039](039-widget-bbaccount.md) |
| [E07 — BBScheme en app séparée](epics/E07-bbscheme.md) | P6 | 0/1 | [024](024-extraction-bbscheme.md) |

## Prêtes (9)

| Carte | Titre | Épic | Bloquée par | ADR |
|---|---|---|---|---|
| [019](019-images-bundles.md) | next/image + import dynamique html2canvas/gifshot | E03 | — | — |
| [041](041-essai-postgres.md) | Essai Postgres sur Neon (4 h maximum) | E02 | — | 0004 |
| [043](043-kanban-dossiers.md) | Kanban rangé en dossiers par état | E02 | — | 0004 |
| [044](044-readme-glossaire.md) | README d'entrée, glossaire, une règle à un seul endroit | E02 | — | 0004 |
| [045](045-fiches-fonctionnalites.md) | Une fiche par fonctionnalité dans docs/features | E02 | 044 | 0004 |
| [046](046-bascule-postgres.md) | Passer le site et le hub sur Postgres | E02 | 041 | 0004 |
| [047](047-mise-en-production-postgres.md) | Mise en production sur les nouvelles bases | E02 | 046 | 0004 |
| [048](048-nettoyage-claude.md) | Nettoyer le dossier .claude et renommer le conseil | E02 | 043, 044 | 0004 |
| [049](049-audit-mobile.md) | Audit mobile de toutes les pages et tests sur téléphone | E03 | — | 0004 |

## À raffiner (9)

| Carte | Titre | Épic | Bloquée par | ADR |
|---|---|---|---|---|
| [013](013-eslint-archi.md) | Règles ESLint d'architecture | E05 | — | — |
| [017](017-layout-dynamique.md) | Layout sans force-dynamic + jwt throttlé | E03 | — | — |
| [018](018-cache-components.md) | Activer cacheComponents | E03 | 017 | — |
| [024](024-extraction-bbscheme.md) | Extraire bbscheme en app + packages/bbscheme-player | E07 | — | — |
| [035](035-hub-deploiement.md) | Déployer le hub sur un domaine parent commun | E06 | — | 0003 |
| [036](036-hub-migration-comptes.md) | Migrer les 9 comptes vers le hub | E06 | 035, 011 | 0003 |
| [037](037-hub-ban-deconnexion.md) | Ban global et déconnexion propagés | E06 | — | 0003 |
| [038](038-hub-liens-magiques.md) | Envoi des liens magiques du hub | E06 | — | 0003 |
| [039](039-widget-bbaccount.md) | Widget <BBAccount/> et packages/auth-client | E06 | 035 | 0003 |

## Terminées (27)

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
| [015](015-forum-liste.md) | Liste d'un forum : count isArchived + Promise.all | E03 | — | — |
| [016](016-forum-topic.md) | Page topic : include factorisé, forums de déplacement si modo | E03 | — | — |
| [020](020-n-plus-un.md) | Supprimer les N+1 forum et tournois | E03 | — | — |
| [021](021-spike-tailwind-layer.md) | Spike A : CSS legacy en @layer sous Tailwind v4 | E05 | — | — |
| [022](022-spike-better-auth.md) | Spike B : Better Auth OIDC + Prisma 7 + Turso | E06 | — | 0003 |
| [023](023-monorepo.md) | Passage monorepo pnpm + Turborepo | E04 | — | — |
| [027](027-ci-migrations.md) | CI : migrations à jour du schéma | E02 | — | 0002 |
| [028](028-acces-roles-forum.md) | Accès forum par rôle (allowedRoles) pour les membres connectés | E03 | — | — |
| [029](029-nettoyage-repo.md) | Nettoyage du repo (fichiers morts, scripts ponctuels, secrets) | E02 | — | 0001 |
| [030](030-packages-ui.md) | Socle packages/ui (shadcn) + pont des tokens | E05 | — | 0001 |
| [031](031-toasts-sonner.md) | Un seul système de toast (sonner) | E05 | — | 0001 |
| [032](032-modales-dialog.md) | Modales sur Radix Dialog | E05 | — | 0001 |
| [033](033-recherche-users.md) | Une seule recherche d'utilisateurs + useDebounce | E05 | — | 0001 |
| [034](034-boutons-types.md) | Boutons sans @ts-ignore | E05 | — | 0001 |
| [040](040-fusion-branches.md) | Rassembler les branches de travail dans development | E02 | — | 0004 |
| [042](042-nettoyage-racine.md) | Nettoyer la racine et les fichiers morts | E02 | — | 0004 |

## Annulées (4)

| Carte | Titre | Épic | Bloquée par | ADR |
|---|---|---|---|---|
| [011](011-backup-prod.md) | Backup Turso prod + restauration testée | E02 | — | — |
| [012](012-baseline-prisma.md) | Baseline des migrations Prisma en prod | E02 | — | 0002 |
| [025](025-spike-migrate-turso.md) | Spike : Prisma Migrate contre une copie Turso | E02 | — | 0002 |
| [026](026-script-db-deploy.md) | Script npm run db:deploy | E02 | — | 0002 |
